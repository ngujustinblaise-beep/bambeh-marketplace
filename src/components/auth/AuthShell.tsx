import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
};

export default function AuthShell({
  title,
  subtitle,
  children,
  dir,
}: AuthShellProps) {
  const { language } = useLanguage();
  const lang = (language as LangCode) || "en";
  const rtl = dir ?? (lang === "ar" ? "rtl" : "ltr");

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-8"
      dir={rtl}
    >
      <section className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-600 shadow-md">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-gray-600">{subtitle}</p> : null}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-6">
          {children}
        </div>
      </section>
    </main>
  );
}




