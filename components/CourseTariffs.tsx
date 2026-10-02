"use client";

import { useRef, useState, type MouseEvent } from "react";
import { BookOpen, Check, Copy, CreditCard, Mail, MessageCircle, MessagesSquare, Sparkles, UserPlus, X } from "lucide-react";

const plans = [
  {
    id: "standard", label: "Стандарт", title: "Самостоятельно", description: "Для тех, кто хочет заниматься в своём темпе.", price: "2 490 ₽", icon: BookOpen, buttonClass: "button",
    features: ["Доступ к урокам", "Интерактивные задания", "Домашние задания", "Обратная связь через платформу"],
  },
  {
    id: "premium", label: "Премиум", title: "С поддержкой", description: "Для тех, кому нужна регулярная практика общения.", price: "5 490 ₽", icon: MessagesSquare, buttonClass: "button button-red",
    features: ["Всё из тарифа «Стандарт»", "2 разговорных клуба в месяц", "Живая практика сербской речи", "Разбор вопросов на занятиях"],
  },
  {
    id: "vip", label: "VIP", title: "Заговори с носителем", description: "Для тех, кто хочет больше личного внимания.", price: "9 490 ₽", icon: Sparkles, buttonClass: "button button-blue",
    features: ["Всё из тарифа «Премиум»", "2 разговорных клуба в месяц", "2 личные консультации в месяц", "Полный доступ к урокам и обратной связи"],
  },
];

const cardNumber = "2200702190478086";
const email = "lidalidasimic@gmail.com";

export function CourseTariffs() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "manual">("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const planName = `${selectedPlan.label} · ${selectedPlan.title}`;
  const mailSubject = `Оплата Ты-Серб: ${planName}`;
  const mailBody = `Здравствуйте, Лидия!\n\nЯ зарегистрировался(-ась) на платформе и оплатил(-а) тариф «${planName}», ${selectedPlan.price} за месяц.\n\nИмя в аккаунте: \nПочта при регистрации или Telegram ID: \n\nКвитанцию прикладываю к письму.`;
  const emailHref = `mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  function openPlan(plan: (typeof plans)[number], trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelectedPlan(plan);
    setCopyStatus("idle");
    dialogRef.current?.showModal();
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    const dialog = event.currentTarget;
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopyStatus("copied");
    } catch {
      const field = document.createElement("textarea");
      field.value = cardNumber;
      field.style.position = "fixed";
      field.style.opacity = "0";
      field.setAttribute("aria-label", "Номер карты для копирования");
      dialogRef.current?.append(field);
      field.focus();
      field.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      field.remove();
      document.getElementById("copy-card")?.focus({ preventScroll: true });
      setCopyStatus(copied ? "copied" : "manual");
    }
  }

  return (
    <>
      <section className="section tariffs wrap" id="tariffs">
        <div className="section-heading"><div><p className="eyebrow">Тарифы</p><h2>Выберите свой формат</h2><p className="section-lead">Учитесь самостоятельно, добавьте разговорную практику или личную работу с носителем.</p></div></div>
        <div className="tariff-grid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <article className={`tariff tariff-${plan.id}`} key={plan.id}>
                <div className="tariff-label"><span>{plan.label}</span><Icon aria-hidden /></div><h3>{plan.title}</h3><p className="tariff-description">{plan.description}</p>
                <div className="price"><strong>{plan.price}</strong><span>/ месяц</span></div>
                <ul className="features">{plan.features.map((feature, index) => <li className={index === 0 && plan.id !== "standard" ? "included" : undefined} key={feature}><Check aria-hidden /><span>{feature}</span></li>)}</ul>
                <button className={plan.buttonClass} type="button" aria-haspopup="dialog" aria-controls="payment-dialog" aria-label={`Выбрать тариф ${plan.label}`} onClick={(event) => openPlan(plan, event.currentTarget)}>Выбрать тариф</button>
              </article>
            );
          })}
        </div>
        <p className="payment-note"><CreditCard aria-hidden />Оплата переводом на Т-Банк. Доступ активирую после вашего сообщения с квитанцией.</p>
      </section>

      <dialog id="payment-dialog" ref={dialogRef} aria-labelledby="payment-title" aria-describedby="selected-plan" onClick={closeOnBackdrop} onClose={() => { setCopyStatus("idle"); triggerRef.current?.focus({ preventScroll: true }); }}>
        <div className="dialog-header">
          <button className="icon-button close" type="button" aria-label="Закрыть окно оплаты" title="Закрыть" onClick={() => dialogRef.current?.close()}><X aria-hidden /></button>
          <p className="eyebrow" id="selected-plan">{planName}</p><h2 id="payment-title">Как оплатить курс</h2>
          <div className="dialog-price"><strong>{selectedPlan.price}</strong><span>за месяц</span></div>
        </div>
        <div className="dialog-body">
          <ol className="steps">
            <li className="step"><span className="step-number" aria-hidden>1</span><div><h3>Зарегистрируйтесь на платформе</h3><p>Создайте аккаунт, чтобы я могла открыть вам доступ к урокам. Если аккаунт уже есть, переходите к оплате.</p><a className="button" href="/register" target="_blank" rel="noopener noreferrer"><UserPlus aria-hidden />Зарегистрироваться</a></div></li>
            <li className="step"><span className="step-number" aria-hidden>2</span><div><h3>Переведите {selectedPlan.price} на Т-Банк</h3><p>Номер карты для оплаты:</p><span className="bank-number">2200 7021 9047 8086</span><div className="copy-row"><button className="button button-yellow" type="button" id="copy-card" onClick={copyCard}><Copy aria-hidden />{copyStatus === "copied" ? "Номер скопирован" : "Скопировать номер карты"}</button><span className="copy-status" role="status" aria-live="polite">{copyStatus === "copied" ? "Готово" : copyStatus === "manual" ? "Выделите и скопируйте номер карты вручную." : ""}</span></div></div></li>
            <li className="step"><span className="step-number" aria-hidden>3</span><div><h3>Пришлите подтверждение оплаты</h3><p>Напишите мне в Telegram или на почту:</p><div className="receipt-links"><a href="https://t.me/LidiaSimich" target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden />@LidiaSimich</a><a href={emailHref}><Mail aria-hidden />{email}</a></div><ul className="receipt-list"><li>Укажите имя в аккаунте и почту, использованную при регистрации. Если регистрировались через Telegram, укажите Telegram ID.</li><li>Напишите, какой тариф выбрали, и приложите квитанцию об оплате.</li></ul><p>Я активирую ваш аккаунт, как только увижу сообщение. Обычно это происходит очень оперативно.</p></div></li>
          </ol>
          <div className="thanks"><strong>Хвала! Спасибо за поддержку!</strong><p>Ваша оплата помогает мне развивать Ты-Серб и создавать новые уроки, чтобы русскоговорящие люди в Сербии быстрее осваивали сербский и увереннее общались. Благодаря вашей поддержке я могу продолжать этот проект и воплощать новые идеи.</p></div>
        </div>
      </dialog>
    </>
  );
}
