export const APP_ROLES = [
  "admin",
  "organization",
  "team_lead",
  "operator",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  organization: "Organization",
  team_lead: "Team Lead",
  operator: "Operator",
};

export const normalizeRole = (role?: string | null): AppRole | null => {
  const normalized = role?.toLowerCase();
  return APP_ROLES.includes(normalized as AppRole)
    ? (normalized as AppRole)
    : null;
};

export const hasRole = (
  currentRole: string | null | undefined,
  allowedRoles: AppRole[]
) => {
  const role = normalizeRole(currentRole);
  return Boolean(role && allowedRoles.includes(role));
};

export const getAllowedCreatableUserRoles = (
  currentRole?: string | null
): AppRole[] => {
  switch (normalizeRole(currentRole)) {
    case "admin":
      return ["organization", "team_lead", "operator"];
    case "organization":
      return ["team_lead", "operator"];
    case "team_lead":
      return ["operator"];
    default:
      return [];
  }
};

export const getAllowedEditableUserRoles = (
  currentRole?: string | null
): AppRole[] => {
  switch (normalizeRole(currentRole)) {
    case "admin":
      return ["admin", "organization", "team_lead", "operator"];
    case "organization":
      return ["team_lead", "operator"];
    case "team_lead":
      return ["operator"];
    default:
      return [];
  }
};

export const canAccessSettings = (role?: string | null) =>
  hasRole(role, ["admin", "organization", "team_lead", "operator"]);

export const canCreateSites = (role?: string | null) =>
  hasRole(role, ["admin", "organization"]);

export const canViewSensors = (role?: string | null) =>
  hasRole(role, ["admin", "team_lead"]);

export const canEditSensors = (role?: string | null) => hasRole(role, ["admin"]);

export const canViewUsers = (role?: string | null) =>
  hasRole(role, ["admin", "organization", "team_lead"]);

export const canCreateUsers = (role?: string | null) =>
  getAllowedCreatableUserRoles(role).length > 0;

export const canManageUsers = (role?: string | null) =>
  hasRole(role, ["admin", "organization"]);
