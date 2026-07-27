"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function NavBar() {
  const [session, setSession] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session || pathname === "/login") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const linkStyle = (path) => ({
    padding: "8px 10px",
    textDecoration: "none",
    color: pathname === path ? "#111" : "#888",
    fontWeight: pathname === path ? 700 : 400,
    fontSize: 14,
    whiteSpace: "nowrap",
  });

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
        <Link href="/" style={linkStyle("/")}>홈</Link>
        <Link href="/routines" style={linkStyle("/routines")}>루틴</Link>
        <Link href="/workout/new" style={linkStyle("/workout/new")}>기록하기</Link>
        <Link href="/history" style={linkStyle("/history")}>히스토리</Link>
        <Link href="/progress" style={linkStyle("/progress")}>그래프</Link>
        <Link href="/stats" style={linkStyle("/stats")}>통계</Link>
        <Link href="/weight" style={linkStyle("/weight")}>체중</Link>
      </div>
      <button
        onClick={handleLogout}
        style={{ border: "none", background: "none", color: "#c00", fontSize: 13, cursor: "pointer", flexShrink: 0 }}
      >
        로그아웃
      </button>
    </nav>
  );
}
