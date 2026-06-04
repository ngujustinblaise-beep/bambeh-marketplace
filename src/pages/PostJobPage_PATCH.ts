/**
 * PATCH FILE — Apply these 3 changes to src/pages/PostJobPage.tsx
 *
 * CHANGE 1: Replace the import block (top of file)
 * CHANGE 2: Add auth check + userId state after the useState declarations
 * CHANGE 3: Replace the postJob() function
 * CHANGE 4: Replace the hardcoded phone input in Step 5
 *
 * Each section below is clearly marked.
 */

// ════════════════════════════════════════════════════════════════════════════
// CHANGE 1 — REPLACE your existing imports with these:
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REGIONS, CITIES_BY_REGION, QUARTIERS_BY_CITY } from "@/data/Locations";
import { supabase } from "@/lib/supabase";
import { createJob } from "@/services/jobs.service";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";


// ════════════════════════════════════════════════════════════════════════════
// CHANGE 2 — Inside PostJobPage(), AFTER the existing useState declarations,
// ADD these lines:
// ════════════════════════════════════════════════════════════════════════════

// Inside PostJobPage() function body, after:
//   const logoRef = useRef<HTMLInputElement>(null);
// ADD:

  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth guard — redirect to login if not signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        // Not logged in — redirect to login page
        navigate("/login", { replace: true });
      } else {
        setUserId(data.user.id);
      }
      setAuthLoading(false);
    });
  }, [navigate]);

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }


// ════════════════════════════════════════════════════════════════════════════
// CHANGE 3 — REPLACE the entire postJob() function:
// ════════════════════════════════════════════════════════════════════════════

// FIND and DELETE this (lines ~356-372):
/*
  async function postJob() {
    const e = validate(5);
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    setSubmit(true);
    try {
      // TODO: upload logo, then insert into supabase
      // const { error } = await supabase.from("jobs").insert([{ ...payload }]);
      await new Promise((r) => setTimeout(r, 1200)); // simulate network
      localStorage.removeItem("bambeh_job_draft");
      setPosted(true);
    } catch {
      alert("Failed to post. Please try again.");
    } finally {
      setSubmit(false);
    }
  }
*/

// REPLACE WITH:
  async function postJob() {
    const e = validate(5);
    setErrs(e);
    if (Object.keys(e).length > 0) return;

    if (!userId) {
      alert("You must be signed in to post a job.");
      navigate("/login");
      return;
    }

    setSubmit(true);
    try {
      const { success, id, error } = await createJob(userId, {
        title: d.jobTitle.trim(),
        company: d.companyName.trim() || undefined,
        description: d.description.trim(),
        requirements: d.requirements.trim() || undefined,
        benefits: d.benefits.length > 0 ? d.benefits.join(", ") : undefined,
        category: d.category,
        jobType: mapJobType(d.jobType),
        experienceLevel: mapExperience(d.experience),
        salaryMinXAF: d.salaryMin ? Number(d.salaryMin) : undefined,
        salaryMaxXAF: d.salaryMax ? Number(d.salaryMax) : undefined,
        isSalaryNegotiable: d.isNegotiable,
        location: {
          city: d.city,
          region: d.region,
          country: "Cameroon",
        },
        isRemote: d.jobType.toLowerCase().includes("remote"),
        applicationDeadline: d.appDeadline || undefined,
        status: "active",
        tags: d.requiredSkills
          ? d.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });

      if (!success || error) {
        alert(`Failed to post job: ${error ?? "Unknown error"}`);
        return;
      }

      localStorage.removeItem("bambeh_job_draft");
      setPosted(true);
      // Navigate to the job detail page after a short delay
      if (id) setTimeout(() => navigate(`/jobs/${id}`), 2000);
    } catch (err) {
      alert(`Failed to post. Please try again. ${err instanceof Error ? err.message : ""}`);
    } finally {
      setSubmit(false);
    }
  }

  // Maps PostJobPage job type strings → DB enum values
  function mapJobType(t: string): "full_time" | "part_time" | "contract" | "internship" | "freelance" {
    const map: Record<string, "full_time" | "part_time" | "contract" | "internship" | "freelance"> = {
      "Full-time":  "full_time",
      "Part-time":  "part_time",
      "Contract":   "contract",
      "Internship": "internship",
      "Temporary":  "contract",
      "Remote":     "full_time",
      "Freelance":  "freelance",
    };
    return map[t] ?? "full_time";
  }

  // Maps PostJobPage experience strings → DB enum values
  function mapExperience(e: string): "no_experience" | "entry" | "mid" | "senior" | "executive" {
    if (e.includes("No experience")) return "no_experience";
    if (e.includes("1 year") || e.includes("1–2")) return "entry";
    if (e.includes("2–4") || e.includes("3–5")) return "mid";
    if (e.includes("5–10")) return "senior";
    if (e.includes("10+")) return "executive";
    return "entry";
  }


// ════════════════════════════════════════════════════════════════════════════
// CHANGE 4 — In Step 5, REPLACE the hardcoded Cameroon phone input block:
// ════════════════════════════════════════════════════════════════════════════

// FIND (lines ~793-809) — the block with "🇨🇲 +237":
/*
                  <div className="flex">
                    <span className="border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl
                                    px-3 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600">🇨🇲 +237</span>
                    <input type="tel"
                      ...
                      onChange={(e) => upd({ appPhone: e.target.value.replace(/\D/g, "").slice(0, 9) })} />
                  </div>
*/

// REPLACE WITH:
                  <AfricanPhoneInput
                    value={d.appPhone}
                    onChange={(fullNumber, isValid) => {
                      upd({ appPhone: fullNumber });
                      if (!isValid && fullNumber.length > 4) {
                        setErrs((prev) => ({ ...prev, appPhone: "Please enter a valid phone number" }));
                      } else {
                        setErrs((prev) => { const n = { ...prev }; delete n.appPhone; return n; });
                      }
                    }}
                    label="Phone / WhatsApp Number"
                    required
                    error={errs.appPhone}
                  />
