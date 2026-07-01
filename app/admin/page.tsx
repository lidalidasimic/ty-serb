import { Check, Search, Shield, X } from "lucide-react";
import { updateAccessStatusAction } from "@/app/admin/actions";
import { listProfiles, listRecentActivity, requireAdmin } from "@/lib/supabase-server";

type AdminPageProps = {
  searchParams?: Promise<{
    status?: string;
    q?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const status = params?.status ?? "all";
  const q = params?.q ?? "";
  const users = await listProfiles(status, q);
  const activity = await listRecentActivity();
  const materialStats = getMaterialStats(activity);

  const counts = users.reduce(
    (acc, user) => {
      acc[user.access_status] += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, revoked: 0 },
  );

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-2 border-ink bg-white p-6 shadow-comic">
          <p className="font-black uppercase tracking-[0.18em] text-serbian-blue">
            админ
          </p>
          <h1 className="mt-3 text-4xl font-black">Доступ к материалам</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {(["pending", "approved", "rejected", "revoked"] as const).map((item) => (
              <div key={item} className="rounded-lg border-2 border-ink bg-paper p-4">
                <p className="text-sm font-black uppercase text-ink/55">{item}</p>
                <p className="text-3xl font-black">{counts[item]}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="mb-6 grid gap-3 rounded-lg border-2 border-ink bg-white p-4 shadow-comic md:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Поиск</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45"
              size={20}
              aria-hidden
            />
            <input
              name="q"
              defaultValue={q}
              className="focus-ring w-full rounded-lg border-2 border-ink bg-paper px-11 py-3 font-bold"
              placeholder="Email, имя или Telegram"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="focus-ring rounded-lg border-2 border-ink bg-paper px-4 py-3 font-bold"
          >
            <option value="all">Все статусы</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="revoked">revoked</option>
          </select>
          <button className="focus-ring rounded-lg border-2 border-ink bg-serbian-blue px-5 py-3 font-black text-white">
            Фильтр
          </button>
        </form>

        <div className="overflow-x-auto border-2 border-ink bg-white shadow-comic">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead className="border-b-2 border-ink bg-paper">
              <tr>
                <th className="p-3">Пользователь</th>
                <th className="p-3">Контакт</th>
                <th className="p-3">Дата регистрации</th>
                <th className="p-3">Статус</th>
                <th className="p-3">Последний вход</th>
                <th className="p-3">Открытия лекций</th>
                <th className="p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-ink/15">
                  <td className="p-3">
                    <p className="font-black">{user.name || "Без имени"}</p>
                    <p className="text-ink/65">{user.email}</p>
                  </td>
                  <td className="p-3">{user.contact || "—"}</td>
                  <td className="p-3">{new Date(user.created_at).toLocaleString("ru-RU")}</td>
                  <td className="p-3 font-black">{user.access_status}</td>
                  <td className="p-3">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString("ru-RU")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <LastLessonOpens userId={user.id} activity={activity} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusButton userId={user.id} status="approved" label="Approve" />
                      <StatusButton userId={user.id} status="rejected" label="Reject" />
                      <StatusButton userId={user.id} status="revoked" label="Revoke" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-2 border-ink bg-white p-6 shadow-comic">
          <h2 className="mb-4 text-2xl font-black">Часто открывали</h2>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {materialStats.length > 0 ? (
              materialStats.slice(0, 6).map((item) => (
                <div key={item.lessonSlug} className="rounded-lg border-2 border-ink bg-paper p-4">
                  <p className="font-black">{item.lessonSlug}</p>
                  <p className="text-sm text-ink/65">{item.count} открытий</p>
                </div>
              ))
            ) : (
              <p className="text-ink/65">Пока нет открытий материалов.</p>
            )}
          </div>
          <div className="mb-4 flex items-center gap-2">
            <Shield size={20} aria-hidden />
            <h2 className="text-2xl font-black">Последние события</h2>
          </div>
          <div className="space-y-2 text-sm">
            {activity.map((event) => (
              <div key={event.id} className="flex flex-wrap gap-2 border-b border-ink/10 pb-2">
                <span className="font-black">{event.action_type}</span>
                <span>{event.lesson_slug || "—"}</span>
                <span className="text-ink/60">
                  {new Date(event.created_at).toLocaleString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LastLessonOpens({
  userId,
  activity,
}: {
  userId: string;
  activity: { user_id: string | null; lesson_slug: string | null; action_type: string; created_at: string }[];
}) {
  const opens = activity
    .filter(
      (event) =>
        event.user_id === userId &&
        event.lesson_slug &&
        (event.action_type === "lesson_opened" || event.action_type.startsWith("material_opened")),
    )
    .slice(0, 4);

  if (opens.length === 0) {
    return <span>—</span>;
  }

  return (
    <div className="space-y-1">
      {opens.map((event) => (
        <p key={`${event.lesson_slug}-${event.created_at}`} className="text-xs">
          <span className="font-black">{event.lesson_slug}</span>{" "}
          {new Date(event.created_at).toLocaleString("ru-RU")}
        </p>
      ))}
    </div>
  );
}

function getMaterialStats(
  activity: { lesson_slug: string | null; action_type: string }[],
) {
  const counts = new Map<string, number>();

  for (const event of activity) {
    if (!event.lesson_slug || !event.action_type.startsWith("material_opened")) {
      continue;
    }
    counts.set(event.lesson_slug, (counts.get(event.lesson_slug) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([lessonSlug, count]) => ({ lessonSlug, count }))
    .sort((first, second) => second.count - first.count);
}

function StatusButton({
  userId,
  status,
  label,
}: {
  userId: string;
  status: "approved" | "rejected" | "revoked";
  label: string;
}) {
  const isApprove = status === "approved";
  return (
    <form action={updateAccessStatusAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={`focus-ring inline-flex items-center gap-1 rounded-lg border-2 border-ink px-3 py-2 font-black ${
          isApprove ? "bg-mint/40" : "bg-white"
        }`}
      >
        {isApprove ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}
        {label}
      </button>
    </form>
  );
}
