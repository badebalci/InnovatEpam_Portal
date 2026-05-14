interface StarRatingProps {
  value: number;        // 1–5
  onChange?: (v: number) => void; // omit for read-only
  disabled?: boolean;
  size?: "sm" | "md";
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = "md",
}: StarRatingProps) {
  const readOnly = !onChange;
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div
      className="flex gap-0.5"
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly || disabled}
            onClick={() => onChange?.(star)}
            className={[
              starSize,
              "transition-colors focus:outline-none",
              readOnly || disabled
                ? "cursor-default"
                : "cursor-pointer hover:scale-110",
              filled
                ? "text-amber-400"
                : readOnly
                  ? "text-muted-foreground/30"
                  : "text-muted-foreground/40 hover:text-amber-300",
            ].join(" ")}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <svg
              viewBox="0 0 20 20"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.5}
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
