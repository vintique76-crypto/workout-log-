import { MOVEMENT_ICONS } from "./movementIcons";
import { iconTypeFor } from "../lib/exerciseIcon";

export default function MoveIconBadge({ name, muscleGroup, size = 36 }) {
  const type = iconTypeFor(name, muscleGroup);
  const Icon = MOVEMENT_ICONS[type] || MOVEMENT_ICONS.dumbbell;

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.5,
        background: "var(--bg-elevated-2)",
        color: "var(--accent)",
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
