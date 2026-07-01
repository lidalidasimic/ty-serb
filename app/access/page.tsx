import Link from "next/link";
import { Send } from "lucide-react";
import { requestAccessAction } from "@/app/access/actions";
import { getCurrentUser } from "@/lib/supabase-server";

type AccessPageProps = {
  searchParams?: Promise<{
    requested?: string;
  }>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl border-2 border-ink bg-white p-6 shadow-comic sm:p-10">
          <p className="font-black uppercase tracking-[0.18em] text-serbian-red">доступ</p>
          <h1 className="mt-3 text-4xl font-black">Войдите, чтобы запросить доступ</h1>
          <Link
            href="/login?next=/access"
            className="focus-ring mt-8 inline-flex rounded-lg border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]"
          >
            Войти
          </Link>
        </div>
      </section>
    );
  }

  const statusText = user.isAdmin
    ? "У вас админ-доступ."
    : user.accessStatus === "approved"
      ? "Доступ к материалам одобрен."
      : "Доступ к материалам ожидает подтверждения.";

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl border-2 border-ink bg-white p-6 shadow-comic sm:p-10">
        <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">доступ</p>
        <h1 className="mt-3 text-4xl font-black">{statusText}</h1>
        <p className="mt-4 leading-7 text-ink/70">
          Первая лекция доступна всем. Остальные лекции открываются после ручного
          подтверждения администратором.
        </p>
        {params?.requested ? (
          <div className="mt-6 rounded-lg border-2 border-ink bg-mint/30 p-4 font-black">
            Запрос отправлен. Я проверю его вручную.
          </div>
        ) : null}
        {!user.isAdmin && user.accessStatus !== "approved" ? (
          <form action={requestAccessAction} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-black">Telegram / контакт для связи</span>
              <input
                name="contact"
                defaultValue={user.contact ?? ""}
                className="focus-ring mt-2 w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
              />
            </label>
            <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124] sm:w-auto">
              <Send size={18} aria-hidden />
              Запросить доступ
            </button>
          </form>
        ) : (
          <Link
            href="/lessons"
            className="focus-ring mt-8 inline-flex rounded-lg border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]"
          >
            Смотреть уроки
          </Link>
        )}
      </div>
    </section>
  );
}
