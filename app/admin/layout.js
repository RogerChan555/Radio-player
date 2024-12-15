import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/context/user";

export default function AdminLayout({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        <Header />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="w-full pt-16 overflow-y-auto">{children}</main>
        </div>
        <Toaster className="z-index-[999]" />
      </UserProvider>
    </ThemeProvider>
  );
}
