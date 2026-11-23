import type { PropertyStatus } from "../types";

export const naira = (amount: number | string) =>
  "₦" + new Intl.NumberFormat("en-NG").format(Number(amount) || 0);

export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(iso))
    : "-";

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const statusLabel: Record<PropertyStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const listingTypeLabel = {
  rent: "Rent",
  sale: "Buy",
  land: "Land",
} as const;

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];
