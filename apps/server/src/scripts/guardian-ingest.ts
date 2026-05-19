import prisma, { Prisma } from "@osint-rag/db";
import { env } from "@osint-rag/env/server";

type GuardianApiResponse<T> = {
  response?: {
    status?: string;
    // /search
    total?: number;
    startIndex?: number;
    pageSize?: number;
    currentPage?: number;
    pages?: number;
    orderBy?: string;
  } & T;
};

type GuardianArticle = {
  id?: string;
  webTitle?: string;
  webUrl?: string;
  webPublicationDate?: string;
  sectionId?: string;
  sectionName?: string;
  fields?: {
    byline?: string;
    bodyText?: string;
  };
};

type GuardianDocumentInsert = {
  title: string;
  sourceType: "guardian";
  sourceName: string | null;
  author: string | null;
  url: string | null;
  externalId: string;
  rawText: string;
  publishedAt: Date | null;
};

type GuardianSearchOptions = {
  query: string;
  pageSize: number;
  fromDate?: string;
  maxPages: number;
};

type GuardianSearchPageResult = {
  results: GuardianArticle[];
  currentPage: number;
  totalPages: number;
  total: number;
};

const GUARDIAN_API_BASE_URL = "https://content.guardianapis.com";
const DEFAULT_SEARCH_QUERY = "ai OR economy OR hong kong OR film OR cinema";
const DEFAULT_PAGE_SIZE = 200;
const DEFAULT_MAX_PAGES = 2;
const GUARDIAN_MAX_PAGE_SIZE = 200;
const GUARDIAN_MAX_PAGES = 200;

const getUrlBase = (targetUrl: string = GUARDIAN_API_BASE_URL) => {
  const url = new URL(targetUrl);
  url.searchParams.set("api-key", env.GUARDIAN_API_KEY);

  return url;
};

const parseGuardianCliOptions = (): GuardianSearchOptions => {
  const options: GuardianSearchOptions = {
    query: DEFAULT_SEARCH_QUERY,
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
  };

  const args = process.argv.slice(2);

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: bun run src/scripts/guardian-ingest.ts [options]

Options:
  --query, -q         Guardian search query
  --page-size, -p     Results per page (max ${GUARDIAN_MAX_PAGE_SIZE})
  --max-pages, -m     Pages to fetch (max ${GUARDIAN_MAX_PAGES}, default ${DEFAULT_MAX_PAGES})
  --from-date         Optional from-date filter (YYYY-MM-DD)
`);
      process.exit(0);
    }

    const nextValue = args[index + 1];

    if ((arg === "--query" || arg === "-q") && nextValue) {
      options.query = nextValue;
      index += 1;
      continue;
    }

    if ((arg === "--page-size" || arg === "-p") && nextValue) {
      const parsedPageSize = Number(nextValue);

      if (!Number.isInteger(parsedPageSize) || parsedPageSize <= 0) {
        throw new Error(`Invalid page size: ${nextValue}`);
      }

      options.pageSize = parsedPageSize;
      index += 1;
      continue;
    }

    if (arg === "--from-date" && nextValue) {
      options.fromDate = nextValue;
      index += 1;
      continue;
    }

    if ((arg === "--max-pages" || arg === "-m") && nextValue) {
      const parsedMaxPages = Number(nextValue);

      if (!Number.isInteger(parsedMaxPages) || parsedMaxPages <= 0) {
        throw new Error(`Invalid max pages: ${nextValue}`);
      }

      options.maxPages = parsedMaxPages;
      index += 1;
      continue;
    }

    throw new Error(`Unknown or incomplete argument: ${arg}`);
  }

  return options;
};

const clampGuardianSearchOptions = ({
  pageSize,
  maxPages,
  ...rest
}: GuardianSearchOptions): GuardianSearchOptions => ({
  ...rest,
  pageSize: Math.min(pageSize, GUARDIAN_MAX_PAGE_SIZE),
  maxPages: Math.min(maxPages, GUARDIAN_MAX_PAGES),
});

export const searchGuardianArticlesPage = async ({
  query,
  pageSize,
  fromDate,
  page,
}: Omit<GuardianSearchOptions, "maxPages"> & {
  page: number;
}): Promise<GuardianSearchPageResult> => {
  const url = getUrlBase();
  url.pathname = "/search";
  url.searchParams.set("q", query);
  url.searchParams.set("show-fields", "byline,bodyText");
  url.searchParams.set("page-size", String(pageSize));
  url.searchParams.set("page", String(page));
  if (fromDate) {
    url.searchParams.set("from-date", fromDate);
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to fetch from The Guardian: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as GuardianApiResponse<{ results?: GuardianArticle[] }>;
  const responseMeta = data?.response;
  const results = responseMeta?.results;
  if (!results) {
    throw new Error("Invalid Guardian API response: missing response.results");
  }

  const currentPage = responseMeta.currentPage ?? page;
  const totalPages = responseMeta.pages ?? currentPage;
  const total = responseMeta.total ?? results.length;

  return {
    results,
    currentPage,
    totalPages,
    total,
  };
};

export const searchGuardianArticles = async (
  options: GuardianSearchOptions,
): Promise<GuardianArticle[]> => {
  const { maxPages, pageSize, ...searchOptions } = clampGuardianSearchOptions(options);
  const articles: GuardianArticle[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const pageResult = await searchGuardianArticlesPage({
      ...searchOptions,
      pageSize,
      page,
    });

    articles.push(...pageResult.results);

    if (pageResult.currentPage >= pageResult.totalPages) {
      break;
    }
  }

  return articles;
};

// single item fetch
export const fetchGuardianArticle = async (apiUrl: string): Promise<GuardianArticle> => {
  const url = getUrlBase(apiUrl);
  url.searchParams.set("show-fields", "byline,bodyText");

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to fetch from The Guardian: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as GuardianApiResponse<{ content?: GuardianArticle }>;
  const content = data?.response?.content;
  if (!content) {
    throw new Error("Invalid Guardian API response: missing response.content");
  }

  return content;
};

export const mapGuardianDocument = (article: GuardianArticle): GuardianDocumentInsert | null => {
  if (!article.id || !article.webTitle || !article.fields?.bodyText?.trim()) {
    return null;
  }

  const externalId = article.id;
  const parsedDate = article.webPublicationDate ? new Date(article.webPublicationDate) : null;
  const publishedAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

  return {
    title: article.webTitle,
    sourceName: "The Guardian",
    sourceType: "guardian",
    author: article.fields.byline ?? null,
    url: article.webUrl ?? null,
    externalId,
    rawText: article.fields.bodyText.trim(),
    publishedAt,
  };
};

// remove on scale
export const documentExists = async (sourceType: string, externalId: string): Promise<boolean> => {
  const doc = await prisma.document.findUnique({
    where: {
      sourceType_externalId: {
        sourceType,
        externalId,
      },
    },
  });

  return doc !== null;
};

export const insertGuardianDocument = async (data: GuardianDocumentInsert) => {
  try {
    return await prisma.document.create({ data });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }

    throw error;
  }
};

export const runGuardianIngest = async (options: GuardianSearchOptions): Promise<void> => {
  const { maxPages, pageSize, ...searchOptions } = clampGuardianSearchOptions(options);

  console.log(
    `Guardian ingest config\n\nQuery: ${searchOptions.query}\nPage size: ${pageSize}\nMax pages: ${maxPages}\nFrom date: ${searchOptions.fromDate ?? "-"}\n`,
  );

  let found = 0;
  let invalid = 0;
  let duplicates = 0;
  let inserted = 0;
  let failed = 0;
  let totalAvailable = 0;
  let totalPagesAvailable = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const pageResult = await searchGuardianArticlesPage({
      ...searchOptions,
      pageSize,
      page,
    });

    if (page === 1) {
      totalAvailable = pageResult.total;
      totalPagesAvailable = pageResult.totalPages;
      const pagesToFetch = Math.min(maxPages, totalPagesAvailable);

      console.log(
        `Found ${totalAvailable} articles across ${totalPagesAvailable} pages (fetching up to ${pagesToFetch})\n`,
      );
    }

    const pageLabel = `${pageResult.currentPage}/${Math.min(maxPages, totalPagesAvailable)}`;
    console.log(`Page ${pageLabel}: processing ${pageResult.results.length} articles`);

    found += pageResult.results.length;

    for (const article of pageResult.results) {
      const mapped = mapGuardianDocument(article);
      if (!mapped) {
        console.warn(`Skipping article with ID ${article.id} due to missing required fields.`);

        invalid += 1;
        continue;
      }

      try {
        const exists = await documentExists(mapped.sourceType, mapped.externalId);
        if (exists) {
          duplicates += 1;
          continue;
        }

        const newDocument = await insertGuardianDocument(mapped);

        if (!newDocument) {
          duplicates += 1;
        } else {
          inserted += 1;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`${article.id}: failed - `, errorMessage);
        failed += 1;
      }
    }

    if (pageResult.currentPage >= pageResult.totalPages) {
      break;
    }
  }

  console.log(
    `Guardian ingest done

Fetched:    ${found}
Inserted:   ${inserted}
Duplicates: ${duplicates}
Invalid:    ${invalid}
Failed:     ${failed}
`,
  );
};

const cliOptions = parseGuardianCliOptions();

await runGuardianIngest(cliOptions)
  .catch((error) => {
    console.error("Guardian ingest failed: ", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
