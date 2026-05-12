import { MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl border-2 border-ink bg-white p-6 sm:p-10">
        <p className="font-black uppercase tracking-[0.18em] text-serbian-red">
          запись
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">
          Хотите в группу или готовы к индивидуальным занятиям?
        </h1>
        <a
          href="https://t.me/LidiaSimich"
          target="_blank"
          rel="noreferrer"
          className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-serbian-blue px-6 py-4 font-black text-white transition hover:bg-ink sm:w-auto"
        >
          <MessageCircle size={20} aria-hidden />
          Написать в Telegram
        </a>
      </div>
    </section>
  );
}
