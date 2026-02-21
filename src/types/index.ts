/** Prisma enum types and values - must match prisma/schema.prisma (avoids @prisma/client export resolution in bundler) */

export type Role = "ADMIN" | "MENTOR" | "TRAINEE";

export type ProgramStatus = "PENDING" | "INACTIVE" | "ACTIVE";
export const ProgramStatus = {
  PENDING: "PENDING",
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
} as const;

export type SubmissionStatus =
  | "PENDING"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "RESUBMIT_REQUESTED";
export const SubmissionStatus = {
  PENDING: "PENDING",
  PENDING_ADMIN_APPROVAL: "PENDING_ADMIN_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RESUBMIT_REQUESTED: "RESUBMIT_REQUESTED",
} as const;

export type ProgressStatus = "ACTIVE" | "PENDING_REVIEW" | "COMPLETED";
export const ProgressStatus = {
  ACTIVE: "ACTIVE",
  PENDING_REVIEW: "PENDING_REVIEW",
  COMPLETED: "COMPLETED",
} as const;

export type ScheduleEventType =
  | "LAB_WORKSHOP"
  | "MENTOR_MEETING"
  | "COURSE_SCHEDULE";
export const ScheduleEventType = {
  LAB_WORKSHOP: "LAB_WORKSHOP",
  MENTOR_MEETING: "MENTOR_MEETING",
  COURSE_SCHEDULE: "COURSE_SCHEDULE",
} as const;

export type ScheduleRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export const ScheduleRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
