import { Josefin_Sans, Poppins } from "next/font/google";
import "./globals.css";
import Heading from "@/utils/Heading";
import ThemeProvider from "@/utils/theme-provider";
import Header from "@/components/header/Header";
import ModalsProvider from "@/providers/ModalsProvider";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-Poppins" });
const josefin_sans = Josefin_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-Josefin" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Heading title="LMS" description="LMS description" keywords="Lms" />
      <body className={`${poppins.variable} ${josefin_sans.variable} font-Poppins bg-white text-neutral-800 dark:bg-neutral-800 dark:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ModalsProvider />
          <Header />
          <div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
