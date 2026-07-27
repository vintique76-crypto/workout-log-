"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card } from "../../lib/ui";
import { todayStr } from "../../lib/date";

export default function WeightPage() {
  const session = useRequireSession();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("body_weights")
      .select("id, date, weight")
      .order("date", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (weight === "") {
      setError("몸무게를 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("body_weights")
        .upsert({ user_id: session.user.id, date, weight: Number(weight) }, { onConflict: "user_id,date" });
      if (err) throw err;
      setWeight("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("body_weights").delete().eq("id", id);
    load();
  };

  const chartData = entries.map((e) => ({ date: e.date, weight: e.weight }));
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>체중 기록</h1>

      <form onSubmit={handleSave} style={{ ...card, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>몸무게(kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
      {error && <p style={{ color: "#c00", fontSize: 13, marginTop: 8 }}>{error}</p>}

      {loading ? (
        <p style={{ marginTop: 16 }}>불러오는 중...</p>
      ) : chartData.length < 2 ? (
        <p style={{ color: "#888", marginTop: 16 }}>2번 이상 기록하면 그래프가 나와요.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#111" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <h2 style={{ fontSize: 16, marginTop: 24 }}>최근 기록</h2>
      {recent.length === 0 ? (
        <p style={{ color: "#888" }}>아직 기록이 없어요.</p>
      ) : (
        recent.map((e) => (
          <div key={e.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{e.date}</span>
            <span>{e.weight}kg</span>
            <button onClick={() => handleDelete(e.id)} style={{ ...smallBtn, color: "#c00" }}>
              삭제
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, color: "#666", marginBottom: 4 };
