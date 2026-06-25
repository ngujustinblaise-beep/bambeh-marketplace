/**
 * src/components/Chatbot/chat/MessageInput.tsx
 * Bambeh Marketplace � Chat Message Input Bar
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useRef, useCallback } from "react";
import { Send, Image as ImageIcon, Smile, Mic, Loader2, X } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string, imageFile?: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const QUICK_REPLIES = [
  "Bonjour, est-ce encore disponible?",
  "Quel est votre meilleur prix?",
  "O� �tes-vous situ�?",
  "Je suis int�ress�(e)",
];

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "�crire un message...",
  className = "",
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      adjustHeight();
    },
    [adjustHeight]
  );

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if ((!content && !imageFile) || sending || disabled) return;

    setSending(true);
    try {
      await onSend(content, imageFile ?? undefined);
      setText("");
      setImagePreview(null);
      setImageFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      // silent � parent handles error
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [text, imageFile, sending, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image trop lourde � max 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setImagePreview(result);
        setImageFile(file);
      }
    };
    reader.onerror = () => {
      setImagePreview(null);
      setImageFile(null);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
  }, []);

  const handleQuickReply = useCallback(
    (reply: string) => {
      setText(reply);
      setShowQuickReplies(false);
      textareaRef.current?.focus();
    },
    []
  );

  const canSend = (text.trim().length > 0 || imageFile !== null) && !sending && !disabled;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Quick replies */}
      {showQuickReplies && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="flex-shrink-0 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Aper�u"
            className="h-20 w-20 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
            aria-label="Supprimer l'image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Quick reply toggle */}
        <button
          type="button"
          onClick={() => setShowQuickReplies((v) => !v)}
          disabled={disabled}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-colors ${
            showQuickReplies ? "bg-teal-100 text-teal-600" : "hover:bg-gray-100 text-gray-500"
          }`}
          aria-label="R�ponses rapides"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Image attach */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Joindre une image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleImageSelect}
        />

        {/* Text area */}
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 min-h-[44px] flex items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none overflow-hidden"
            style={{ height: "24px", maxHeight: "120px" }}
          />
        </div>

        {/* Send or voice */}
        {canSend ? (
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!canSend}
            className="flex-shrink-0 w-11 h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl flex items-center justify-center transition-colors shadow-sm"
            aria-label="Envoyer"
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 w-11 h-11 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-2xl flex items-center justify-center transition-colors"
            aria-label="Message vocal"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;





