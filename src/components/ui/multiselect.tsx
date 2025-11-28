"use client";

import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { label: string; value: string | number }[];
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  maxDisplay?: number;
  // FormControl bridge props
  id?: string;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(function MultiSelect(
  {
    options,
    value = [],
    onChange,
    placeholder = "Select items...",
    className,
    disabled = false,
    size = "default",
    maxDisplay = 3,
    id,
    onBlur,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  },
  ref,
) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const handleToggle = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const handleRemove = (optionValue: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== optionValue));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const displayedOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = selectedOptions.length - maxDisplay;

  return (
    <div className="relative">
      {/* biome-ignore lint/a11y/useSemanticElements: Using div instead of button to allow nested interactive elements (remove/clear buttons) */}
      <div
        ref={(node) => {
          // Chain refs so both internal logic and RHF/FormControl can access the trigger
          // External ref from forwardRef
          if (typeof ref === "function") ref(node as HTMLDivElement);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          // Internal trigger ref
          (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }
        }}
        onBlur={onBlur}
        aria-disabled={disabled}
        aria-expanded={isOpen}
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full min-h-9 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          size === "sm" && "min-h-8",
          className,
        )}
        data-placeholder={selectedOptions.length === 0 ? "true" : undefined}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <>
              {displayedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <span className="truncate max-w-[150px]">{option.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(option.value, e)}
                    className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 transition-colors"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  +{remainingCount} more
                </Badge>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:bg-secondary rounded-sm p-0.5 transition-colors"
            >
              <XIcon className="size-4 opacity-50" />
            </button>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 opacity-50 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </div>

      <div
        ref={contentRef}
        data-state={isOpen ? "open" : "closed"}
        data-side="bottom"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 absolute z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md origin-top",
          "data-[state=closed]:pointer-events-none data-[state=closed]:invisible",
          "mt-1 max-h-60 w-full",
          "p-1",
        )}
      >
        {options.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No options available
          </div>
        ) : (
          options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggle(option.value)}
                className={cn(
                  "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && (
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
export type { MultiSelectProps };
