/**
 * src/services/jobs.service.ts
 * Bambeh Marketplace — Jobs Service
 * © 2026 Bambeh Marketplace. All rights reserved.
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

// ─── Map DB Row → JobListing ─────────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): JobListing {
  return {
    id: row.id as string,
    employerId: row.employer_id as string,
    title: row.title as string,
    company: row.company as string | undefined,
    description: row.description as string,
    requirements: row.requirements as string | undefined,
    benefits: row.benefits as string | undefined,
    category: row.category as string,
    jobType: row.job_type as JobListing["jobType"],
    experienceLevel: row.experience_level as JobListing["experienceLevel"],
    salaryMinXAF: row.salary_min_xaf as number | undefined,
    salaryMaxXAF: row.salary_max_xaf as number | undefined,
    isSalaryNegotiable: Boolean(row.is_salary_negotiable),
    location: {
      city: row.city as string,
      region: row.region as string,
      country: (row.country as string) ?? "Cameroon",
      latitude: row.latitude as number | undefined,
      longitude: row.longitude as number | undefined,
    },
    isRemote: Boolean(row.is_remote),
    applicationDeadline: row.application_deadline as string | undefined,
    status: row.status as JobListing["status"],
    viewCount: (row.view_count as number) ?? 0,
    applicationCount: (row.application_count as number) ?? 0,
    tags: row.tags as string[] | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Get All Jobs ─────────────────────────────────────────────────────────────
export async function getJobs(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<JobListing>> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("job_listings")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (filters.searchQuery) {
      query = query.ilike("title", `%${filters.searchQuery}%`);
    }
    if (filters.location) {
      query = query.ilike("city", `%${filters.location}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { data: [], total: 0, page, pageSize, hasNextPage: false, error: error.message };
    }

    const total = count ?? 0;
    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));

    return {
      data: items,
      total,
      page,
      pageSize,
      hasNextPage: from + pageSize < total,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load jobs";
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: message };
  }
}

// ─── Get Job by ID ────────────────────────────────────────────────────────────
export async function getJobById(id: string): Promise<JobResponse> {
  try {
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: mapRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load job";
    return { data: null, error: message };
  }
}

// ─── Create Job ───────────────────────────────────────────────────────────────
export async function createJob(
  employerId: string,
  payload: Omit<JobListing, "id" | "employerId" | "viewCount" | "applicationCount" | "createdAt" | "updatedAt">
): Promise<JobActionResponse> {
  try {
    const { data, error } = await supabase
      .from("job_listings")
      .insert({
        employer_id: employerId,
        title: payload.title,
        company: payload.company,
        description: payload.description,
        requirements: payload.requirements,
        benefits: payload.benefits,
        category: payload.category,
        job_type: payload.jobType,
        experience_level: payload.experienceLevel,
        salary_min_xaf: payload.salaryMinXAF,
        salary_max_xaf: payload.salaryMaxXAF,
        is_salary_negotiable: payload.isSalaryNegotiable,
        city: payload.location.city,
        region: payload.location.region,
        country: payload.location.country ?? "Cameroon",
        is_remote: payload.isRemote,
        application_deadline: payload.applicationDeadline,
        status: payload.status ?? "active",
        tags: payload.tags ?? [],
        view_count: 0,
        application_count: 0,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create job";
    return { success: false, error: message };
  }
}

// ─── Update Job ───────────────────────────────────────────────────────────────
export async function updateJob(
  id: string,
  employerId: string,
  updates: Partial<JobListing>
): Promise<JobActionResponse> {
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.salaryMinXAF !== undefined) payload.salary_min_xaf = updates.salaryMinXAF;
    if (updates.salaryMaxXAF !== undefined) payload.salary_max_xaf = updates.salaryMaxXAF;
    if (updates.applicationDeadline !== undefined) payload.application_deadline = updates.applicationDeadline;

    const { error } = await supabase
      .from("job_listings")
      .update(payload)
      .eq("id", id)
      .eq("employer_id", employerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update job";
    return { success: false, error: message };
  }
}

// ─── Delete Job ───────────────────────────────────────────────────────────────
export async function deleteJob(
  id: string,
  employerId: string
): Promise<JobActionResponse> {
  try {
    const { error } = await supabase
      .from("job_listings")
      .delete()
      .eq("id", id)
      .eq("employer_id", employerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete job";
    return { success: false, error: message };
  }
}

// ─── Increment View ───────────────────────────────────────────────────────────
export async function incrementJobView(id: string): Promise<void> {
  try {
    await supabase.rpc("increment_view_count", {
      table_name: "job_listings",
      record_id: id,
    });
  } catch {
    // Non-critical — silently fail
  }
}

// ─── Get My Jobs ──────────────────────────────────────────────────────────────
export async function getMyJobs(employerId: string): Promise<JobListResponse> {
  try {
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .eq("employer_id", employerId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], total: 0, error: error.message };
    }

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total: items.length, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load your jobs";
    return { data: [], total: 0, error: message };
  }
}
