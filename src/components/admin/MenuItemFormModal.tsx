"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { menuItemSchema, validateImageFile } from "@/lib/schemas";
import type { MenuItem, MenuCategory } from "@/types/database";

const BADGE_OPTIONS = [
  "Популярне", "Хіт продажів", "Хіт сезону", "Хіт",
  "Топ", "Новинка", "Веган", "Освіжає", "Гостре",
];

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\wЀ-ӿ\-]/g, "")
    .replace(/--+/g, "-");
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  weight: string;
  category_id: string;
  image_url: string;
  badges: string[];
  is_active: boolean;
  sort_order: string;
};

function emptyForm(categories: MenuCategory[]): FormState {
  return {
    name: "",
    slug: "",
    description: "",
    price: "",
    weight: "",
    category_id: categories[0]?.id ?? "",
    image_url: "",
    badges: [],
    is_active: true,
    sort_order: "0",
  };
}

function itemToForm(item: MenuItem): FormState {
  return {
    name:        item.name,
    slug:        item.slug,
    description: item.description ?? "",
    price:       String(item.price),
    weight:      item.weight ?? "",
    category_id: item.category_id,
    image_url:   item.image_url ?? "",
    badges:      item.badges ?? [],
    is_active:   item.is_active,
    sort_order:  String(item.sort_order),
  };
}

interface Props {
  item?: MenuItem;
  categories: MenuCategory[];
  onClose: () => void;
  onSaved: () => void;
}

export function MenuItemFormModal({ item, categories, onClose, onSaved }: Props) {
  const isEdit = !!item;
  const [form, setForm] = useState<FormState>(
    isEdit ? itemToForm(item) : emptyForm(categories)
  );
  const [slugEdited,   setSlugEdited]   = useState(isEdit);
  const [loading,      setLoading]      = useState(false);
  const [isUploading,  setIsUploading]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item?.image_url ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* auto-slug from name when not manually edited */
  useEffect(() => {
    if (!slugEdited) {
      setForm((f) => ({ ...f, slug: toSlug(f.name) }));
    }
  }, [form.name, slugEdited]);

  /* Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateImageFile(file);
    if (fileError) { setError(fileError); e.target.value = ""; return; }

    const isHeic = file.type === "image/heic" || file.type === "image/heif"
      || /\.(heic|heif)$/i.test(file.name);

    if (isHeic) {
      setIsUploading(true);
      try {
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        const jpeg = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
        setImageFile(jpeg);
        setImagePreview(URL.createObjectURL(jpeg));
      } catch {
        setError("Не вдалося конвертувати HEIC. Спробуйте зберегти фото як JPEG на iPhone.");
      } finally {
        setIsUploading(false);
      }
    } else {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview("");
    set("image_url", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function toggleBadge(badge: string) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(badge)
        ? f.badges.filter((b) => b !== badge)
        : [...f.badges, badge],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validation = menuItemSchema.safeParse({
      name:        form.name,
      slug:        form.slug,
      description: form.description,
      price:       parseFloat(form.price),
      weight:      form.weight,
      category_id: form.category_id,
      sort_order:  parseInt(form.sort_order) || 0,
    });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    /* upload image if a new file was selected */
    let finalImageUrl: string | null = form.image_url.trim() || null;
    if (imageFile) {
      setIsUploading(true);
      const ext  = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("menu-images")
        .upload(path, imageFile, { upsert: false });

      if (uploadErr) {
        setIsUploading(false);
        setLoading(false);
        setError(`Помилка завантаження: ${uploadErr.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(path);
      finalImageUrl = urlData.publicUrl;
      setIsUploading(false);
    }

    const payload = {
      name:        form.name.trim(),
      slug:        form.slug.trim() || toSlug(form.name),
      description: form.description.trim() || null,
      price:       parseFloat(form.price),
      weight:      form.weight.trim() || null,
      category_id: form.category_id,
      image_url:   finalImageUrl,
      badges:      form.badges.length > 0 ? form.badges : null,
      is_active:   form.is_active,
      sort_order:  parseInt(form.sort_order) || 0,
      updated_at:  new Date().toISOString(),
    };

    let err;

    if (isEdit) {
      ({ error: err } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", item.id));
    } else {
      ({ error: err } = await supabase
        .from("menu_items")
        .insert([payload]));
    }

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2C1E16]/8 flex-shrink-0">
          <h2 className="font-heading text-xl font-bold text-[#2C1E16]">
            {isEdit ? `Редагувати: ${item.name}` : "Нова страва"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#2C1E16]/40
                       hover:bg-[#2C1E16]/8 hover:text-[#2C1E16] transition-colors"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* body */}
        <form id="menu-item-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* name */}
          <Field label="Назва *">
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Наприклад: Капучино"
              className={INPUT}
            />
          </Field>

          {/* slug */}
          <Field label="Slug (URL)">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => { set("slug", e.target.value); setSlugEdited(true); }}
              placeholder="capuchino"
              className={`${INPUT} font-mono text-xs`}
            />
          </Field>

          {/* description */}
          <Field label="Опис">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Короткий опис страви…"
              className={`${INPUT} resize-none`}
            />
          </Field>

          {/* price + weight */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ціна (грн) *">
              <input
                required
                type="number"
                min="0"
                step="0.5"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="89"
                className={INPUT}
              />
            </Field>
            <Field label="Вага / об'єм">
              <input
                type="text"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="200 мл"
                className={INPUT}
              />
            </Field>
          </div>

          {/* category */}
          <Field label="Категорія *">
            <select
              required
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className={INPUT}
            >
              <option value="">— Оберіть категорію —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          {/* image upload */}
          <Field label="Фото страви">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#2C1E16]/12 bg-[#F2EAE0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#2C1E16] text-xs font-semibold"
                  >
                    Замінити
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-[#2C1E16]/15
                           flex flex-col items-center justify-center gap-2
                           text-[#2C1E16]/35 hover:border-[#C68E58]/50 hover:text-[#C68E58]
                           transition-colors bg-[#FDFBF7]"
              >
                <ImageIcon size={22} strokeWidth={1.5} />
                <span className="text-xs font-medium">Натисніть, щоб обрати фото</span>
                <span className="text-[10px]">JPG, PNG, WebP, HEIC</span>
              </button>
            )}
          </Field>

          {/* badges */}
          <Field label="Бейджі">
            <div className="flex flex-wrap gap-2 pt-1">
              {BADGE_OPTIONS.map((b) => {
                const active = form.badges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                      ${active
                        ? "bg-[#C68E58] border-[#C68E58] text-white"
                        : "bg-white border-[#2C1E16]/15 text-[#2C1E16]/55 hover:border-[#C68E58] hover:text-[#C68E58]"
                      }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* sort_order */}
          <Field label="Порядок сортування">
            <input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => set("sort_order", e.target.value)}
              className={`${INPUT} w-24`}
            />
          </Field>

          {/* is_active */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("is_active", !form.is_active)}
              className={`relative w-10 h-5.5 rounded-full transition-colors
                ${form.is_active ? "bg-[#C68E58]" : "bg-[#2C1E16]/20"}`}
              style={{ width: 40, height: 22 }}
            >
              <div
                className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                  ${form.is_active ? "translate-x-[20px]" : "translate-x-[3px]"}`}
              />
            </div>
            <span className="text-sm font-medium text-[#2C1E16]">
              Активна страва (відображається в меню)
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2C1E16]/8 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#2C1E16]/60
                       hover:bg-[#2C1E16]/8 transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            form="menu-item-form"
            disabled={loading || isUploading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#C68E58] text-white
                       hover:opacity-90 active:scale-[0.98] transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading
              ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Завантаження фото…</>
              : loading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Збереження…</>
                : isEdit ? "Зберегти зміни" : "Додати страву"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── shared helpers ── */
const INPUT = `w-full px-3.5 py-2.5 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
  text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/30
  focus:outline-none focus:ring-2 focus:ring-[#C68E58]/35 focus:border-[#C68E58]
  transition-colors`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#2C1E16]/50 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
