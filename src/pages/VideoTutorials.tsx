import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { useLanguage } from "@/App";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Video Tutorials",
    "subtitle": "Watch and learn",
    "gettingStarted": "Getting Started",
    "duration": "5 minutes"
  },
  "fr": {
    "title": "Tutoriels vidéo",
    "subtitle": "Regardez et apprenez",
    "gettingStarted": "Pour commencer",
    "duration": "5 minutes"
  },
  "pidgin": {
    "title": "Video Tutorial dem",
    "subtitle": "Watch and learn",
    "gettingStarted": "How to Start",
    "duration": "5 minutes"
  },
  "ar": {
    "title": "دروس فيديو",
    "subtitle": "شاهد وتعلّم",
    "gettingStarted": "البدء",
    "duration": "5 دقائق"
  },
  "ff": {
    "title": "Jannde wideyo",
    "subtitle": "Ndaaru njanngaa",
    "gettingStarted": "Fuɗɗorde",
    "duration": "Hojomaaji 5"
  }
};

export default function VideoTutorials() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Video className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-purple-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{tr("gettingStarted")}</h3>
            <p className="text-sm text-gray-600">{tr("duration")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
