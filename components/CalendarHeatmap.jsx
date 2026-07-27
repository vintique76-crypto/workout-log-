"use client";

import { dateStr } from "../lib/date";

const WEEKS = 12;

function colorFor(count) {
  if (!count) return "#2f2b28";
  if (count === 1) return "#6b4130";
  if (count <= 3) return "#b45c3c";
  return "#e8825a";
}

export default function CalendarHeatmap({ dateCounts }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const days = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return (
    <div style={{ overflowX: "auto", padding: "2px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(7, 12px)",
          gridAutoFlow: "column",
          gridAutoColumns: "12px",
          gap: 3,
        }}
      >
        {days.map((d) => {
          const key = dateStr(d);
          const count = dateCounts[key] || 0;
          const isFuture = d > today;
          return (
            <div
              key={key}
              title={`${key}: ${count}세트`}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: isFuture ? "transparent" : colorFor(count),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
