import { MOVEMENT_ICONS } from "./movementIcons";
import { iconTypeFor } from "../lib/exerciseIcon";

export default function MoveIconBadge({ name, muscleGroup, size = 36, onClick }) {
  const type = iconTypeFor(name, muscleGroup);
  const Icon = MOVEMENT_ICONS[type] || MOVEMENT_ICONS.dumbbell;

  const style = {
    width: size,
    height: size,
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid var(--border-strong)",
    padding: 0,
    cursor: onClick ? "pointer" : "default",
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={style} aria-label="종목 선택">
        <Icon width={size * 0.55} height={size * 0.55} />
      </button>
    );
  }

  return (
    <span style={style}>
      <Icon width={size * 0.55} height={size * 0.55} />
    </span>
  );
}
