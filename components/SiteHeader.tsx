import Link from "next/link";
import { BookMarked } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/supabase-server";

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/lessons", label: "Уроки" },
  { href: "/contact", label: "Запись" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex items-center gap-2 font-black">
          <span className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-coral text-white shadow-[3px_3px_0_#202124]">
            <BookMarked size={22} aria-hidden />
          </span>
          <span className="leading-tight">
            Ты-Серб
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-ink/60">
              курс
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border-2 border-ink bg-white p-1 shadow-[3px_3px_0_#202124]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-black text-ink transition hover:bg-sunflower sm:px-4"
            >
              {item.label}
            </Link>
          ))}
          {user?.isAdmin ? (
            <Link
              href="/admin"
              className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-black text-serbian-blue transition hover:bg-sunflower sm:px-4"
            >
              Админ
            </Link>
          ) : null}
          {user ? (
            <form action={logoutAction}>
              <button className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-black text-ink transition hover:bg-sunflower sm:px-4">
                Выйти
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-black text-serbian-blue transition hover:bg-sunflower sm:px-4"
            >
              Войти
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
