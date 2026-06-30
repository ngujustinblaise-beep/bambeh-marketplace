// @ts-nocheck
/**
 * MESSAGE INPUT COMPONENT ? Input area for composing and sending messages.
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageAttachment } from '@/types/chat';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '@/utils/firebase/firebaseConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface MessageInputProps {
  chatId: string;
  onSend: (data: { text?: string; attachments?: MessageAttachment[] }) => void;
  className?: string;
}

export default function MessageInput({ chatId, onSend, className = '' }: MessageInputProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [text, setText]               = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Typing indicator
  useEffect(() => {
    if (text.length > 0) {
      setDoc(doc(db, 'typing_indicators', `${chatId}_${currentUser?.id}`), {
        chatId, userId: currentUser?.id, userName: currentUser?.name,
        isTyping: true, timestamp: new Date(),
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        deleteDoc(doc(db, 'typing_indicators', `${chatId}_${currentUser?.id}`));
      }, 3000);
    } else {
      deleteDoc(doc(db, 'typing_indicators', `${chatId}_${currentUser?.id}`));
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [text, chatId, currentUser]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { alert(`File ${file.name} is too large. Maximum size is 5MB.`); return false; }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => { setPreviews(prev => [...prev, reader.result as string]); };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<MessageAttachment[]> => {
    const uploaded: MessageAttachment[] = [];
    for (const file of attachments) {
      const timestamp = Date.now();
      const storageRef = ref(storage, `chats/${chatId}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploaded.push({
        id: `${timestamp}`,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url, name: file.name, size: file.size, mimeType: file.type,
      });
    }
    return uploaded;
  };

  const handleSend = async () => {
    if (!text.trim() && attachments.length === 0) return;
    setIsUploading(true);
    try {
      let uploadedAttachments: MessageAttachment[] = [];
      if (attachments.length > 0) uploadedAttachments = await uploadAttachments();
      await onSend({
        text: text.trim() || undefined,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      });
      setText('');
      setAttachments([]);
      setPreviews([]);
      await deleteDoc(doc(db, 'typing_indicators', `${chatId}_${currentUser?.id}`));
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={`border-t bg-white p-4 ${className}`}>
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
              <button onClick={() => removeAttachment(index)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
        <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <Paperclip className="w-5 h-5" />
        </Button>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="resize-none min-h-[44px] max-h-32 pr-10"
            rows={1}
            disabled={isUploading}
          />
        </div>
        <Button onClick={handleSend} disabled={(!text.trim() && attachments.length === 0) || isUploading} className="bg-teal-600 hover:bg-teal-700" size="sm">
          {isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      {text.length > 0 && <div className="text-xs text-gray-500 text-right mt-1">{text.length} / 5000</div>}
    </div>
  );
}

export function VoiceRecordButton() {
  const [isRecording, setIsRecording] = useState(false);
  return (
    <Button variant="ghost" size="sm" onMouseDown={() => setIsRecording(true)} onMouseUp={() => setIsRecording(false)}
      onTouchStart={() => setIsRecording(true)} onTouchEnd={() => setIsRecording(false)}
      className={isRecording ? 'bg-red-100' : ''}>
      <Mic className={`w-5 h-5 ${isRecording ? 'text-red-600' : ''}`} />
    </Button>
  );
}





