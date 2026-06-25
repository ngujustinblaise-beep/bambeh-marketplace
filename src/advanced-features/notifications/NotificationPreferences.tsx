// @ts-nocheck
import React, { useState } from "react";
import { NotificationService } from "./NotificationService";

const service = new NotificationService();

interface NotificationPreferencesProps {
  userId: string;
  onSave?: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId, onSave }) => {
  const [prefs, setPrefs] = useState({
    orders:   true,
    chat:     true,
    promos:   false,
    reviews:  true,
    payments: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await service.markAllRead(userId); // placeholder persist
      onSave?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
      {(Object.keys(prefs) as (keyof typeof prefs)[]).map(key => (
        <label key={key} className="flex items-center justify-between py-2 border-b last:border-0">
          <span className="capitalize text-sm text-gray-700">{key} notifications</span>
          <input type="checkbox" checked={prefs[key]}
            onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
            className="w-4 h-4 accent-teal-600" />
        </label>
      ))}
      <button onClick={handleSave} disabled={saving}
        className="mt-4 w-full bg-teal-600 text-white py-2 rounded-xl font-medium disabled:opacity-50">
        {saving ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  );
};

export default NotificationPreferences;




