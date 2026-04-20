import { RequireRole } from "./RequireRole";

export function RequireAdmin() {
  return <RequireRole allowedRoles={["content_admin", "content_editor", "content_viewer", "super_admin"]} />;
}

export function RequireSuperAdmin() {
  return <RequireRole allowedRoles={["super_admin"]} />;
}

/** Only admins who can access courses section (NOT content_viewer). */
export function RequireCourseAccess() {
  return <RequireRole allowedRoles={["content_admin", "content_editor", "super_admin"]} />;
}
