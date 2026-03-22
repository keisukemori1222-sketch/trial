import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ひらまつ 基本の型 評価システム",
  description: "ひらまつの人材育成「基本の型」評価アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
