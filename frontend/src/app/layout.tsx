import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/components/AuthProvider";
import styles from "@/app/auth.module.css";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TEAM",
  description: "개인 혹은 팀 단위로 블로그를 관리해보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <AuthProvider>
          <div className={styles.shell}>
            <AppHeader />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
