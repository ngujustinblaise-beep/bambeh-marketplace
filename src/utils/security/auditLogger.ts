/**
 * src/utils/security/auditLogger.ts
 * FIXES: exports auditLogger singleton (TS2304)
 */

export type AuditEventType =
  | "auth.login" | "auth.logout" | "auth.register" | "auth.failed"
  | "data.read" | "data.write" | "data.delete"
  | "payment.initiated" | "payment.completed" | "payment.failed"
  | "admin.action" | "security.violation" | "security.suspicious"
  | "vendor.register" | "vendor.update" | "listing.create" | "listing.delete";

export interface AuditEvent {
  id: string;
  type: AuditEventType | string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  severity: "info" | "warning" | "critical";
  timestamp: string;
}

class AuditLoggerClass {
  private events: AuditEvent[] = [];
  private maxEvents = 500;

  log(
    type: AuditEventType | string,
    metadata: Record<string, unknown> = {},
    severity: AuditEvent["severity"] = "info"
  ): void {
    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      metadata,
      severity,
      timestamp: new Date().toISOString(),
    };
    this.events = [event, ...this.events].slice(0, this.maxEvents);
    if (severity === "critical") {
      console.warn("[AuditLog] CRITICAL:", type, metadata);
    }
    // In production, events would be sent to a Supabase edge function
    if (import.meta.env.PROD) {
      void this.persistEvent(event);
    }
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("audit_logs").insert({
        event_type: event.type,
        user_id: event.userId ?? null,
        metadata: event.metadata ?? {},
        severity: event.severity,
        created_at: event.timestamp,
      });
    } catch { /* non-critical */ }
  }

  getEvents(): AuditEvent[] { return [...this.events]; }
  getCritical(): AuditEvent[] { return this.events.filter(e => e.severity === "critical"); }
  clear(): void { this.events.length = 0; }

  logAuthEvent(action: string, userId?: string, success = true): void {
    this.log(`auth.${action}`, { userId, success }, success ? "info" : "warning");
  }

  logSecurityViolation(description: string, metadata?: Record<string, unknown>): void {
    this.log("security.violation", { description, ...metadata }, "critical");
  }

  logPayment(action: string, reference: string, amount?: number): void {
    this.log(`payment.${action}`, { reference, amount }, "info");
  }
}

// --- Singleton � fixes TS2304 -------------------------------------------------
export const auditLogger = new AuditLoggerClass();

export default auditLogger;

