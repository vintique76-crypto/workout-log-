import { DumbbellIcon } from "./movementIcons";

export default function EmptyState({ message, icon: Icon = DumbbellIcon }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-muted)" }}>
      <div
        style={{
          width: 52,
          height: 52,
          margin: "0 auto 12px",
          borderRadius: "50%",
          background: "var(--bg-elevated-2)",
          color: "var(--text-faint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon width={24} height={24} />
      </div>
      <p style={{ margin: 0, fontSize: 14 }}>{message}</p>
    </div>
  );
}
