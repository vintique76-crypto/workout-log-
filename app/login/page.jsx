"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, primaryBtn } from "../../lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("가입 완료! 바로 로그인해주세요.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
      }
    } catch (err) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 22, marginBottom: 24, textAlign: "center" }}>내 운동 기록</h1>

      <div style={{ display: "flex", marginBottom: 20, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{
            flex: 1,
            padding: 10,
            border: "none",
            background: mode === "login" ? "#111" : "#fff",
            color: mode === "login" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          style={{
            flex: 1,
            padding: 10,
            border: "none",
            background: mode === "signup" ? "#111" : "#fff",
            color: mode === "signup" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: "#c00", fontSize: 13 }}>{error}</p>}
        {info && <p style={{ color: "#080", fontSize: 13 }}>{info}</p>}
        <button type="submit" disabled={loading} style={{ ...primaryBtn, marginTop: 6 }}>
          {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>
    </div>
  );
}
