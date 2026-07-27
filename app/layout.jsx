import NavBar from "../components/NavBar";
import RegisterSW from "../components/RegisterSW";

export const metadata = {
  title: "내 운동 기록",
  description: "세트/횟수/무게를 기록하고 진행 상황을 그래프로 확인하는 나만의 운동 기록 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "운동 기록",
  },
};

export const viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#fafafa",
          color: "#111",
        }}
      >
        <RegisterSW />
        <NavBar />
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}
