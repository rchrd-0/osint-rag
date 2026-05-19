import type { QueryStrategy } from "@osint-rag/schemas";
import { Button } from "@osint-rag/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@osint-rag/ui/components/dropdown-menu";
import { cn } from "@osint-rag/ui/lib/utils";
import { CaretDownIcon, GraphIcon, TextAlignLeftIcon } from "@phosphor-icons/react";

export type RagRetrievalStrategy = Extract<QueryStrategy, "fts" | "vector">;

const STRATEGY_OPTIONS: {
  value: RagRetrievalStrategy;
  label: string;
  description: string;
  icon: typeof TextAlignLeftIcon;
}[] = [
  {
    value: "fts",
    label: "Full-text",
    description: "Keyword match",
    icon: TextAlignLeftIcon,
  },
  {
    value: "vector",
    label: "Vector",
    description: "Semantic match",
    icon: GraphIcon,
  },
];

type RagStrategySelectorProps = {
  value: RagRetrievalStrategy;
  onChange: (strategy: RagRetrievalStrategy) => void;
  disabled?: boolean;
  className?: string;
};

export const RagStrategySelector = ({
  value,
  onChange,
  disabled,
  className,
}: RagStrategySelectorProps) => {
  const selected = STRATEGY_OPTIONS.find((option) => option.value === value) ?? STRATEGY_OPTIONS[1];
  const SelectedIcon = selected.icon;

  const handleStrategyChange = (nextValue: string | null) => {
    if (nextValue === "fts" || nextValue === "vector") {
      onChange(nextValue);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 border-primary/25 bg-primary/5 text-foreground hover:bg-primary/10",
              className,
            )}
          />
        }
      >
        <SelectedIcon className="size-4" />
        <span>{selected.label}</span>
        <CaretDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Retrieval</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={handleStrategyChange}>
            {STRATEGY_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  closeOnClick
                  className="cursor-pointer"
                >
                  <Icon />
                  <span className="flex flex-col gap-0.5">
                    <span>{option.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-none">
                      {option.description}
                    </span>
                  </span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
