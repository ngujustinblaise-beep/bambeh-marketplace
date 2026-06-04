/**
 * PATCH FILE — Apply these changes to src/pages/JobDetails.tsx
 *
 * This fixes BUG 2: JobDetails reads from hardcoded DEMO_JOBS instead of Supabase.
 * Real jobs posted by users will never show. This patch wires it to getJobById().
 *
 * IMPORTANT: The local `Job` interface in JobDetails uses different field names
 * than `JobListing` from jobs.service.ts. The patch adds an adapter function
 * so we don't have to rewrite the entire component's rendering logic.
 */

// ════════════════════════════════════════════════════════════════════════════
// CHANGE 1 — ADD these two imports to the existing import block:
// ════════════════════════════════════════════════════════════════════════════

// After line 14 (import { useParams, useNavigate, Link }...):
import { getJobById, incrementJobView } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";


// ════════════════════════════════════════════════════════════════════════════
// CHANGE 2 — ADD this adapter function BEFORE the JobDetails component.
// Place it right before: export default function JobDetails()
// ════════════════════════════════════════════════════════════════════════════

/**
 * Converts a JobListing (from Supabase) → local Job interface used by
 * this component's JSX. This lets us keep all the existing render logic intact.
 */
function toLocalJob(j: JobListing): Job {
  const salaryMin = j.salaryMinXAF ?? 0;
  const salaryMax = j.salaryMaxXAF ?? 0;

  // Derive application method from available fields
  let applicationMethod: Job["applicationMethod"] = "email";
  let applicationEmail = "";
  let applicationPhone = "";
  let applicationLink = "";

  // Check tags or description for hints — default to email contact
  // The app phone / email fields aren't in JobListing yet, so we
  // use sensible defaults. Extend JobListing type when you add those columns.
  applicationEmail = ""; // employer contact — add to DB schema when ready
  applicationMethod = "email";

  return {
    id: j.id,
    title: j.title,
    company: j.company ?? "Unknown Company",
    companyLogo: j.company ? j.company.charAt(0).toUpperCase() : "💼",
    location: `${j.location.city}${j.location.region ? ` · ${j.location.region}` : ""}`,
    region: j.location.region ?? j.location.city,
    type: j.jobType.replace("_", "-"),
    category: j.category,
    salary: {
      min: salaryMin,
      max: salaryMax,
      currency: "XAF",
      period: "month",
      negotiable: j.isSalaryNegotiable,
    },
    experience: j.experienceLevel?.replace("_", " ") ?? "",
    positions: 1,
    urgent: false,
    posted: j.createdAt,
    deadline: j.applicationDeadline ?? "",
    description: j.description,
    responsibilities: [],
    requirements: j.requirements
      ? j.requirements.split("\n").filter(Boolean)
      : [],
    requiredSkills: j.tags ?? [],
    niceToHave: [],
    applicationMethod,
    applicationEmail,
    applicationPhone,
    applicationLink,
    onsiteInfo: "",
    benefits: j.benefits
      ? j.benefits.split(",").map((b) => b.trim()).filter(Boolean)
      : [],
    stats: {
      views: j.viewCount ?? 0,
      applications: j.applicationCount ?? 0,
      saved: 0,
    },
    companyId: j.employerId,
    companyAbout: "",
    companySize: "",
    companyWebsite: "",
  };
}


// ════════════════════════════════════════════════════════════════════════════
// CHANGE 3 — REPLACE the useEffect inside JobDetails() component:
// ════════════════════════════════════════════════════════════════════════════

// FIND and DELETE this (lines ~441-448):
/*
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setJob(DEMO_JOBS[id ?? ""] ?? null);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [id]);
*/

// REPLACE WITH:
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await getJobById(id!);
      if (cancelled) return;

      if (error || !data) {
        setJob(null);
      } else {
        setJob(toLocalJob(data));
        // Increment view count (non-blocking, non-critical)
        void incrementJobView(id!);
      }
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [id]);


// ════════════════════════════════════════════════════════════════════════════
// CHANGE 4 — DELETE the DEMO_JOBS constant (lines 38–236 approx).
//
// Find this block and delete everything from:
//   const DEMO_JOBS: Record<string, Job> = {
// to the closing:
//   };
//
// It's ~200 lines of hardcoded fake data. Safe to delete after applying
// CHANGE 2 and CHANGE 3 above.
// ════════════════════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════════════════════
// SUPABASE SQL — run this if you want application_method stored in the DB:
// ════════════════════════════════════════════════════════════════════════════
/*
ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS application_method TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS application_email TEXT,
  ADD COLUMN IF NOT EXISTS application_phone TEXT,
  ADD COLUMN IF NOT EXISTS application_link TEXT,
  ADD COLUMN IF NOT EXISTS onsite_info TEXT;

-- Then update jobs.service.ts mapRow() to include these fields,
-- and PostJobPage.tsx to save them via createJob().
*/
