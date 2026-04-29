import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { SuperAdminLayout } from './components/SuperAdminLayout';
import { Home } from './pages/Home';
import { LearningContent } from './pages/LearningContent';
import { Profile } from './pages/Profile';
import { LoginPage } from './pages/LoginPage';
import { CourseView } from './pages/CourseView';
import { Forum } from './pages/Forum';
import { ForumPostDetail } from './pages/ForumPostDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';

// Admin pages (existing — kept untouched)
import { AdminCoursesList } from './pages/admin/AdminCoursesList';
import { AdminCourseCreate } from './pages/admin/AdminCourseCreate';
import { AdminCourseEdit } from './pages/admin/AdminCourseEdit';

// Admin pages (new modules)
import { AdminUsersList } from './pages/admin/AdminUsersList';
import { AdminAreasList } from './pages/admin/AdminAreasList';
import { AdminAssignmentsList } from './pages/admin/AdminAssignmentsList';
import { AdminEnrollmentsList } from './pages/admin/AdminEnrollmentsList';
import { AdminForumModeration } from './pages/admin/AdminForumModeration';
import { AdminGemsList } from './pages/admin/AdminGemsList';
import { AdminBadgesList } from './pages/admin/AdminBadgesList';
import { AdminCertificationsList } from './pages/admin/AdminCertificationsList';
import { AdminReports } from './pages/admin/AdminReports';

// Super admin pages (existing kept)
import { SuperAdminUsersManagement } from './pages/superadmin/SuperAdminUsersManagement';

// Super admin pages (new)
import { SuperAdminSystem } from './pages/superadmin/SuperAdminSystem';
import { SuperAdminSessions } from './pages/superadmin/SuperAdminSessions';
import { SuperAdminMetrics } from './pages/superadmin/SuperAdminMetrics';
import { SuperAdminAudit } from './pages/superadmin/SuperAdminAudit';
import { SuperAdminAdminActivity } from './pages/superadmin/SuperAdminAdminActivity';

import GemBank from './pages/GemBank';
import GemDetail from './pages/GemDetail';
import { RequireAuth } from './components/RequireAuth';
import { RequireAdmin, RequireSuperAdmin } from './components/RequireAdminRole';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: RequireAuth,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Home },
          { path: 'learning', Component: LearningContent },
          { path: 'courses/:courseId', Component: CourseView },
          { path: 'forum', Component: Forum },
          { path: 'forum/:postId', Component: ForumPostDetail },
          { path: 'gems', Component: GemBank },
          { path: 'gems/:gemId', Component: GemDetail },
          { path: 'profile', Component: Profile },
        ],
      },
      {
        path: '/admin',
        Component: RequireAdmin,
        children: [
          {
            path: '/admin',
            Component: AdminLayout,
            children: [
              { index: true, Component: AdminDashboard },
              // Existing course management (kept untouched)
              { path: 'cursos', Component: AdminCoursesList },
              { path: 'cursos/nuevo', Component: AdminCourseCreate },
              { path: 'cursos/:courseId/editar', Component: AdminCourseEdit },
              // New admin modules
              { path: 'usuarios', Component: AdminUsersList },
              { path: 'areas', Component: AdminAreasList },
              { path: 'asignaciones', Component: AdminAssignmentsList },
              { path: 'inscripciones', Component: AdminEnrollmentsList },
              { path: 'foro', Component: AdminForumModeration },
              { path: 'gemas', Component: AdminGemsList },
              { path: 'badges', Component: AdminBadgesList },
              { path: 'certificaciones', Component: AdminCertificationsList },
              { path: 'reportes', Component: AdminReports },
            ],
          },
        ],
      },
      {
        path: '/superadmin',
        Component: RequireSuperAdmin,
        children: [
          {
            path: '/superadmin',
            Component: SuperAdminLayout,
            children: [
              { index: true, Component: SuperAdminDashboard },
              { path: 'sistema', Component: SuperAdminSystem },
              { path: 'sesiones', Component: SuperAdminSessions },
              { path: 'metricas', Component: SuperAdminMetrics },
              { path: 'auditoria', Component: SuperAdminAudit },
              { path: 'actividad-admins', Component: SuperAdminAdminActivity },
              { path: 'administradores', Component: SuperAdminUsersManagement },
            ],
          },
        ],
      },
    ],
  },
]);
