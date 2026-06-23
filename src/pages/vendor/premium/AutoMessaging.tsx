import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  ShoppingBag,
  Star,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

type TriggerType =
  | "new_order"
  | "order_shipped"
  | "order_delivered"
  | "new_review"
  | "abandoned_cart"
  | "welcome"
  | "custom_schedule";

type ChannelType = "whatsapp" | "sms" | "in_app";

interface ScheduleDay {
  day: string;
  active: boolean;
}

interface AutoMessage {
  id: string;
  name: string;
  trigger: TriggerType;
  channel: ChannelType;
  message: string;
  enabled: boolean;
  delay_minutes: number;
  schedule_days: ScheduleDay[];
  created_at: string;
  sent_count: number;
}

const TRIGGER_CONFIG: Record<TriggerType, { label: string; icon: React.ReactNode; color: string }> = {
  new_order:       { label: "New Order",        icon: <ShoppingBag className="w-4 h-4" />, color: "text-blue-400" },
  order_shipped:   { label: "Order Shipped",    icon: <Zap className="w-4 h-4" />,         color: "text-purple-400" },
  order_delivered: { label: "Order Delivered",  icon: <CheckCircle className="w-4 h-4" />, color: "text-green-400" },
  new_review:      { label: "New Review",       icon: <Star className="w-4 h-4" />,        color: "text-yellow-400" },
  abandoned_cart:  { label: "Abandoned Cart",   icon: <Tag className="w-4 h-4" />,         color: "text-orange-400" },
  welcome:         { label: "Welcome Message",  icon: <MessageSquare className="w-4 h-4" />, color: "text-teal-400" },
  custom_schedule: { label: "Custom Schedule",  icon: <Clock className="w-4 h-4" />,       color: "text-gray-400" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultSchedule = (): ScheduleDay[] =>
  DAYS.map((day) => ({ day, active: day !== "Sat" && day !== "Sun" }));

const blankForm = () => ({
  name: "",
  trigger: "new_order" as TriggerType,
  channel: "whatsapp" as ChannelType,
  message: "",
  enabled: true,
  delay_minutes: 0,
  schedule_days: defaultSchedule(),
});

export default function AutoMessaging() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AutoMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm());
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadMessages();
  }, [user?.id]);

  const loadMessages = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("auto_messages")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (msg: AutoMessage) => {
    setEditingId(msg.id);
    setForm({
      name: msg.name,
      trigger: msg.trigger,
      channel: msg.channel,
      message: msg.message,
      enabled: msg.enabled,
      delay_minutes: msg.delay_minutes,
      schedule_days: msg.schedule_days ?? defaultSchedule(),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.name.trim()) { setStatus({ type: "error", text: "Please enter a name." }); return; }
    if (!form.message.trim()) { setStatus({ type: "error", text: "Please enter the message." }); return; }
    setIsSaving(true);
    setStatus(null);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("auto_messages")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("auto_messages")
          .insert({ ...form, vendor_id: user.id, sent_count: 0 });
        if (error) throw error;
      }
      setStatus({ type: "success", text: editingId ? "Message updated!" : "Message created!" });
      setShowForm(false);
      setEditingId(null);
      await loadMessages();
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "Failed to save." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("auto_messages").delete().eq("id", id);
      if (error) throw error;
      setMessages((p) => p.filter((m) => m.id !== id));
    } catch (err: any) {
      setStatus({ type: "error", text: err.message });
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await supabase
        .from("auto_messages")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      setMessages((p) => p.map((m) => (m.id === id ? { ...m, enabled } : m)));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h1 className="text-lg font-semibold">Auto Messaging</h1>
            </div>
          </div>
          <button
            onClick={() => { setEditingId(null); setForm(blankForm()); setShowForm(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {status && (
          <div className={`flex items-center gap-2 p-4 rounded-lg border ${
            status.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {status.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm">{status.text}</span>
          </div>
        )}

        {messages.length === 0 && !showForm && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-1">No auto messages yet</p>
            <p className="text-gray-500 text-sm mb-4">Set up automatic replies for orders, reviews and more</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm"
            >
              Create First Message
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const trig = TRIGGER_CONFIG[msg.trigger];
          return (
            <div key={msg.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 ${trig.color}`}>{trig.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{msg.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-700 ${trig.color}`}>{trig.label}</span>
                      <span className="text-xs text-gray-500 capitalize">{msg.channel}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{msg.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(msg.id, !msg.enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${msg.enabled ? "bg-purple-500" : "bg-gray-600"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${msg.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => openEdit(msg)} className="p-1.5 text-gray-400 hover:text-purple-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 px-4 pb-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">{editingId ? "Edit Message" : "New Auto Message"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Order Confirmation"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Trigger</label>
                  <select
                    value={form.trigger}
                    onChange={(e) => setForm((p) => ({ ...p, trigger: e.target.value as TriggerType }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {(Object.entries(TRIGGER_CONFIG) as [TriggerType, { label: string }][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["whatsapp", "sms", "in_app"] as ChannelType[]).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setForm((p) => ({ ...p, channel: ch }))}
                        className={`py-2 rounded-lg border text-xs font-medium transition-colors ${
                          form.channel === ch
                            ? "border-purple-500 bg-purple-500/20 text-purple-300"
                            : "border-gray-600 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        {ch === "in_app" ? "In-App" : ch === "whatsapp" ? "WhatsApp" : "SMS"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Delay (minutes)</label>
                  <input
                    type="number"
                    value={form.delay_minutes}
                    min={0}
                    onChange={(e) => setForm((p) => ({ ...p, delay_minutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {form.trigger === "custom_schedule" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Active Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {form.schedule_days.map(({ day, active }) => (
                        <button
                          key={day}
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              schedule_days: p.schedule_days.map((d) =>
                                d.day === day ? { ...d, active: !d.active } : d
                              ),
                            }))
                          }
                          className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                            active ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Message Content</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    placeholder="Hi {customer_name}, your order {order_id}..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm font-medium text-gray-300">Enable this message</p>
                  <button
                    onClick={() => setForm((p) => ({ ...p, enabled: !p.enabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-purple-500" : "bg-gray-600"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.enabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
              >
                {isSaving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSaving ? "Saving..." : editingId ? "Update Message" : "Create Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




