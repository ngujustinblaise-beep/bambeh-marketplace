/**
 * src/services/jobs.service.ts
 * Bambeh Marketplace — Jobs Service (HARDENED)
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * SECURITY & BUG FIXES vs previous version:
 *  ✅ Input sanitization on all filter strings (strips SQL special chars before sending to Supabase)
 *  ✅ pageSize capped at 100 to prevent runaway queries / DoS
 *  ✅ incrementJobView is rate-limited via localStorage — max 1 view/job/hour per device
 *  ✅ createJob validates required fields before hitting DB — prevents malformed inserts
 *  ✅ updateJob only maps known safe fields (no spread of arbitrary user payload)
 *  ✅ getExpiringJobs — new function used by the expiry reminder edge function / cron job
 *  ✅ All DB errors returned as friendly messages (no raw Supabase error codes exposed to UI)
 *  ✅ mapRow now handles null/undefined region gracefully (was throwing on jobs with no region)
 */

import { supabase } from "@/lib/supabase";
import type {
  JobListing,
  ItemFilters,
  PaginatedItemsResponse,
} from "@/types/src_types_items";

// ─── Response Types ───────────────────────────────────────────────────────────
export interface JobResponse {
  data: JobListing | null;
  error: string | null;
}

export interface JobListResponse {
  data: JobListing[];
  total: number;
  error: string | null;
}

export interface JobActionResponse {
  success: boolean;
  id?: string;
  error: string | null;
}

// ─── Security: sanitize filter input ─────────────────────────────────────────
// Strips characters that could be used for SQL injection or wildcard abuse
function sanitize(input: string): string {
  return input
    .replace(/[%_\\'"`;]/g, "")  // strip SQL wildcards and injection chars
    .trim()
    .slice(0, 120);               // hard length cap
}

// ─── Security: rate-limit view increments ─────────────────────────────────────
// Prevents a single device from inflating view counts by hammering the endpoint
const VIEW_THROTTLE_KEY = "bambeh_view_ts";
const VIEW_THROTTLE_MS = 60 * 60 * 1000; // 1 hour per job per device

function canIncrementView(jobId: string): boolean {
  try {
    const raw = localStorage.getItem(VIEW_THROTTLE_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    const last = map[jobId] ?? 0;
    if (Date.now() - last < VIEW_THROTTLE_MS) return false;
    map[jobId] = Date.now();
    localStorage.setItem(VIEW_THROTTLE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return true; // fail open — better to count than miss
  }
}

// ─── Map DB Row → JobListing ─────────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): JobListing {
  return {
    id:                 (row.id as string)              ?? "",
    employerId:         (row.employer_id as string)     ?? "",
    title:              (row.title as string)           ?? "",
    company:            row.company as string | undefined,
    description:        (row.description as string)     ?? "",
    requirements:       row.requirements as string | undefined,
    benefits:           row.benefits as string | undefined,
    category:           (row.category as string)        ?? "",
    jobType:            (row.job_type as JobListing["jobType"])            ?? "full_time",
    experienceLevel:    row.experience_level as JobListing["experienceLevel"],
    salaryMinXAF:       row.salary_min_xaf as number | undefined,
    salaryMaxXAF:       row.salary_max_xaf as number | undefined,
    isSalaryNegotiable: Boolean(row.is_salary_negotiable),
    location: {
      city:      (row.city    as string) ?? "",
      region:    (row.region  as string) ?? "",
      country:   (row.country as string) ?? "CM",
      latitude:  row.latitude  as number | undefined,
      longitude: row.longitude as number | undefined,
    },
    isRemote:            Boolean(row.is_remote),
    applicationDeadline: row.application_deadline as string | undefined,
    status:              (row.status as JobListing["status"]) ?? "active",
    viewCount:           (row.view_count as number)        ?? 0,
    applicationCount:    (row.application_count as number) ?? 0,
    tags:                Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt:           (row.created_at as string) ?? new Date().toISOString(),
    updatedAt:           (row.updated_at as string) ?? new Date().toISOString(),
  };
}

// ─── Friendly error messages ──────────────────────────────────────────────────
function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    // Don't leak internal Supabase codes to the UI
    if (err.message.includes("JWT") || err.message.includes("auth")) {
      return "Session expired. Please log in again.";
    }
    if (err.message.includes("network") || err.message.includes("fetch")) {
      return "Network error. Check your connection.";
    }
    if (err.message.includes("duplicate") || err.message.includes("unique")) {
      return "A similar job listing already exists.";
    }
  }
  return fallback;
}

// ─── Get All Jobs ─────────────────────────────────────────────────────────────
export async function getJobs(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<JobListing>> {
  try {
    const page     = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20)); // cap at 100
    const from     = (page - 1) * pageSize;
    const to       = from + pageSize - 1;

    let query = supabase
      .from("job_listings")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (filters.category && filters.category !== "All") {
      query = query.eq("category", sanitize(filters.category));
    }
    if (filters.searchQuery) {
      // Search title AND company (OR logic)
      const q = sanitize(filters.searchQuery);
      query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
    }
    if (filters.location) {
      query = query.ilike("city", `%${sanitize(filters.location)}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { data: [], total: 0, page, pageSize, hasNextPage: false, error: friendlyError(error, "Could not load jobs.") };
    }

    const total = count ?? 0;
    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));

    return {
      data:        items,
      total,
      page,
      pageSize,
      hasNextPage: from + pageSize < total,
      error:       null,
    };
  } catch (err) {
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: friendlyError(err, "Failed to load jobs.") };
  }
}

// ─── Get Job by ID ────────────────────────────────────────────────────────────
export async function getJobById(id: string): Promise<JobResponse> {
  try {
    // Validate UUID-ish format before hitting DB
    if (!id || id.length < 8) {
      return { data: null, error: "Invalid job ID." };
    }

    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return { data: null, error: "Job not found." };
      return { data: null, error: friendlyError(error, "Could not load job.") };
    }

    return { data: mapRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    return { data: null, error: friendlyError(err, "Failed to load job.") };
  }
}

// ─── Create Job ───────────────────────────────────────────────────────────────
export async function createJob(
  employerId: string,
  payload: Omit<JobListing, "id" | "employerId" | "viewCount" | "applicationCount" | "createdAt" | "updatedAt">
): Promise<JobActionResponse> {
  // Pre-validate required fields before sending to DB
  if (!employerId)            return { success: false, error: "Employer ID is required." };
  if (!payload.title?.trim()) return { success: false, error: "Job title is required." };
  if (!payload.description?.trim()) return { success: false, error: "Job description is required." };
  if (!payload.category)      return { success: false, error: "Category is required." };
  if (!payload.location?.city?.trim()) return { success: false, error: "City is required." };

  try {
    const { data, error } = await supabase
      .from("job_listings")
      .insert({
        employer_id:          employerId,
        title:                payload.title.trim(),
        company:              payload.company?.trim(),
        description:          payload.description.trim(),
        requirements:         payload.requirements,
        benefits:             payload.benefits,
        category:             payload.category,
        job_type:             payload.jobType,
        experience_level:     payload.experienceLevel,
        salary_min_xaf:       payload.salaryMinXAF,
        salary_max_xaf:       payload.salaryMaxXAF,
        is_salary_negotiable: payload.isSalaryNegotiable,
        city:                 payload.location.city.trim(),
        region:               payload.location.region,
        country:              payload.location.country ?? "CM",
        is_remote:            payload.isRemote,
        application_deadline: payload.applicationDeadline,
        status:               payload.status ?? "active",
        tags:                 Array.isArray(payload.tags) ? payload.tags : [],
        view_count:           0,
        application_count:    0,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: friendlyError(error, "Failed to post job.") };

    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    return { success: false, error: friendlyError(err, "Failed to post job.") };
  }
}

// ─── Update Job ───────────────────────────────────────────────────────────────
export async function updateJob(
  id: string,
  employerId: string,
  updates: Partial<JobListing>
): Promise<JobActionResponse> {
  if (!id || !employerId) return { success: false, error: "Missing required identifiers." };

  try {
    // Only map known safe fields — never spread arbitrary payload
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title       !== undefined) payload.title               = updates.title.trim();
    if (updates.description !== undefined) payload.description         = updates.description.trim();
    if (updates.company     !== undefined) payload.company             = updates.company?.trim();
    if (updates.status      !== undefined) payload.status              = updates.status;
    if (updates.salaryMinXAF !== undefined) payload.salary_min_xaf    = updates.salaryMinXAF;
    if (updates.salaryMaxXAF !== undefined) payload.salary_max_xaf    = updates.salaryMaxXAF;
    if (updates.applicationDeadline !== undefined) payload.application_deadline = updates.applicationDeadline;
    if (updates.requirements !== undefined) payload.requirements       = updates.requirements;
    if (updates.benefits    !== undefined) payload.benefits            = updates.benefits;
    if (updates.tags        !== undefined) payload.tags                = Array.isArray(updates.tags) ? updates.tags : [];

    const { error } = await supabase
      .from("job_listings")
      .update(payload)
      .eq("id", id)
      .eq("employer_id", employerId); // RLS: employer can only edit own listings

    if (error) return { success: false, error: friendlyError(error, "Failed to update job.") };

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: friendlyError(err, "Failed to update job.") };
  }
}

// ─── Delete Job ───────────────────────────────────────────────────────────────
export async function deleteJob(
  id: string,
  employerId: string
): Promise<JobActionResponse> {
  if (!id || !employerId) return { success: false, error: "Missing required identifiers." };

  try {
    const { error } = await supabase
      .from("job_listings")
      .delete()
      .eq("id", id)
      .eq("employer_id", employerId); // RLS: employer can only delete own listings

    if (error) return { success: false, error: friendlyError(error, "Failed to delete job.") };

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: friendlyError(err, "Failed to delete job.") };
  }
}

// ─── Increment View (rate-limited) ────────────────────────────────────────────
export async function incrementJobView(id: string): Promise<void> {
  if (!id) return;
  if (!canIncrementView(id)) return; // client-side throttle

  try {
    await supabase.rpc("increment_view_count", {
      table_name: "job_listings",
      record_id:  id,
    });
  } catch {
    // Non-critical — silently fail
  }
}

// ─── Get My Jobs ──────────────────────────────────────────────────────────────
export async function getMyJobs(employerId: string): Promise<JobListResponse> {
  if (!employerId) return { data: [], total: 0, error: "Employer ID required." };

  try {
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .eq("employer_id", employerId)
      .order("created_at", { ascending: false });

    if (error) return { data: [], total: 0, error: friendlyError(error, "Failed to load your jobs.") };

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total: items.length, error: null };
  } catch (err) {
    return { data: [], total: 0, error: friendlyError(err, "Failed to load your jobs.") };
  }
}

// ─── Get Expiring Jobs (for reminder system) ──────────────────────────────────
/**
 * Returns active jobs whose application_deadline is within `withinDays` days.
 * Used by:
 *  - A Supabase Edge Function cron job that sends push/email reminders to employers
 *  - The employer dashboard "expiring soon" warning panel
 *
 * NOTE: This function should only be called server-side or by authenticated employers.
 * The RLS policy on job_listings already restricts access to employer_id rows.
 */
export async function getExpiringJobs(
  employerId: string,
  withinDays = 3
): Promise<JobListResponse> {
  if (!employerId) return { data: [], total: 0, error: "Employer ID required." };

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);

    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .eq("employer_id", employerId)
      .eq("status", "active")
      .lte("application_deadline", cutoff.toISOString())
      .gte("application_deadline", new Date().toISOString()) // not yet expired
      .order("application_deadline", { ascending: true });

    if (error) return { data: [], total: 0, error: friendlyError(error, "Failed to check expiring jobs.") };

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total: items.length, error: null };
  } catch (err) {
    return { data: [], total: 0, error: friendlyError(err, "Failed to check expiring jobs.") };
  }
}
