/**
 * src/pages/JobDetails.tsx
 * Bambeh Marketplace — Job Detail Page
 *
 * CHANGES FROM ORIGINAL:
 *  ✅ ActionButtons (Contact Vendor / Report Ad / Share) added after job description
 *  ✅ vendorPhone derived from applicationPhone when applicationMethod is "phone"
 *  ✅ All existing functionality preserved (tabs, apply modal, quick-actions sheet, stats)
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// ✅ NEW: shared action buttons
import { ActionButtons } from "@/components/listings/ActionButtons";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Salary {
  min: number; max: number; currency: string; period: string; negotiable: boolean;
}
interface Job {
  id: string; title: string; company: string; companyLogo: string;
  location: string; region: string; type: string; category: string;
  salary: Salary; experience: string; positions: number; urgent: boolean;
  posted: string; deadline: string;
  description: string; responsibilities: string[];
  requirements: string[]; requiredSkills: string[]; niceToHave: string[];
  applicationMethod: "email" | "phone" | "link" | "onsite";
  applicationEmail: string; applicationPhone: string;
  applicationLink: string; onsiteInfo: string;
  benefits: string[];
  stats: { views: number; applications: number; saved: number };
  companyId: string; companyAbout: string; companySize: string; companyWebsite: string;
}

// ─── Demo data ──────────────────────────────────────────────────────────────
const DEMO_JOBS: Record<string, Job> = {
  "1": {
    id: "1", title: "Software Engineer", company: "TechCorp Cameroun", companyLogo: "🏢",
    location: "Yaoundé · Centre", region: "Centre", type: "Full-time", category: "Technology",
    salary: { min: 150000, max: 300000, currency: "XAF", period: "month", negotiable: true },
    experience: "2–4 years", positions: 2, urgent: true,
    posted: "2026-05-20", deadline: "2026-06-30",
    description: "We are looking for a talented Software Engineer to join our growing team in Yaoundé. You will work on cutting-edge web and mobile applications serving thousands of Cameroonians every day.",
    responsibilities: [
      "Design and develop scalable web and mobile applications",
      "Collaborate with product and design teams on feature development",
      "Write clean, maintainable, and well-tested code",
      "Participate in code reviews and technical discussions",
      "Help mentor junior developers on the team",
    ],
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "2+ years of professional software development experience",
      "Strong proficiency in JavaScript/TypeScript and React",
      "Experience with Node.js and RESTful API development",
      "Good understanding of databases (SQL and NoSQL)",
    ],
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Git"],
    niceToHave: ["React Native", "AWS", "Docker", "GraphQL"],
    applicationMethod: "email", applicationEmail: "jobs@techcorp-cm.com",
    applicationPhone: "", applicationLink: "", onsiteInfo: "",
    benefits: ["Health Insurance", "Performance Bonus", "Remote-friendly", "Training Budget"],
    stats: { views: 342, applications: 28, saved: 15 },
    companyId: "techcorp-1",
    companyAbout: "TechCorp Cameroun is a leading software company building digital solutions for the African market since 2018.",
    companySize: "50–200 employees", companyWebsite: "https://techcorp-cm.com",
  },
  "2": {
    id: "2", title: "Marketing Manager", company: "Boost Africa Ltd", companyLogo: "📣",
    location: "Douala · Littoral", region: "Littoral", type: "Full-time", category: "Marketing",
    salary: { min: 120000, max: 200000, currency: "XAF", period: "month", negotiable: false },
    experience: "3–5 years", positions: 1, urgent: false,
    posted: "2026-05-18", deadline: "2026-06-15",
    description: "Boost Africa Ltd is seeking an experienced Marketing Manager to lead our brand and digital marketing efforts across Central Africa.",
    responsibilities: [
      "Develop and implement comprehensive marketing strategies",
      "Manage social media channels and content calendar",
      "Lead a team of 3 marketing specialists",
      "Analyse campaign performance and report on KPIs weekly",
      "Coordinate with sales team for B2B lead generation",
    ],
    requirements: [
      "Bachelor's degree in Marketing, Business, or related field",
      "3+ years in a marketing management role",
      "Strong knowledge of digital marketing tools and platforms",
      "Excellent communication skills in French and English",
      "Data-driven mindset with strong analytical skills",
    ],
    requiredSkills: ["Digital Marketing", "Social Media", "SEO", "Analytics", "Content Strategy"],
    niceToHave: ["Google Ads", "HubSpot", "Video Production"],
    applicationMethod: "email", applicationEmail: "careers@boostafrica.com",
    applicationPhone: "", applicationLink: "", onsiteInfo: "",
    benefits: ["Company Car", "Health Insurance", "Annual Bonus", "Phone Allowance"],
    stats: { views: 215, applications: 19, saved: 9 },
    companyId: "boost-africa-1",
    companyAbout: "Boost Africa Ltd is a pan-African marketing agency with offices in Yaoundé, Lagos, and Abidjan.",
    companySize: "20–50 employees", companyWebsite: "https://boostafrica.com",
  },
  "3": {
    id: "3", title: "Accountant", company: "FinGroup Cameroun", companyLogo: "💼",
    location: "Bafoussam · West", region: "West", type: "Part-time", category: "Finance",
    salary: { min: 80000, max: 120000, currency: "XAF", period: "month", negotiable: true },
    experience: "1–3 years", positions: 1, urgent: true,
    posted: "2026-05-22", deadline: "2026-06-10",
    description: "FinGroup Cameroun is seeking a detail-oriented Accountant for our Bafoussam office. This part-time role is ideal for a qualified professional wanting flexible hours.",
    responsibilities: [
      "Maintain accurate financial records and ledgers",
      "Prepare monthly financial statements and management reports",
      "Process payroll and manage accounts payable and receivable",
      "Assist with tax preparation and statutory filings",
      "Reconcile bank statements and resolve discrepancies",
    ],
    requirements: [
      "HND or Bachelor's degree in Accounting or Finance",
      "1+ years of professional accounting experience",
      "Proficiency in QuickBooks or Sage accounting software",
      "Strong Microsoft Excel skills",
      "Knowledge of Cameroonian tax regulations and OHADA standards",
    ],
    requiredSkills: ["QuickBooks", "Excel", "Tax Compliance", "Financial Reporting"],
    niceToHave: ["OHADA Standards", "Payroll Software"],
    applicationMethod: "phone", applicationEmail: "", applicationPhone: "+237670000003",
    applicationLink: "", onsiteInfo: "",
    benefits: ["Flexible Hours", "Professional Development"],
    stats: { views: 178, applications: 12, saved: 6 },
    companyId: "fingroup-1",
    companyAbout: "FinGroup Cameroun provides accounting and financial consulting services to SMEs across the West Region since 2015.",
    companySize: "10–20 employees", companyWebsite: "",
  },
  "4": {
    id: "4", title: "Civil Engineer", company: "BuildRight CM", companyLogo: "🏗️",
    location: "Yaoundé · Centre", region: "Centre", type: "Contract", category: "Engineering",
    salary: { min: 200000, max: 400000, currency: "XAF", period: "month", negotiable: false },
    experience: "5–10 years", positions: 3, urgent: false,
    posted: "2026-05-15", deadline: "2026-07-01",
    description: "BuildRight CM is hiring experienced Civil Engineers for major infrastructure projects across Cameroon including road construction and commercial buildings.",
    responsibilities: [
      "Lead structural analysis and design for construction projects",
      "Supervise site teams and subcontractors on-site",
      "Ensure compliance with safety standards and building codes",
      "Prepare technical reports and project documentation",
      "Liaise with government authorities and clients",
    ],
    requirements: [
      "Bachelor's or Master's degree in Civil Engineering",
      "5+ years of experience in construction projects",
      "Proficiency in AutoCAD and structural analysis software",
      "Excellent project management skills",
      "Valid engineering licence in Cameroon preferred",
    ],
    requiredSkills: ["AutoCAD", "Structural Analysis", "Project Management", "Site Supervision"],
    niceToHave: ["BIM Software", "QHSE Certification"],
    applicationMethod: "email", applicationEmail: "hr@buildright-cm.com",
    applicationPhone: "", applicationLink: "", onsiteInfo: "",
    benefits: ["Site Allowance", "Health Insurance", "Transport"],
    stats: { views: 290, applications: 35, saved: 18 },
    companyId: "buildright-1",
    companyAbout: "BuildRight CM is one of Cameroon's leading construction companies, active since 2010 with projects across all 10 regions.",
    companySize: "200–500 employees", companyWebsite: "https://buildright-cm.com",
  },
  "5": {
    id: "5", title: "Secondary School Teacher", company: "Bilingual Grammar School", companyLogo: "📚",
    location: "Bamenda · North West", region: "North West", type: "Full-time", category: "Education",
    salary: { min: 60000, max: 100000, currency: "XAF", period: "month", negotiable: false },
    experience: "1–2 years", positions: 2, urgent: false,
    posted: "2026-05-23", deadline: "2026-06-20",
    description: "Bilingual Grammar School Bamenda is looking for dedicated teachers for the new academic year. We offer a supportive environment with modern teaching facilities.",
    responsibilities: [
      "Teach assigned subjects to Form 3 to Upper Sixth students",
      "Prepare lesson plans and teaching materials",
      "Conduct and mark tests and examinations",
      "Maintain student discipline and records",
      "Attend staff meetings and professional development sessions",
    ],
    requirements: [
      "Bachelor's degree in Education or a relevant subject",
      "GCE A/L or equivalent teaching qualification",
      "1+ years teaching experience preferred",
      "Fluency in both English and French",
      "Passion for education and student success",
    ],
    requiredSkills: ["Teaching", "French", "English", "Lesson Planning"],
    niceToHave: ["ICT Skills", "Sports Coaching"],
    applicationMethod: "onsite",
    applicationEmail: "", applicationPhone: "",
    applicationLink: "", onsiteInfo: "Bring CV and certificates to the School Office, Up Station Road, Bamenda, Mon–Fri 8am–3pm",
    benefits: ["School Accommodation", "Professional Development", "Annual Leave"],
    stats: { views: 122, applications: 8, saved: 3 },
    companyId: "bgs-bamenda-1",
    companyAbout: "Bilingual Grammar School Bamenda is a government school providing quality bilingual secondary education since 1974.",
    companySize: "50–100 employees", companyWebsite: "",
  },
  "6": {
    id: "6", title: "Agricultural Extension Officer", company: "AgroFarm Cameroun", companyLogo: "🌾",
    location: "Buea · South West", region: "South West", type: "Full-time", category: "Agriculture",
    salary: { min: 90000, max: 150000, currency: "XAF", period: "month", negotiable: true },
    experience: "2–4 years", positions: 4, urgent: false,
    posted: "2026-05-21", deadline: "2026-06-25",
    description: "AgroFarm Cameroun is expanding its field extension team to support smallholder farmers across the South West Region with modern agricultural practices and market linkages.",
    responsibilities: [
      "Train farmers on best agricultural practices and techniques",
      "Conduct field visits and farm assessments regularly",
      "Collect and analyse farm data for reporting",
      "Facilitate market linkages between farmers and buyers",
      "Support farmers in accessing government agricultural programmes",
    ],
    requirements: [
      "HND or BSc in Agriculture, Agronomy, or related field",
      "2+ years working with farming communities",
      "Strong communication skills in English and Pidgin",
      "Ability to ride a motorcycle (licence required)",
      "Willingness to travel to rural areas frequently",
    ],
    requiredSkills: ["Agronomy", "Extension Services", "Community Training", "Data Collection"],
    niceToHave: ["GIS Mapping", "Digital Farming Tools"],
    applicationMethod: "link",
    applicationEmail: "", applicationPhone: "",
    applicationLink: "https://agrofarm-cm.com/careers/apply",
    onsiteInfo: "",
    benefits: ["Field Allowance", "Motorcycle Provision", "Health Insurance"],
    stats: { views: 98, applications: 6, saved: 4 },
    companyId: "agrofarm-1",
    companyAbout: "AgroFarm Cameroun works with over 12,000 smallholder farmers across 4 regions providing training, inputs, and market access.",
    companySize: "50–100 employees", companyWebsite: "https://agrofarm-cm.com",
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtXAF(n: number): string {
  return n.toLocaleString("fr-CM") + " XAF";
}
function timeAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 py-1">
      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</span>
    </li>
  );
}

// ─── Apply Modal ────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [step, setStep] = useState<"select" | "form" | "done">("select");
  const [method, setMethod] = useState<Job["applicationMethod"]>(job.applicationMethod);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});

  const METHODS = [
    { key: "email"  as const, icon: "✉️", label: "Apply by Email",       desc: "Submit CV via email" },
    { key: "phone"  as const, icon: "📞", label: "Apply by Phone",       desc: "Call or WhatsApp the employer" },
    { key: "link"   as const, icon: "🔗", label: "External Application", desc: "Apply on their website" },
    { key: "onsite" as const, icon: "🏢", label: "Visit Office",          desc: "Walk in and apply in person" },
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())                            e.name  = "Full name is required";
    if (!email.trim() || !/\S+@\S+/.test(email)) e.email = "Valid email is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if ((method === "email" || method === "onsite") && !validate()) return;
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              {step === "done" ? "Application Sent 🎉" : "Apply for Job"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{job.title} · {job.company}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">✕</button>
        </div>

        {step === "select" && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">How would you like to apply?</p>
            {METHODS.map((m) => (
              <button key={m.key} onClick={() => { setMethod(m.key); setStep("form"); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-left">
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</div>
                  <div className="text-xs text-gray-400">{m.desc}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        )}

        {step === "form" && (
          <div className="p-5 space-y-4">
            {method === "phone" && (
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Contact the employer directly</p>
                <a href={`tel:${job.applicationPhone}`} className="flex items-center gap-2 text-teal-600 font-bold text-lg">📞 {job.applicationPhone}</a>
                <a href={`https://wa.me/${job.applicationPhone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hello, I am interested in the ${job.title} position listed on Bambeh.`)}`}
                   target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                  💬 Send WhatsApp Message
                </a>
              </div>
            )}
            {method === "link" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Apply on their website</p>
                <a href={job.applicationLink} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  🔗 Open Application Page
                </a>
              </div>
            )}
            {method === "onsite" && job.onsiteInfo && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">Office address</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">{job.onsiteInfo}</p>
              </div>
            )}
            {(method === "email" || method === "onsite") && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors ${errs.name ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                    placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)}
                  />
                  {errs.name && <p className="text-xs text-red-500 mt-1">⚠ {errs.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input type="email"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors ${errs.email ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                    placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                  {errs.email && <p className="text-xs text-red-500 mt-1">⚠ {errs.email}</p>}
                </div>
                <button onClick={submit}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors">
                  Submit Application
                </button>
              </>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Application Submitted!</h3>
            <p className="text-sm text-gray-500">Good luck! {job.company} will be in touch if you're shortlisted.</p>
            <button onClick={onClose} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Actions Sheet ────────────────────────────────────────────────────
function QuickActionsSheet({ job, isSaved, onClose, onSave, onApply }: {
  job: Job; isSaved: boolean;
  onClose: () => void; onSave: () => void; onApply: () => void;
}) {
  const shareUrl = `${window.location.origin}${window.location.pathname}#/jobs/${job.id}`;
  const actions = [
    { icon: "🚀", label: "Apply Now",    fn: () => { onClose(); onApply(); },  cls: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" },
    { icon: isSaved ? "❤️" : "🤍", label: isSaved ? "Unsave" : "Save Job", fn: () => { onSave(); onClose(); }, cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300" },
    {
      icon: "📤", label: "Share Job",
      fn: async () => {
        if (navigator.share) await navigator.share({ title: job.title, url: shareUrl });
        else await navigator.clipboard.writeText(shareUrl);
        onClose();
      },
      cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    },
    { icon: "🚩", label: "Report Job",  fn: () => { onClose(); alert("Report submitted. Thank you."); }, cls: "bg-red-50 dark:bg-red-900/20 text-red-500" },
    { icon: "🏢", label: "About Company", fn: () => { onClose(); },            cls: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl shadow-2xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button key={a.label} onClick={a.fn}
              className={`flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-transform active:scale-[0.97] ${a.cls}`}>
              <span className="text-xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob]             = useState<Job | null>(null);
  const [loading, setLoading]     = useState(true);
  const [isSaved, setIsSaved]     = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showQA, setShowQA]       = useState(false);
  const [tab, setTab]             = useState<"details" | "company" | "stats">("details");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setJob(DEMO_JOBS[id ?? ""] ?? null);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading job...</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
      <p className="text-6xl mb-4">😕</p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Job Not Found</h2>
      <p className="text-sm text-gray-500 mb-6">This listing may have been removed or the link is incorrect.</p>
      <button onClick={() => navigate("/jobs")} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">Browse All Jobs</button>
    </div>
  );

  // ✅ Derive vendor phone from applicationPhone when method is phone
  const vendorPhone = job.applicationMethod === "phone" ? job.applicationPhone : undefined;

  const TABS = [
    { key: "details"  as const, label: "Job Details" },
    { key: "company"  as const, label: "Company" },
    { key: "stats"    as const, label: "📊 Stats" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            ←
          </button>
          <span className="text-white/80 text-sm font-medium flex-1">Job Details</span>
          <button onClick={() => setIsSaved((v) => !v)} aria-label="Save job"
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all active:scale-90 ${isSaved ? "bg-red-500 text-white" : "bg-white/20 text-white"}`}>
            {isSaved ? "❤️" : "🤍"}
          </button>
          <button
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}#/jobs/${job.id}`;
              if (navigator.share) void navigator.share({ title: job.title, url });
              else void navigator.clipboard.writeText(url);
            }}
            aria-label="Share job"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-base text-white active:scale-90">
            📤
          </button>
          <button onClick={() => setShowQA(true)} aria-label="More actions"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg active:scale-90">
            ⋯
          </button>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-md flex-shrink-0">
            {job.companyLogo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1">
              {job.urgent && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">🔥 URGENT</span>
              )}
              <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">{job.type}</span>
            </div>
            <h1 className="text-white font-bold text-xl leading-tight">{job.title}</h1>
            <p className="text-teal-100 text-sm font-medium mt-0.5">{job.company}</p>
            <p className="text-teal-200 text-xs mt-1">📍 {job.location} · {timeAgo(job.posted)}</p>
          </div>
        </div>

        <div className="mt-4 bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-200">Salary per {job.salary.period}</p>
            <p className="text-white font-bold">{fmtXAF(job.salary.min)} – {fmtXAF(job.salary.max)}</p>
            {job.salary.negotiable && (
              <span className="text-xs text-teal-200 flex items-center gap-1 mt-0.5">
                <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-white text-[10px]">✓</span>
                Negotiable
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-teal-200">Deadline</p>
            <p className="text-white font-semibold text-sm">{job.deadline}</p>
          </div>
        </div>
      </div>

      {/* ── Quick info chips ── */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide -mt-1">
        {[
          { icon: "👤", label: job.experience },
          { icon: "💼", label: job.type },
          { icon: "📂", label: job.category },
          { icon: "🎯", label: `${job.positions} position${job.positions > 1 ? "s" : ""}` },
        ].map((c) => (
          <div key={c.label}
            className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {c.icon} {c.label}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? "border-teal-500 text-teal-600 dark:text-teal-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="px-4 py-5 space-y-5">

        {tab === "details" && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Job Description</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>
            </div>

            {/* ✅ NEW: Contact / Report / Share action buttons — after description */}
            <ActionButtons
              vendorPhone={vendorPhone}
              adTitle={job.title}
              adId={job.id}
              adType="jobs"
            />

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Key Responsibilities</h2>
              <ul className="space-y-0.5">
                {job.responsibilities.map((r, i) => <CheckItem key={i} text={r} />)}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Requirements & Qualifications</h2>
              <ul className="space-y-0.5">
                {job.requirements.map((r, i) => <CheckItem key={i} text={r} />)}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
              {job.niceToHave.length > 0 && (
                <>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">Nice to Have</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.niceToHave.map((s) => (
                      <span key={s} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {job.benefits.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Benefits & Perks</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <span key={b} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</span>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-5 border border-teal-200 dark:border-teal-700">
              <h2 className="font-bold text-base text-teal-800 dark:text-teal-200 mb-2">How to Apply</h2>
              {job.applicationMethod === "email"  && <p className="text-sm text-teal-700 dark:text-teal-300">✉️ Email: <strong>{job.applicationEmail}</strong></p>}
              {job.applicationMethod === "phone"  && <p className="text-sm text-teal-700 dark:text-teal-300">📞 Call / WhatsApp: <strong>{job.applicationPhone}</strong></p>}
              {job.applicationMethod === "link"   && <a href={job.applicationLink} target="_blank" rel="noreferrer" className="text-sm text-teal-600 font-semibold underline">🔗 Apply via external link</a>}
              {job.applicationMethod === "onsite" && <p className="text-sm text-teal-700 dark:text-teal-300">🏢 {job.onsiteInfo}</p>}
              {job.deadline && <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">⏰ Deadline: <strong>{job.deadline}</strong></p>}
            </div>
          </>
        )}

        {tab === "company" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-3xl">
                {job.companyLogo}
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{job.company}</h2>
                <p className="text-sm text-gray-500">{job.companySize}</p>
                <p className="text-xs text-teal-600">{job.location}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{job.companyAbout}</p>
            {job.companyWebsite && (
              <a href={job.companyWebsite} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 text-teal-600 text-sm font-semibold border border-teal-300 rounded-xl px-4 py-2 mb-4">
                🌐 Visit Website
              </a>
            )}
            <Link to={`/vendor/profile/${job.companyId}`}
              className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">View Full Company Profile</span>
              <span className="text-teal-500">→</span>
            </Link>
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "👁", label: "Views",   v: job.stats.views,        cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
                { icon: "📋", label: "Applied", v: job.stats.applications, cls: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" },
                { icon: "❤️", label: "Saved",   v: job.stats.saved,        cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300" },
              ].map((s) => (
                <div key={s.label} className={`${s.cls} rounded-2xl p-4 text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold">{s.v.toLocaleString()}</div>
                  <div className="text-xs font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Competition</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Applications vs Views</span>
                  <span>{Math.round((job.stats.applications / job.stats.views) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all"
                       style={{ width: `${Math.min(100, Math.round((job.stats.applications / job.stats.views) * 100))}%` }} />
                </div>
              </div>
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  💡 {job.stats.applications < 20 ? "Low competition — great time to apply!" : job.stats.applications < 50 ? "Moderate competition. Stand out with a strong cover letter." : "High competition. Tailor your CV carefully."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom Apply bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-3 z-40">
        <button onClick={() => setShowQA(true)}
          className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-xl active:scale-95">
          ⋯
        </button>
        <button onClick={() => setShowApply(true)}
          className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-transform">
          🚀 Apply Now
        </button>
      </div>

      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}
      {showQA && (
        <QuickActionsSheet
          job={job}
          isSaved={isSaved}
          onClose={() => setShowQA(false)}
          onSave={() => setIsSaved((v) => !v)}
          onApply={() => setShowApply(true)}
        />
      )}
    </div>
  );
}
