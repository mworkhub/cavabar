import type { Metadata } from "next";
import { ContactsClient } from "./ContactsClient";

export const metadata: Metadata = {
  title: "Контакти — Cava Bar | Кав'ярня в Бродах",
  description:
    "Адреса, графік роботи та контакти кав'ярні Cava Bar. Площа Ринок, 30, м. Броди, Львівська обл. Телефон: +38 (093) 205-81-08.",
};

export default function ContactsPage() {
  return <ContactsClient />;
}
