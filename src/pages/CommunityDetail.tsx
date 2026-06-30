import { useLang, t } from "@/hooks/useAppLang";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  ThumbsUp,
  Share2,
  Send,
} from "lucide-react";

interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  liked?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  voted?: number;
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: "Marie N.",
    content:
      "Great news! Bambeh has just rolled out a new feature for sellers. Have you tried it yet?",
    likes: 24,
    comments: 8,
    time: "2h ago",
  },
  {
    id: "2",
    author: "Jean B.",
    content:
      "Looking for recommendations for reliable tech vendors in Yaoundé. Who has hands-on experience?",
    likes: 12,
    comments: 15,
    time: "4h ago",
  },
  {
    id: "3",
    author: "Celine A.",
    content:
      "Bambeh has been excellent for my business. The customer support is outstanding!",
    likes: 31,
    comments: 5,
    time: "1d ago",
  },
];

const MOCK_POLL: Poll = {
  id: "1",
  question: "Which feature do you want most?",
  options: [
    { text: "Smarter search", votes: 45 },
    { text: "Live chat", votes: 38 },
    { text: "Flexible payment plans", votes: 29 },
    { text: "More categories", votes: 22 },
  ],
};

const COPY = {
  en: {
    community: "Community",
    title: "Bambeh Community",
    subtitle: "Connect, share, and grow together",
    members: "2,847 members",
    posts: "128 posts",
    tapToVote: "Tap to vote",
    youVoted: "You voted",
    shareSomething: "Share something with the community...",
    share: "Share",
    justNow: "Just now",
  },
  fr: {
    community: "Communauté",
    title: "Communauté Bambeh",
    subtitle: "Échangez, partagez et avancez ensemble",
    members: "2 847 membres",
    posts: "128 publications",
    tapToVote: "Touchez pour voter",
    youVoted: "Vous avez voté",
    shareSomething: "Partagez quelque chose avec la communauté...",
    share: "Partager",
    justNow: "À l’instant",
  },
  ar: {
    community: "المجتمع",
    title: "مجتمع Bambeh",
    subtitle: "تواصلوا، شاركوا، وانموا معًا",
    members: "2847 عضوًا",
    posts: "128 منشورًا",
    tapToVote: "اضغط للتصويت",
    youVoted: "لقد صوتَّ",
    shareSomething: "شارك شيئًا مع المجتمع...",
    share: "مشاركة",
    justNow: "الآن",
  },
  pidgin: {
    community: "Community",
    title: "Bambeh Community",
    subtitle: "Make we connect, share, and grow together",
    members: "2,847 members",
    posts: "128 posts",
    tapToVote: "Tap for vote",
    youVoted: "You don vote",
    shareSomething: "Share something with the community...",
    share: "Share",
    justNow: "Just now",
  },
  ful: {
    community: "Jamaa",
    title: "Jamaa Bambeh",
    subtitle: "Noɗu, waawa, e waɗtaare ngam njang",
    members: "2,847 gorkoɓe",
    posts: "128 binnde",
    tapToVote: "Dottu ngam vote",
    youVoted: "A vote-ma",
    shareSomething: "Waatu ko kala e jamaa...",
    share: "Waatu",
    justNow: "Jooni",
  },
};

export default function CommunityDetail() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [poll, setPoll] = useState<Poll>(MOCK_POLL);
  const [comment, setComment] = useState("");
  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);

  const ui =
    COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;

  function like(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
          : p
      )
    );
  }

  function vote(idx: number) {
    if (poll.voted !== undefined) return;
    setPoll((prev) => ({
      ...prev,
      voted: idx,
      options: prev.options.map((o, i) =>
        i === idx ? { ...o, votes: o.votes + 1 } : o
      ),
    }));
  }

  function submitComment() {
    if (!comment.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: "You",
      content: comment.trim(),
      likes: 0,
      comments: 0,
      time: ui.justNow,
    };
    setPosts((prev) => [newPost, ...prev]);
    setComment("");
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 pb-20 ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1">{ui.community}</h2>
        <button className="p-2 hover:bg-gray-100 rounded-xl">
          <Share2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold mb-1">{ui.title}</h1>
          <p className="text-teal-100 text-sm">{ui.subtitle}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4" />
              {ui.members}
            </span>
            <span className="flex items-center gap-1 text-sm">
              <MessageCircle className="w-4 h-4" />
              {ui.posts}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">{poll.question}</h3>
          <div className="space-y-2">
            {poll.options.map((opt, idx) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={idx}
                  onClick={() => vote(idx)}
                  className={`w-full text-left rounded-xl overflow-hidden border transition-all ${
                    poll.voted === idx ? "border-teal-500" : "border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <div className="relative p-3">
                    <div
                      className="absolute inset-0 bg-teal-50 transition-all"
                      style={{ width: `${poll.voted !== undefined ? pct : 0}%` }}
                    />
                    <div className="relative flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{opt.text}</span>
                      {poll.voted !== undefined && (
                        <span className="text-sm font-bold text-teal-600">{pct}%</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {totalVotes} votes {poll.voted === undefined ? ui.tapToVote : ui.youVoted}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder={ui.shareSomething}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={submitComment}
            disabled={!comment.trim()}
            className="bg-teal-600 text-white p-2 rounded-xl disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                {post.author[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
                <p className="text-xs text-gray-400">{post.time}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button
                onClick={() => like(post.id)}
                className={`flex items-center gap-1 transition-colors ${
                  post.liked ? "text-teal-600" : "hover:text-teal-600"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${post.liked ? "fill-teal-600" : ""}`} />
                {post.likes}
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.comments}
              </span>
              <button className="flex items-center gap-1 hover:text-teal-600 ml-auto">
                <Share2 className="w-4 h-4" />
                {ui.share}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}