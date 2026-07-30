"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { HomeIcon, ClockIcon, PlusIcon, BarChartIcon, MoreIcon } from "./icons";

const TABS = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/history", label: "히스토리", Icon: ClockIcon },
  { href: "/workout/new", label: "기록", Icon: PlusIcon, primary: true },
  { href: "/stats", label: "통계", Icon: BarChartIcon },
  { href: "/more", label: "더보기", Icon: MoreIcon },
];

export default function BottomTabBar() {
  const [session, setSession] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session || pathname === "/login") return null;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        background: "var(--bg-elevated)",
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        borderTop: "1px solid var(--border-strong)",
        padding: "8px 4px calc(6px + env(safe-area-inset-bottom))",
        zIndex: 20,
      }}
    >
      {TABS.map(({ href, label, Icon, primary }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                transform: "translateY(-12px)",
              }}
            >
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px var(--accent-glow)",
                }}
              >
                <Icon width={24} height={24} />
              </span>
              <span style={{ fontSize: 11, marginTop: 3, color: "var(--text-muted)" }}>{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "4px 10px",
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            <Icon width={22} height={22} />
            <span style={{ fontSize: 11 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
