import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://domainchecker.co.kr"),
  title: {
    default: "도메인체커 — 무료 도메인 조회 · 점수 확인 · 도메인 분석 도구",
    template: "%s | 도메인체커",
  },
  description:
    "도메인 이름만 입력하면 도메인 점수, 등급, 소유자 정보, 거래 이력을 즉시 확인할 수 있는 무료 분석 도구입니다. 도메인 고르기 전에 꼭 확인하세요.",
  keywords: [
    "도메인 조회", "도메인 점수 확인", "도메인 분석", "도메인 검색", "도메인 등급 확인",
    "도메인 평판 조회", "도메인 정보 확인", "무료 도메인 분석 도구", "도메인 점수 조회",
    "도메인 권한 확인", "도메인 신뢰도 확인", "도메인 품질 확인", "도메인 seo 점수 확인",
    "백링크 확인", "도메인 스팸 점수", "도메인 가치 분석", "도메인 종합 분석",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "도메인체커",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
  },
  alternates: {
    canonical: "https://domainchecker.co.kr",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "도메인체커",
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N255DR94BE" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-N255DR94BE');`,
          }}
        />
      </head>
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
                  description: "무료 도메인 분석 도구 — 도메인 점수, 소유자 정보, 거래 이력 조회",
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
