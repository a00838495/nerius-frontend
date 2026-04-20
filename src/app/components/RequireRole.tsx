import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

type Role = "super_admin" | "content_admin" | "content_editor" | "content_viewer" | "learner";

interface RequireRoleProps {
  allowedRoles: Role[];
}

/**
 * Route guard that allows access only if the current user has any of the allowed roles.
 */
export function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleNames = (user.role_names ?? []) as Role[];
  const hasAccess = roleNames.some((r) => allowedRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/**
 * Hook returning the current user's role-based capabilities.
 *
 * Admin role hierarchy (within admin scope):
 * - super_admin    : all permissions
 * - content_admin  : Rol 1 — full admin (create/publish/edit/delete)
 * - content_editor : Rol 2 — edit existing courses, cannot create/publish
 * - content_viewer : Rol 3 — no access to course management (no Cursos tab)
 */
export function useUserRoles() {
  const { user } = useAuth();
  const roleNames = (user?.role_names ?? []) as Role[];

  const hasRole = (r: Role) => roleNames.includes(r);

  const isSuperAdmin = hasRole("super_admin");
  const isContentAdmin = hasRole("content_admin");
  const isContentEditor = hasRole("content_editor");
  const isContentViewer = hasRole("content_viewer");
  const isLearner = hasRole("learner");

  // Panel access
  const canAccessUserPanel = true; // anyone authenticated
  const canAccessAdminPanel = isSuperAdmin || isContentAdmin || isContentEditor || isContentViewer;
  const canAccessSuperAdminPanel = isSuperAdmin;

  // Course management capabilities (within admin scope)
  // Viewer: no course access at all
  const canAccessCoursesSection = isSuperAdmin || isContentAdmin || isContentEditor;
  // Editor+: can edit existing courses
  const canEditCourse = isSuperAdmin || isContentAdmin || isContentEditor;
  // Admin+: can create/publish/archive courses
  const canCreateCourse = isSuperAdmin || isContentAdmin;
  const canPublishCourse = isSuperAdmin || isContentAdmin;
  const canDeleteCourse = isSuperAdmin || isContentAdmin;

  return {
    roleNames,
    // Role flags
    isSuperAdmin,
    isContentAdmin,
    isContentEditor,
    isContentViewer,
    isLearner,
    // Backward compat
    isAdmin: canAccessAdminPanel,
    role: user?.role_name ?? null,
    // Panel access
    canAccessUserPanel,
    canAccessAdminPanel,
    canAccessSuperAdminPanel,
    // Course capabilities
    canAccessCoursesSection,
    canEditCourse,
    canCreateCourse,
    canPublishCourse,
    canDeleteCourse,
  };
}
