"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  user: { name: string; role: string; email: string };
}

const ROLE_LABELS: Record<string, string> = {
  SCRUM_MASTER: "Scrum Master",
  MANAGER: "Yönetici",
  TEAM_LEAD: "Ekip Sorumlusu",
};

const ROLE_COLORS: Record<string, string> = {
  SCRUM_MASTER: "bg-indigo-100 text-indigo-700",
  MANAGER: "bg-purple-100 text-purple-700",
  TEAM_LEAD: "bg-teal-100 text-teal-700",
};

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/retros", label: "Retrolar" },
    { href: "/action-items", label: "Aksiyon Maddeleri" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-indigo-600 text-lg">RetroAI</span>
        <div className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-700"}`}>
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          Çıkış
        </button>
      </div>
    </nav>
  );
}
