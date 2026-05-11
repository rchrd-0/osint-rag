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

const GUARDIAN_API_BASE_URL = "https://content.guardianapis.com";
const SEARCH_QUERY = "ai OR economy";

const getUrlBase = (targetUrl: string = GUARDIAN_API_BASE_URL) => {
  const url = new URL(targetUrl);
  url.searchParams.set("api-key", env.GUARDIAN_API_KEY);

  return url;
};

export const searchGuardianArticles = async (fromDate?: string) => {
  const url = getUrlBase();
  url.pathname = "/search";
  url.searchParams.set("q", SEARCH_QUERY);
  url.searchParams.set("show-fields", "byline,bodyText");
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
  const results = data?.response?.results;
  if (!results) {
    throw new Error("Invalid Guardian API response: missing response.results");
  }

  return results;
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

export const runGuardianIngest = async (): Promise<void> => {
  const articles = await searchGuardianArticles();

  const found = articles.length;
  console.log(`Found ${found} articles from The Guardian\n`);

  let invalid = 0;
  let duplicates = 0;
  let inserted = 0;
  let failed = 0;

  for (const article of articles) {
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

  console.log(
    `Guardian ingest done

Inserted:   ${inserted}
Duplicates: ${duplicates}
Invalid:    ${invalid}
Failed:     ${failed}
`,
  );
};

await runGuardianIngest()
  .catch((error) => {
    console.error("Guardian ingest failed: ", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
