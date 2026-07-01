import Link from "next/link";
import { LogIn } from "lucide-react";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/lessons";
  const error = params?.error;
  const message = params?.message;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl border-2 border-ink bg-white p-6 shadow-comic sm:p-10">
        <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">вход</p>
        <h1 className="mt-3 text-4xl font-black text-ink">Войти в курс</h1>
        <p className="mt-3 leading-7 text-ink/70">
          Первая лекция открыта всем. Для остальных материалов нужен аккаунт и ручное
          подтверждение доступа.
        </p>
        {error ? (
          <div className="mt-6 rounded-lg border-2 border-ink bg-serbian-red/10 p-4 font-bold text-serbian-red">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mt-6 rounded-lg border-2 border-ink bg-mint/30 p-4 font-bold">
            {message}
          </div>
        ) : null}
        <form action={loginAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="text-sm font-black">Email</span>
            <input
              required
              name="email"
              type="email"
              className="focus-ring mt-2 w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black">Пароль</span>
            <input
              required
              name="password"
              type="password"
              className="focus-ring mt-2 w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            />
          </label>
          <label className="flex items-center gap-3 rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold">
            <input
              name="rememberMe"
              type="checkbox"
              className="size-5 accent-serbian-blue"
            />
            Запомнить меня
          </label>
          <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">
            <LogIn size={18} aria-hidden />
            Войти
          </button>
        </form>
        <p className="mt-6 text-sm font-bold text-ink/70">
          Нет аккаунта?{" "}
          <Link className="text-serbian-red underline" href="/register">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </section>
  );
}
