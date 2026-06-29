import React from "react";

type AuthShellProps = {
  title?: string;
  subtitle?: string;
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, dir = "ltr", children }: AuthShellProps) {
  return (
    <main
      dir={dir}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-10"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Bambeh"
            className="mx-auto h-20 w-auto object-contain mb-4"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {title ? <h1 className="text-3xl font-bold text-gray-900">{title}</h1> : null}
          {subtitle ? <p className="mt-2 text-sm text-gray-600">{subtitle}</p> : null}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl">
          {children}
        </div>
      </div>
    </main>
  );
}


