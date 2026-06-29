/**
 * AutoMessaging.tsx — Bambeh Marketplace · Vendor Auto-Messaging
 * FILE LOCATION: src/routes/groups/vendor/AutoMessaging.tsx
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * Self-contained 5-language UI (en · fr · pidgin · ar · ff). No mojibake, no BOM.
 */

import React, { useState, useCallback } from "react";
import {
  MessageCircle, Plus, Trash2, Edit2, ArrowLeft, Save, ToggleRight, ToggleLeft, CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
type Trigger = "new_inquiry" | "new_order" | "order_shipped" | "order_delivered" | "review_received";

interface AutoMessage {
  id: string;
  trigger: Trigger;
  message: string;
  isActive: boolean;
}

const T: Record<
  Lang,
  {
    title: string;
    add: string;
    varsHint: (a: string, b: string, c: string) => React.ReactNode;
    saved: string;
    triggers: Record<Trigger, string>;
    editTitle: string;
    newTitle: string;
    triggerLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    cancel: string;
    save: string;
  }
> = {
  en: {
    title: "Automatic Messages",
    add: "Add",
    varsHint: (a, b, c) => <>Use {a}, {b}, {c} as variables.</>,
    saved: "Saved!",
    triggers: {
      new_inquiry: "New inquiry",
      new_order: "New order",
      order_shipped: "Order shipped",
      order_delivered: "Order delivered",
      review_received: "Review received",
    },
    editTitle: "Edit automatic message",
    newTitle: "New automatic message",
    triggerLabel: "Trigger",
    messageLabel: "Message",
    messagePlaceholder: "Your automatic message…",
    cancel: "Cancel",
    save: "Save",
  },
  fr: {
    title: "Messages automatiques",
    add: "Ajouter",
    varsHint: (a, b, c) => <>Utilisez {a}, {b}, {c} comme variables.</>,
    saved: "Sauvegardé !",
    triggers: {
      new_inquiry: "Nouvelle demande de contact",
      new_order: "Nouvelle commande",
      order_shipped: "Commande expédiée",
      order_delivered: "Commande livrée",
      review_received: "Avis reçu",
    },
    editTitle: "Modifier le message automatique",
    newTitle: "Nouveau message automatique",
    triggerLabel: "Déclencheur",
    messageLabel: "Message",
    messagePlaceholder: "Votre message automatique…",
    cancel: "Annuler",
    save: "Sauvegarder",
  },
  pidgin: {
    title: "Automatic Messages",
    add: "Add",
    varsHint: (a, b, c) => <>Use {a}, {b}, {c} as variables.</>,
    saved: "Don save!",
    triggers: {
      new_inquiry: "New question for contact",
      new_order: "New order",
      order_shipped: "Order don ship",
      order_delivered: "Order don reach",
      review_received: "Review don come",
    },
    editTitle: "Change the automatic message",
    newTitle: "New automatic message",
    triggerLabel: "Wetin go trigger am",
    messageLabel: "Message",
    messagePlaceholder: "Your automatic message…",
    cancel: "Cancel",
    save: "Save",
  },
  ar: {
    title: "الرسائل التلقائية",
    add: "إضافة",
    varsHint: (a, b, c) => <>استخدم {a} و{b} و{c} كمتغيرات.</>,
    saved: "تم الحفظ!",
    triggers: {
      new_inquiry: "طلب تواصل جديد",
      new_order: "طلب جديد",
      order_shipped: "تم شحن الطلب",
      order_delivered: "تم تسليم الطلب",
      review_received: "تم استلام تقييم",
    },
    editTitle: "تعديل الرسالة التلقائية",
    newTitle: "رسالة تلقائية جديدة",
    triggerLabel: "المُشغِّل",
    messageLabel: "الرسالة",
    messagePlaceholder: "رسالتك التلقائية…",
    cancel: "إلغاء",
    save: "حفظ",
  },
  ff: {
    title: "Nuléeji Pinal",
    add: "Ɓeydu",
    varsHint: (a, b, c) => <>Huutoro {a}, {b}, {c} wa variables.</>,
    saved: "Danngii!",
    triggers: {
      new_inquiry: "Ɓanndital kesal",
      new_order: "Kommannda kesal",
      order_shipped: "Kommannda nuldaama",
      order_delivered: "Kommannda yottiima",
      review_received: "Miijo heɓaama",
    },
    editTitle: "Waylu nulal pinal",
    newTitle: "Nulal pinal kesal",
    triggerLabel: "Fuɗɗoowo",
    messageLabel: "Nulal",
    messagePlaceholder: "Nulal maa pinal…",
    cancel: "Haaytu",
    save: "Danndu",
  },
};

const DEFAULT_MESSAGES: Record<Lang, Omit<AutoMessage, "id">[]> = {
  en: [
    { trigger: "new_inquiry", message: "Hello! Thank you for your interest. I will reply as soon as possible. — {{store_name}}", isActive: true },
    { trigger: "new_order", message: "Hello {{customer_name}}, your order #{{order_id}} has been received. We are preparing it now!", isActive: true },
    { trigger: "order_shipped", message: "Good news! Your order #{{order_id}} has been shipped. You will receive it soon.", isActive: true },
  ],
  fr: [
    { trigger: "new_inquiry", message: "Bonjour ! Merci pour votre intérêt. Je vous réponds dans les plus brefs délais. — {{store_name}}", isActive: true },
    { trigger: "new_order", message: "Bonjour {{customer_name}}, votre commande #{{order_id}} a bien été reçue. Nous la préparons dès maintenant !", isActive: true },
    { trigger: "order_shipped", message: "Bonne nouvelle ! Votre commande #{{order_id}} a été expédiée. Vous la recevrez bientôt.", isActive: true },
  ],
  pidgin: [
    { trigger: "new_inquiry", message: "Hello! Thank you say you dey interested. I go answer you quick quick. — {{store_name}}", isActive: true },
    { trigger: "new_order", message: "Hello {{customer_name}}, we don receive your order #{{order_id}}. We dey prepare am now now!", isActive: true },
    { trigger: "order_shipped", message: "Good news! Your order #{{order_id}} don ship. You go receive am soon.", isActive: true },
  ],
  ar: [
    { trigger: "new_inquiry", message: "مرحباً! شكراً لاهتمامك. سأرد عليك في أقرب وقت ممكن. — {{store_name}}", isActive: true },
    { trigger: "new_order", message: "مرحباً {{customer_name}}، تم استلام طلبك رقم #{{order_id}}. نقوم بتجهيزه الآن!", isActive: true },
    { trigger: "order_shipped", message: "خبر سار! تم شحن طلبك رقم #{{order_id}}. ستستلمه قريباً.", isActive: true },
  ],
  ff: [
    { trigger: "new_inquiry", message: "Jam! A jaaraama e njiɗaa. Mi jaaboo maa law law. — {{store_name}}", isActive: true },
    { trigger: "new_order", message: "Jam {{customer_name}}, kommannda maa #{{order_id}} heɓaama. Min naɓdina nde jooni!", isActive: true },
    { trigger: "order_shipped", message: "Habaru moƴƴo! Kommannda maa #{{order_id}} nuldaama. A heɓat nde law.", isActive: true },
  ],
};

const AutoMessaging: React.FC = () => {
  const navigate = useNavigate();
  const lang = (useLang() as Lang) || "en";
  const s = T[lang] || T.en;
  const isRtl = lang === "ar";

  const [messages, setMessages] = useState<AutoMessage[]>(
    (DEFAULT_MESSAGES[lang] || DEFAULT_MESSAGES.en).map((m, i) => ({ ...m, id: `auto-${i}` }))
  );
  const [editing, setEditing] = useState<AutoMessage | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleActive = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  }, []);

  const saveEditing = useCallback(() => {
    if (!editing) return;
    setMessages((prev) =>
      prev.some((m) => m.id === editing.id)
        ? prev.map((m) => (m.id === editing.id ? editing : m))
        : [...prev, editing]
    );
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [editing]);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addNew = useCallback(() => {
    setEditing({ id: `auto-${Date.now()}`, trigger: "new_inquiry", message: "", isActive: true });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRtl ? "rotate-180" : ""}`} />
        </button>
        <MessageCircle className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">{s.title}</h1>
        <button
          type="button"
          onClick={addNew}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> {s.add}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
        {s.varsHint(
          <code className="bg-blue-100 px-1 rounded">{"{{customer_name}}"}</code>,
          <code className="bg-blue-100 px-1 rounded">{"{{order_id}}"}</code>,
          <code className="bg-blue-100 px-1 rounded">{"{{store_name}}"}</code>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700">{s.saved}</p>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white border rounded-2xl p-4 transition-all ${
              msg.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {s.triggers[msg.trigger]}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setEditing(msg)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => toggleActive(msg.id)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  {msg.isActive ? <ToggleRight className="w-4 h-4 text-teal-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                </button>
                <button type="button" onClick={() => deleteMessage(msg.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
          </div>
        ))}
      </div>

      {editing && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditing(null)} />
          <div className="fixed inset-x-4 bottom-4 bg-white rounded-2xl shadow-2xl z-50 p-5 space-y-4 max-w-lg mx-auto" dir={isRtl ? "rtl" : "ltr"}>
            <h3 className="font-bold text-gray-900">
              {messages.some((m) => m.id === editing.id) ? s.editTitle : s.newTitle}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{s.triggerLabel}</label>
              <select
                value={editing.trigger}
                onChange={(e) => setEditing({ ...editing, trigger: e.target.value as Trigger })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                {(Object.keys(s.triggers) as Trigger[]).map((k) => (
                  <option key={k} value={k}>{s.triggers[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{s.messageLabel}</label>
              <textarea
                value={editing.message}
                onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-none"
                placeholder={s.messagePlaceholder}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">
                {s.cancel}
              </button>
              <button
                type="button"
                onClick={saveEditing}
                disabled={!editing.message.trim()}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {s.save}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AutoMessaging;
