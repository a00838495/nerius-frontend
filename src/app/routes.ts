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
import { AdminCoursesList } from './pages/admin/AdminCoursesList';
import { AdminCourseCreate } from './pages/admin/AdminCourseCreate';
import { AdminCourseEdit } from './pages/admin/AdminCourseEdit';
import { SuperAdminUsersManagement } from './pages/superadmin/SuperAdminUsersManagement';
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
              { path: 'cursos', Component: AdminCoursesList },
              { path: 'cursos/nuevo', Component: AdminCourseCreate },
              { path: 'cursos/:courseId/editar', Component: AdminCourseEdit },
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
              { path: 'administradores', Component: SuperAdminUsersManagement },
            ],
          },
        ],
      },
    ],
  },
]);
