"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/app/_components/BottomNav";
import {
  canGoBack,
  canGoForward,
  initialNavState,
  onBack,
  onForward,
  onNavigate,
  type NavState,
} from "@/lib/navHistory";

/** BottomNav의 뒤로/앞으로가기를 실제 브라우저 히스토리에 연결하는 글루. (#12) */
export function BottomNavSection() {
  const pathname = usePathname();
  const [state, setState] = useState<NavState>(initialNavState);
  const prevPathname = useRef(pathname);
  const pendingRef = useRef<"back" | "forward" | null>(null);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    if (pendingRef.current === "back") {
      setState((s) => onBack(s));
    } else if (pendingRef.current === "forward") {
      setState((s) => onForward(s));
    } else {
      setState((s) => onNavigate(s));
    }
    pendingRef.current = null;
  }, [pathname]);

  return (
    <BottomNav
      canGoBack={canGoBack(state)}
      canGoForward={canGoForward(state)}
      onBack={() => {
        pendingRef.current = "back";
        window.history.back();
      }}
      onForward={() => {
        pendingRef.current = "forward";
        window.history.forward();
      }}
    />
  );
}
