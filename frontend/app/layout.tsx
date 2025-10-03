import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "營養書讀書會",
  description: "21天營養書閱讀計劃",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
