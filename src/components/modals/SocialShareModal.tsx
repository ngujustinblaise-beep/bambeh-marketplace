import { useState } from 'react';
import { X, Share2, Copy, CheckCircle, MessageCircle, Send } from 'lucide-react';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

interface ShareOption {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  action: (url: string, title: string, description: string) => void;
}

// â”€â”€â”€ Share options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const buildShareOptions = (): ShareOption[] => [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: 'text-green-700',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    action: (url, title) => {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`, '_blank');
    },
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    icon: <Send className="w-5 h-5 text-blue-600" />,
    action: (url, title) => {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    },
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'text-blue-800',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-blue-700">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    action: (url) => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    },
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: 'text-gray-900',
    bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-900">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    action: (url, title) => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    },
  },
  {
    id: 'sms',
    label: 'SMS',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    icon: <MessageCircle className="w-5 h-5 text-purple-600" />,
    action: (url, title) => {
      window.open(`sms:?body=${encodeURIComponent(`${title}\n${url}`)}`, '_blank');
    },
  },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SocialShareModal({
  isOpen,
  onClose,
  title,
  description,
  url,
  imageUrl,
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareOptions = buildShareOptions();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or share failed â€” ignore
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-4 pb-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Share</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
              {description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{description}</p>
              )}
              <p className="text-xs text-blue-500 truncate mt-0.5">{shareUrl}</p>
            </div>
          </div>

          {/* Share options grid */}
          <div className="grid grid-cols-3 gap-2">
            {shareOptions.map(option => (
              <button
                key={option.id}
                onClick={() => option.action(shareUrl, title, description || '')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${option.bgColor}`}
              >
                {option.icon}
                <span className={`text-xs font-medium ${option.color}`}>{option.label}</span>
              </button>
            ))}

            {/* Native share (mobile) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gray-50 hover:bg-gray-100 border-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">More</span>
              </button>
            )}
          </div>

          {/* Copy link */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="flex-1 text-xs text-gray-500 truncate">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {copied ? (
                <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
