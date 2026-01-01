"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/hospitals", label: "병원 찾기", icon: "🏥" },
    { href: "/map", label: "지도", icon: "🗺️" },
    { href: "/articles", label: "건강 정보", icon: "📰" },
    { href: "/faq", label: "FAQ", icon: "❓" },
    { href: "/qna", label: "Q&A", icon: "💬" },
    { href: "/compare", label: "비교하기", icon: "⚖️" },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isActive
                ? "bg-primary-100 text-primary-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

