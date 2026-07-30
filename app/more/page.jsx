"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card, smallBtn } from "../../lib/ui";
import { ListIcon, TrendingUpIcon, ScaleIcon, LogOutIcon, SparkleIcon, TrophyIcon, DownloadIcon } from "../../components/icons";
import { DumbbellIcon } from "../../components/movementIcons";
import { isPushSupported, getPushStatus, subscribeToPush, unsubscribeFromPush } from "../../lib/pushNotifications";

const ITEMS = [
  { href: "/coach", label: "코칭", desc: "기록 기반 자동 인사이트", Icon: SparkleIcon },
  { href: "/strength", label: "3대 측정", desc: "스쿼트·벤치·데드 합계와 예상 1RM 랭킹", Icon: DumbbellIcon },
  { href: "/prs", label: "PR 타임라인", desc: "종목별 최고 기록 갱신 히스토리", Icon: TrophyIcon },
  { href: "/routines", label: "루틴 관리", desc: "자주 하는 운동을 루틴으로 저장", Icon: ListIcon },
  { href: "/progress", label: "진행 그래프", desc: "종목별 무게·볼륨 변화", Icon: TrendingUpIcon },
  { href: "/weight", label: "체중 기록", desc: "몸무게 변화 추적", Icon: ScaleIcon },
  { href: "/export", label: "데이터 내보내기", desc: "운동·체중 기록을 CSV로 다운로드", Icon: DownloadIcon },
];

export default function MorePage() {
  const session = useRequireSession();
  const router = useRouter();
  const [pushStatus, setPushStatus] = useState("unsupported");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState("");

  useEffect(() => {
    if (isPushSupported()) getPushStatus().then(setPushStatus);
  }, []);

  if (!session) return <p>로딩 중...</p>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handlePushToggle = async () => {
    setPushError("");
    setPushBusy(true);
    try {
      if (pushStatus === "subscribed") {
        await unsubscribeFromPush();
        setPushStatus("unsubscribed");
      } else {
        await subscribeToPush(session.user.id);
        setPushStatus("subscribed");
      }
    } catch (err) {
      setPushError(err.message);
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>더보기</h1>

      {pushStatus !== "unsupported" && (
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600 }}>운동 리마인더</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {pushStatus === "subscribed" ? "알림 켜짐 · 2일 이상 쉬면 알려드려요" : pushStatus === "denied" ? "브라우저 알림 권한이 차단돼 있어요" : "며칠간 운동을 안 하면 알려드려요"}
            </div>
            {pushError && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{pushError}</div>}
          </div>
          <button
            onClick={handlePushToggle}
            disabled={pushBusy || pushStatus === "denied"}
            style={{
              ...smallBtn,
              flexShrink: 0,
              background: pushStatus === "subscribed" ? "var(--accent)" : "var(--bg-elevated-2)",
              color: pushStatus === "subscribed" ? "var(--accent-text)" : "var(--text)",
              border: "1px solid var(--border-strong)",
            }}
          >
            {pushBusy ? "처리 중..." : pushStatus === "subscribed" ? "끄기" : "켜기"}
          </button>
        </div>
      )}

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
