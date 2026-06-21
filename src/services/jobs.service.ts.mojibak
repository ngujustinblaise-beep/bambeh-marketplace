/**
 * src/services/jobs.service.ts
 * Bambeh Marketplace — Jobs Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ─── IMPORTANT ───────────────────────────────────────────────────────────────
 * Bambeh uses ONE "listings" table for ALL content types.
 * Jobs are stored as: listings WHERE type = 'job'
 * Job-specific fields are stored in the listings.extra JSONB column.
 *
 * Column mapping (listings → JobListing):
 *   listings.id                → id
 *   listings.user_id           → employerId
 *   listings.title             → title
 *   listings.description       → description
 *   listings.category          → category
 *   listings.location          → location.city
 *   listings.country           → location.country
 *   listings.price             → salaryMinXAF  (re-purposed)
 *   listings.tags              → tags
 *   listings.view_count        → viewCount
 *   listings.status            → status
 *   listings.extra.company          → company
 *   listings.extra.logo_url         → companyLogoUrl  â† NEW: company logo
 *   listings.extra.job_type         → jobType
 *   listings.extra.exp_level        → experienceLevel
 *   listings.extra.salary_max       → salaryMaxXAF
 *   listings.extra.negotiable       → isSalaryNegotiable
 *   listings.extra.region           → location.region
 *   listings.extra.is_remote        → isRemote
 *   listings.extra.deadline         → applicationDeadline
 *   listings.extra.application_count → applicationCount
 *   listings.extra.apply_method      → applyMethod  ('whatsapp'|'call'|'email'|'in_app')
 *   listings.extra.apply_contact     → applyContact (phone/email string)
 *   listings.extra.requirements      → requirements
 *   listings.extra.benefits          → benefits
 */

import { supabase } from "@/lib/supabase";
import type { JobListing, ItemFilters, PaginatedItemsResponse } from "@/types/src_types_items";

// ─── Response Types ────────────────────────────────────────────────────────────
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

// ─── Row → JobListing mapper ───────────────────────────────────────────────────
function mapRow(row: Record<string, any>): JobListing {
  const extra = (row.extra ?? {}) as Record<string, any>;
  return {
    id:                 row.id ?? "",
    employerId:         row.user_id ?? row.seller_id ?? "",
    title:              row.title ?? "",
    company:            extra.company ?? row.company ?? undefined,
    companyLogoUrl:     extra.logo_url ?? undefined,          // â† company logo
    description:        row.description ?? "",
    requirements:       extra.requirements ?? undefined,
    benefits:           extra.benefits ?? undefined,
    category:           row.category ?? "",
    jobType:            extra.job_type ?? extra.jobType ?? "full_time",
    experienceLevel:    extra.exp_level ?? extra.experienceLevel ?? "entry",
    salaryMinXAF:       row.price ? Number(row.price) : undefined,
    salaryMaxXAF:       extra.salary_max ? Number(extra.salary_max) : undefined,
    isSalaryNegotiable: Boolean(extra.negotiable ?? extra.isSalaryNegotiable),
    location: {
      city:      row.location ?? extra.city ?? "",
      region:    extra.region ?? "",
      country:   row.country  ?? extra.country ?? "Cameroon",
      latitude:  extra.latitude  ? Number(extra.latitude)  : undefined,
      longitude: extra.longitude ? Number(extra.longitude) : undefined,
    },
    isRemote:            Boolean(extra.is_remote ?? extra.isRemote),
    applicationDeadline: extra.deadline ?? extra.applicationDeadline ?? undefined,
    applyMethod:         extra.apply_method ?? "in_app",
    applyContact:        extra.apply_contact ?? undefined,
    status:              (row.status as JobListing["status"]) ?? "active",
    viewCount:           Number(row.view_count ?? 0),
    applicationCount:    Number(extra.application_count ?? 0),
    tags:                Array.isArray(row.tags) ? row.tags : Array.isArray(extra.tags) ? extra.tags : [],
    createdAt:           row.created_at ?? new Date().toISOString(),
    updatedAt:           row.updated_at ?? new Date().toISOString(),
  };
}

// ─── Get Jobs (paginated + filtered) ──────────────────────────────────────────
export async function getJobs(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<JobListing>> {
  try {
    const page     = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 80);
    const from     = (page - 1) * pageSize;
    const to       = from + pageSize - 1;

    let query = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "job")
      .eq("status", "active");

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.searchQuery) {
      query = query.or(
        `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
      );
    }
    if (filters.location) query = query.ilike("location", `%${filters.location}%`);

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("[jobs.service] getJobs:", error.message);
      return { data: [], total: 0, page, pageSize, hasNextPage: false, error: error.message };
    }

    const total = count ?? 0;
    const items = (data ?? []).map((row) => mapRow(row as Record<string, any>));

    return { data: items, total, page, pageSize, hasNextPage: from + pageSize < total, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load jobs";
    console.error("[jobs.service] getJobs exception:", msg);
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: msg };
  }
}

// ─── Get Job by ID ─────────────────────────────────────────────────────────────
export async function getJobById(id: string): Promise<JobResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("type", "job")
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data)  return { data: null, error: "Job not found" };

    return { data: mapRow(data as Record<string, any>), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to load job" };
  }
}

// ─── Create Job ────────────────────────────────────────────────────────────────
export async function createJob(
  employerId: string,
  payload: Omit<JobListing, "id" | "employerId" | "viewCount" | "applicationCount" | "createdAt" | "updatedAt">
): Promise<JobActionResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id:     employerId,
        type:        "job",
        title:       payload.title,
        description: payload.description,
        category:    payload.category,
        location:    payload.location.city,
        country:     payload.location.country ?? "Cameroon",
        price:       payload.salaryMinXAF ?? null,
        status:      payload.status ?? "active",
        tags:        payload.tags ?? [],
        view_count:  0,
        is_featured: false,
        extra: {
          company:           payload.company ?? null,
          logo_url:          (payload as any).companyLogoUrl ?? null,
          requirements:      payload.requirements ?? null,
          benefits:          payload.benefits ?? null,
          job_type:          payload.jobType,
          exp_level:         payload.experienceLevel,
          salary_max:        payload.salaryMaxXAF ?? null,
          negotiable:        payload.isSalaryNegotiable,
          region:            payload.location.region ?? payload.location.city,
          is_remote:         payload.isRemote,
          deadline:          payload.applicationDeadline ?? null,
          apply_method:      (payload as any).applyMethod ?? "in_app",
          apply_contact:     (payload as any).applyContact ?? null,
          application_count: 0,
        },
      })
      .select("id")
      .single();

    if (error) {
      console.error("[jobs.service] createJob:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create job" };
  }
}

// ─── Update Job ────────────────────────────────────────────────────────────────
export async function updateJob(
  id: string,
  employerId: string,
  updates: Partial<JobListing>
): Promise<JobActionResponse> {
  try {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.title       !== undefined) payload.title       = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status      !== undefined) payload.status      = updates.status;
    if (updates.salaryMinXAF !== undefined) payload.price      = updates.salaryMinXAF;
    if (updates.category    !== undefined) payload.category    = updates.category;
    if (updates.location?.city !== undefined) payload.location = updates.location.city;

    const needsExtraUpdate =
      updates.salaryMaxXAF !== undefined ||
      updates.applicationDeadline !== undefined ||
      updates.jobType !== undefined ||
      updates.isRemote !== undefined ||
      updates.requirements !== undefined ||
      updates.benefits !== undefined ||
      (updates as any).companyLogoUrl !== undefined;

    if (needsExtraUpdate) {
      const { data: existing } = await supabase
        .from("listings").select("extra").eq("id", id).maybeSingle();

      payload.extra = {
        ...(existing?.extra ?? {}),
        ...(updates.salaryMaxXAF        !== undefined ? { salary_max: updates.salaryMaxXAF }        : {}),
        ...(updates.applicationDeadline !== undefined ? { deadline: updates.applicationDeadline }   : {}),
        ...(updates.jobType             !== undefined ? { job_type: updates.jobType }               : {}),
        ...(updates.isRemote            !== undefined ? { is_remote: updates.isRemote }             : {}),
        ...(updates.requirements        !== undefined ? { requirements: updates.requirements }       : {}),
        ...(updates.benefits            !== undefined ? { benefits: updates.benefits }               : {}),
        ...((updates as any).companyLogoUrl !== undefined ? { logo_url: (updates as any).companyLogoUrl } : {}),
      };
    }

    const { error } = await supabase
      .from("listings").update(payload).eq("id", id).eq("user_id", employerId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update job" };
  }
}

// ─── Delete Job ────────────────────────────────────────────────────────────────
export async function deleteJob(id: string, employerId: string): Promise<JobActionResponse> {
  try {
    const { error } = await supabase
      .from("listings").delete().eq("id", id).eq("user_id", employerId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete job" };
  }
}

// ─── Increment View ────────────────────────────────────────────────────────────
export async function incrementJobView(id: string): Promise<void> {
  try {
    await supabase.rpc("increment_view_count", { table_name: "listings", record_id: id });
  } catch {
    // Non-critical — silently fail
  }
}

// ─── Get My Jobs ───────────────────────────────────────────────────────────────
export async function getMyJobs(employerId: string): Promise<JobListResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("type", "job")
      .eq("user_id", employerId)
      .order("created_at", { ascending: false });

    if (error) return { data: [], total: 0, error: error.message };

    const items = (data ?? []).map((row) => mapRow(row as Record<string, any>));
    return { data: items, total: items.length, error: null };
  } catch (err) {
    return { data: [], total: 0, error: err instanceof Error ? err.message : "Failed to load your jobs" };
  }
}

// ─── Apply for Job (in-app) ────────────────────────────────────────────────────
export async function applyForJob(
  jobId: string,
  applicantId: string
): Promise<JobActionResponse> {
  try {
    // Check for duplicate application
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("applicant_id", applicantId)
      .maybeSingle();

    if (existing) return { success: false, error: "already_applied" };

    const { error } = await supabase.from("job_applications").insert({
      job_id:       jobId,
      applicant_id: applicantId,
      status:       "pending",
      applied_at:   new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };

    // Bump application count (non-critical)
    try {
      const { data: row } = await supabase
        .from("listings").select("extra").eq("id", jobId).maybeSingle();
      if (row) {
        const extra = row.extra ?? {};
        const newCount = Number(extra.application_count ?? 0) + 1;
        await supabase
          .from("listings")
          .update({ extra: { ...extra, application_count: newCount } })
          .eq("id", jobId);
      }
    } catch { /* non-critical */ }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to apply" };
  }
}
