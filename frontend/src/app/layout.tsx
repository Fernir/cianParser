import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "CIAN Parser - Аренда квартир",
  description: "Поиск квартир в аренду в Москве",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Получаем тему из куки на сервере
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="ru" suppressHydrationWarning className={theme}>
      <body className={inter.className}>
        <ThemeProvider initialTheme={theme as "light" | "dark"}>
          <ErrorBoundary>
            <Layout>{children}</Layout>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
