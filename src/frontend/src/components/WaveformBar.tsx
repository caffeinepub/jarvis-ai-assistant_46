interface WaveformBarProps {
  isActive: boolean;
  color?: "cyan" | "red";
  barCount?: number;
}

export function WaveformBar({
  isActive,
  color = "cyan",
  barCount = 20,
}: WaveformBarProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i);
  const baseColor = color === "cyan" ? "#20D6FF" : "#FF3B3B";
  const glowColor =
    color === "cyan" ? "rgba(32,214,255,0.6)" : "rgba(255,59,59,0.6)";

  return (
    <div
      className="flex items-center justify-center gap-[2px]"
      style={{ height: "36px" }}
      aria-label={
        isActive ? (color === "cyan" ? "Listening..." : "Speaking...") : "Idle"
      }
    >
      {bars.map((i) => {
        const delay = (i * 0.05) % 0.8;
        const minH = 3;
        const maxH = 28;
        // Create a wave-like amplitude profile
        const profile = Math.sin((i / barCount) * Math.PI);
        const baseHeight = minH + profile * (maxH - minH) * 0.4;

        return (
          <div
            key={i}
            style={{
              width: "3px",
              height: isActive
                ? `${baseHeight + profile * (maxH - baseHeight)}px`
                : `${minH}px`,
              backgroundColor: baseColor,
              boxShadow: isActive ? `0 0 4px ${glowColor}` : "none",
              borderRadius: "2px",
              transformOrigin: "center",
              animation: isActive
                ? `wave-bar ${0.5 + (i % 5) * 0.1}s ease-in-out ${delay}s infinite`
                : "none",
              transition: "height 0.3s ease, box-shadow 0.3s ease",
              opacity: isActive ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
