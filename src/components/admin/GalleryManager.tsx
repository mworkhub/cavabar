"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GalleryItem } from "@/types/database";

interface Props {
  initialItems: GalleryItem[];
}

export function GalleryManager({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sb = createClient();

  /* ── add item ── */
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) { setError("Вставте URL зображення"); return; }
    setSaving(true);
    setError("");

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
    const { data, error: err } = await sb
      .from("gallery")
      .insert({ image_url: newUrl.trim(), alt: newAlt.trim(), sort_order: maxOrder })
      .select()
      .single();

    if (err) { setError("Помилка збереження"); setSaving(false); return; }
    setItems(prev => [...prev, data as GalleryItem]);
    setNewUrl(""); setNewAlt("");
    setIsAdding(false);
    setSaving(false);
    router.refresh();
  }

  /* ── toggle active ── */
  const handleToggle = useCallback(async (item: GalleryItem) => {
    const next = !item.is_active;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: next } : i));
    const { error: err } = await sb.from("gallery").update({ is_active: next }).eq("id", item.id);
    if (err) setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: item.is_active } : i));
  }, [sb]);

  /* ── delete ── */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Видалити фото з галереї?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await sb.from("gallery").delete().eq("id", id);
    router.refresh();
  }, [sb, router]);

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#2C1E16]">Галерея</h1>
          <p className="text-sm text-[#2C1E16]/45 mt-0.5">{items.length} фото</p>
        </div>
        <button
          onClick={() => setIsAdding(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C68E58] text-white text-sm font-medium
                     hover:bg-[#B37A46] transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Додати фото
        </button>
      </div>

      {/* add form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-[#2C1E16]/8 p-5 space-y-4">
          <p className="text-sm font-semibold text-[#2C1E16]">Нове фото</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/45">URL зображення *</label>
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#2C1E16]/12 bg-[#FDFBF7]
                         text-sm focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#2C1E16]/45">Alt-текст (опційно)</label>
            <input
              type="text"
              value={newAlt}
              onChange={e => setNewAlt(e.target.value)}
              placeholder="Короткий опис фото"
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl border border-[#2C1E16]/12 bg-[#FDFBF7]
                         text-sm focus:outline-none focus:border-[#C68E58]/60 focus:ring-2 focus:ring-[#C68E58]/15"
            />
          </div>

          {/* preview */}
          {newUrl && (
            <div className="w-32 h-24 rounded-xl overflow-hidden bg-[#F2EAE0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newUrl} alt="preview" className="w-full h-full object-cover"
                   onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2C1E16] text-white text-sm font-medium
                         hover:opacity-85 disabled:opacity-50 transition-opacity">
              {saving ? "Зберігаємо…" : "Зберегти"}
            </button>
            <button type="button" onClick={() => { setIsAdding(false); setError(""); }}
              className="px-5 py-2 rounded-xl border border-[#2C1E16]/15 text-sm text-[#2C1E16]/60
                         hover:text-[#2C1E16] transition-colors">
              Скасувати
            </button>
          </div>
        </form>
      )}

      {/* grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-[#F2EAE0] border border-[#C68E58]/15 p-12 text-center">
          <p className="text-3xl mb-3">🖼️</p>
          <p className="font-heading text-lg text-[#2C1E16] mb-1">Галерея порожня</p>
          <p className="text-[#2C1E16]/45 text-sm">Додайте перше фото через кнопку вище</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-2xl overflow-hidden bg-[#F2EAE0] aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.alt || "gallery"}
                className={`w-full h-full object-cover transition-opacity duration-200
                            ${item.is_active ? "opacity-100" : "opacity-40"}`}
                onError={e => { (e.target as HTMLImageElement).src = ""; }}
              />

              {/* overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleToggle(item)}
                  title={item.is_active ? "Сховати" : "Показати"}
                  className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                >
                  {item.is_active
                    ? <Eye size={15} className="text-[#2C1E16]" />
                    : <EyeOff size={15} className="text-[#2C1E16]/50" />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Видалити"
                  className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} className="text-red-500" />
                </button>
              </div>

              {/* inactive badge */}
              {!item.is_active && (
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase
                                  bg-[#2C1E16]/70 text-white px-2 py-0.5 rounded-full">
                  Приховано
                </span>
              )}

              {/* drag handle (visual only) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} className="text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
