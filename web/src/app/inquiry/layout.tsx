import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "경매 도메인 대행 서비스 — 원하는 도메인을 찾아드립니다",
  description:
    "도메인 경매 입찰부터 이전까지 전 과정을 대행합니다. 원하는 키워드와 예산을 알려주시면 최적의 도메인을 찾아드립니다.",
  keywords: [
    "도메인 경매 대행",
    "도메인 구매 대행",
    "도메인 입찰 대행",
    "도메인 대행 서비스",
  ],
  openGraph: {
    title: "경매 도메인 대행 서비스 — 원하는 도메인을 찾아드립니다",
    description:
      "도메인 경매 입찰부터 이전까지 전 과정을 대행합니다.",
    type: "website",
    siteName: "도메인체커",
  },
};

export default function InquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
