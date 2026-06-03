"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MenuItemFormModal } from "./MenuItemFormModal";
import type { MenuItem, MenuCategory } from "@/types/database";

interface Props {
  items: MenuItem[];
  categories: MenuCategory[];
}

export function MenuManager({ items, categories }: Props) {
  const router = useRouter();
  const [formOpen, setFormOpen]       = useState(false);
  const [editItem, setEditItem]       = useState<MenuItem | undefined>();
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  function openCreate() {
    setEditItem(undefined);
    setFormOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    router.refresh();
  }

  async function handleDelete(item: MenuItem) {
    const ok = window.confirm(`Видалити "${item.name}"? Цю дію не можна скасувати.`);
    if (!ok) return;

    setDeletingId(item.id);
    const supabase = createClient();
    await supabase.from("menu_items").delete().eq("id", item.id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <>
      {/* ─── page header ─── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#2C1E16]">Керування меню</h1>
          <p className="text-[#2C1E16]/45 text-sm mt-0.5">{items.length} страв у базі</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C68E58] text-white
                     text-sm font-semibold hover:opacity-90 active:scale-[0.97]
                     transition-all shadow-sm"
        >
          <Plus size={17} strokeWidth={2.5} />
          Додати страву
        </button>
      </div>

      {/* ─── table card ─── */}
      <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F2EAE0] text-left">
                <th className={TH}>Фото</th>
                <th className={TH}>Назва</th>
                <th className={TH}>Категорія</th>
                <th className={TH}>Ціна</th>
                <th className={TH}>Бейджі</th>
                <th className={TH}>Статус</th>
                <th className={`${TH} text-right`}>Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1E16]/6">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#2C1E16]/35 text-sm">
                    Страв ще немає. Додайте першу!
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FDFBF7] transition-colors"
                  >
                    {/* photo */}
                    <td className={TD}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#2C1E16]/8 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#F2EAE0] flex items-center justify-center flex-shrink-0">
                          <ImageOff size={14} strokeWidth={1.5} className="text-[#2C1E16]/25" />
                        </div>
                      )}
                    </td>

                    {/* name */}
                    <td className={TD}>
                      <p className="font-semibold text-[#2C1E16] leading-snug">{item.name}</p>
                      {item.weight && (
                        <p className="text-xs text-[#2C1E16]/38 mt-0.5">{item.weight}</p>
                      )}
                    </td>

                    {/* category */}
                    <td className={TD}>
                      <span className="text-[#2C1E16]/60">
                        {categoryMap[item.category_id] ?? "—"}
                      </span>
                    </td>

                    {/* price */}
                    <td className={TD}>
                      <span className="font-bold text-[#2C1E16]">
                        {Math.round(item.price)} грн
                      </span>
                    </td>

                    {/* badges */}
                    <td className={TD}>
                      <div className="flex flex-wrap gap-1">
                        {(item.badges ?? []).slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold
                                       bg-[#C68E58]/15 text-[#C68E58] uppercase tracking-wide"
                          >
                            {b}
                          </span>
                        ))}
                        {(item.badges?.length ?? 0) > 2 && (
                          <span className="text-xs text-[#2C1E16]/35">
                            +{(item.badges?.length ?? 0) - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* status */}
                    <td className={TD}>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                          ${item.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#2C1E16]/8 text-[#2C1E16]/45"
                          }`}
                      >
                        {item.is_active ? "Активна" : "Прихована"}
                      </span>
                    </td>

                    {/* actions */}
                    <td className={`${TD} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                                     text-[#2C1E16]/40 hover:text-[#C68E58] hover:bg-[#C68E58]/10
                                     transition-colors"
                          aria-label="Редагувати"
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                                     text-[#2C1E16]/40 hover:text-red-600 hover:bg-red-50
                                     transition-colors disabled:opacity-40"
                          aria-label="Видалити"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── form modal ─── */}
      {formOpen && (
        <MenuItemFormModal
          item={editItem}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

const TH = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/50 whitespace-nowrap";
const TD = "px-4 py-3 align-middle";
