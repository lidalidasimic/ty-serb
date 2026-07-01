import { UserPlus } from "lucide-react";
import { registerAction } from "@/app/register/actions";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl border-2 border-ink bg-white p-6 shadow-comic sm:p-10">
        <p className="font-black uppercase tracking-[0.18em] text-serbian-red">регистрация</p>
        <h1 className="mt-3 text-4xl font-black text-ink">Создать аккаунт</h1>
        <p className="mt-3 leading-7 text-ink/70">
          После регистрации доступ к закрытым лекциям ожидает ручного подтверждения.
        </p>
        {error ? (
          <div className="mt-6 rounded-lg border-2 border-ink bg-serbian-red/10 p-4 font-bold text-serbian-red">
            {error}
          </div>
        ) : null}
        <form action={registerAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-black">Имя</span>
            <input
              required
              name="name"
              className="focus-ring mt-2 w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            />
          </label>
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
            <span className="text-sm font-black">Telegram / контакт</span>
            <input
              name="contact"
              placeholder="@username"
              className="focus-ring mt-2 w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black">Пароль</span>
            <input
              required
              name="password"
              type="password"
              minLength={8}
              className="focus-ring mt-2 w-full rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
            />
          </label>
          <label className="flex items-center gap-3 rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold">
            <input
              name="rememberMe"
              type="checkbox"
              defaultChecked
              className="size-5 accent-serbian-red"
            />
            Запомнить меня
          </label>
          <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-red px-5 py-3 font-black text-white shadow-[3px_3px_0_#202124]">
            <UserPlus size={18} aria-hidden />
            Зарегистрироваться
          </button>
        </form>
      </div>
    </section>
  );
}
