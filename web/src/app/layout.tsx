import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "도메인체커 — 무료 도메인 지수 체크 | DA/DR/TF 분석",
    template: "%s | 도메인체커",
  },
  description:
    "무료 도메인 DA 체크, DR 확인, Trust Flow 분석. 도메인명만 입력하면 SEO 지수, Whois, 거래 이력을 즉시 확인하세요.",
  keywords: [
    "도메인 DA 체크",
    "도메인 품질 검사",
    "무료 도메인 분석",
    "Domain Authority",
    "도메인 가치 평가",
    "Whois 조회",
    "도메인 거래 이력",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "도메인체커",
                  url: "https://domainchecker.co.kr",
                  logo: "https://domainchecker.co.kr/icon.svg",
                  description: "무료 도메인 DA/DR/TF 분석 도구",
                },
                {
                  "@type": "WebSite",
                  name: "도메인체커",
                  url: "https://domainchecker.co.kr",
                  potentialAction: {
                    "@type": "SearchAction",
                    target:
                      "https://domainchecker.co.kr/domain/{search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
