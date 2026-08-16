/**
 * Ashal Brand Logo Component
 * The mark depicts two market stall roofs meeting at a peak to form the letter "A"
 * representing "two stalls, one marketplace".
 *
 * @param {{ className?: string, variant?: "default" | "light" | "amber" }} props
 */
export function AshalMark({ className = "h-8 w-8", variant = "default" }) {
  const isLight = variant === "light";
  const primaryColor = isLight ? "#2DD4BF" : "#0E6B5C"; // Teal 400 or Teal 700
  const accentColor = isLight ? "#FBBF24" : "#C98A2E"; // Amber 400 or Amber 600

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left market stall roof (Teal) */}
      <path
        d="M 24 6 L 10 18 L 10 24 L 20 24 L 20 40 L 26 40 L 26 24 L 24 24 Z"
        fill={primaryColor}
      />
      {/* Left stall canopy peak & awning accent */}
      <path
        d="M 24 6 L 8 20 L 12 24 L 24 14 Z"
        fill={primaryColor}
        fillOpacity="0.85"
      />

      {/* Right market stall roof (Amber) meeting at peak to form "A" */}
      <path
        d="M 24 6 L 38 18 L 38 24 L 28 24 L 28 40 L 22 40 L 22 24 L 24 24 Z"
        fill={accentColor}
      />
      {/* Right stall canopy peak & awning accent */}
      <path
        d="M 24 6 L 40 20 L 36 24 L 24 14 Z"
        fill={accentColor}
        fillOpacity="0.85"
      />

      {/* Center crossbar connecting the stalls to complete the "A" */}
      <rect
        x="15"
        y="25"
        width="18"
        height="4"
        rx="2"
        fill={isLight ? "#FFFFFF" : "#0F1B2D"}
      />
    </svg>
  );
}

/**
 * Full Ashal logo — mark + wordmark, with optional tagline.
 *
 * @param {{
 *   variant?: "default" | "light" | "markOnly" | "amber",
 *   size?: "sm" | "md" | "lg" | "xl",
 *   showTagline?: boolean,
 *   className?: string
 * }} props
 */
export default function AshalLogo({
  variant = "default",
  size = "md",
  showTagline = false,
  className = "",
}) {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: { mark: "h-6 w-6", text: "text-lg", tagline: "text-[9px]" },
    md: { mark: "h-8 w-8", text: "text-2xl", tagline: "text-[10px]" },
    lg: { mark: "h-10 w-10", text: "text-3xl", tagline: "text-xs" },
    xl: { mark: "h-14 w-14", text: "text-4xl", tagline: "text-sm" },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (variant === "markOnly") {
    return <AshalMark className={`${currentSize.mark} ${className}`} variant="default" />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <AshalMark className={currentSize.mark} variant={variant} />
      <div className="flex flex-col">
        <span
          className={`font-display font-extrabold tracking-tight leading-none ${
            currentSize.text
          } ${isLight ? "text-white" : "text-[var(--color-ink,#0F1B2D)]"}`}
        >
          ASHAL
        </span>
        {showTagline && (
          <span
            className={`font-body font-medium uppercase tracking-[0.2em] mt-0.5 ${
              currentSize.tagline
            } ${isLight ? "text-teal-200" : "text-[var(--color-ink-soft,#4B5768)]"}`}
          >
            Marketplace
          </span>
        )}
      </div>
    </div>
  );
}
