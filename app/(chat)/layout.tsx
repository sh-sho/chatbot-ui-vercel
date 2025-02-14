"use client"; // クライアントコンポーネント

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Script from "next/script";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // Cookie や localStorage からサイドバーの状態を取得する例
    const savedState = localStorage.getItem("sidebar:state");
    setIsSidebarCollapsed(savedState === "true");
  }, []);

  // 未ログインの場合の処理
  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4">You are not signed in.</p>
        <button
          onClick={() => signIn("azure-ad")} // Azure AD を指定
          className="p-2 bg-blue-600 text-white"
        >
          Sign in with Azure AD
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isSidebarCollapsed}>
        <AppSidebar user={{
            id: "user-1",
            name: "John Doe",
            email: "john.doe@example.com",
            image: "https://example.com/avatar.png",
          }}  />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
