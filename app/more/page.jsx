"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card } from "../../lib/ui";
import { ListIcon, TrendingUpIcon, ScaleIcon, LogOutIcon, SparkleIcon } from "../../components/icons";

const ITEMS = [
  { href: "/coach", label: "코칭", desc: "기록 기반 자동 인사이트", Icon: SparkleIcon },
  { href: "/routines", label: "루틴 관리", desc: "자주 하는 운동을 루틴으로 저장", Icon: ListIcon },
  { href: "/progress", label: "진행 그래프", desc: "종목별 무게·볼륨 변화", Icon: TrendingUpIcon },
  { href: "/weight", label: "체중 기록", desc: "몸무게 변화 추적", Icon: ScaleIcon },
];

export default function MorePage() {
  const session = useRequireSession();
  const router = useRouter();

  if (!session) return <p>로딩 중...</p>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>더보기</h1>

      {ITEMS.map(({ href, label, desc, Icon }) => (
        <Link key={href} href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                color: "var(--accent)",
                background: "var(--bg-elevated-2)",
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon width={20} height={20} />
            </span>
            <div>
              <div style={{ fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{desc}</div>
            </div>
          </div>
        </Link>
      ))}

      <button
        onClick={handleLogout}
        style={{
          ...card,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: "var(--danger)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            background: "var(--bg-elevated-2)",
            width: 40,
            height: 40,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LogOutIcon width={20} height={20} />
        </span>
        <span style={{ fontWeight: 600 }}>로그아웃</span>
      </button>
    </div>
  );
}
