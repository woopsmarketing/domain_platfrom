import type { Metadata } from "next";

export const metadata: Metadata = { title: "내 계정" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
