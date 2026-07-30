import {
  FireIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FlatLineIcon,
  ScaleIcon,
  ClockIcon,
  FlagIcon,
  SparkleIcon,
} from "./icons";

const ICON_BY_TYPE = {
  streak: FireIcon,
  volumeUp: TrendingUpIcon,
  volumeDown: TrendingDownIcon,
  plateau: FlatLineIcon,
  imbalance: ScaleIcon,
  overtraining: ClockIcon,
  deload: ClockIcon,
  goalProjection: FlagIcon,
};

export default function InsightIcon({ type, tone, size = 32 }) {
  const Icon = ICON_BY_TYPE[type] || SparkleIcon;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: "var(--bg-elevated-2)",
        color: tone === "positive" ? "var(--success)" : "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon width={size * 0.55} height={size * 0.55} />
    </span>
  );
}
