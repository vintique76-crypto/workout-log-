import "./globals.css";
import BottomTabBar from "../components/BottomTabBar";
import RegisterSW from "../components/RegisterSW";

export const metadata = {
  title: "내 운동 기록",
  description: "세트/횟수/무게를 기록하고 진행 상황을 그래프로 확인하는 나만의 운동 기록 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "운동 기록",
  },
};

export const viewport = {
  themeColor: "#1c1917",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <RegisterSW />
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px", paddingBottom: 96 }}>{children}</main>
        <BottomTabBar />
      </body>
    </html>
  );
}
