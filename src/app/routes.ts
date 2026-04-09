import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LearningContent } from './pages/LearningContent';
import { MyProgress } from './pages/MyProgress';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { LoginPage } from './pages/LoginPage';
import { CourseView } from './pages/CourseView';
import { Forum } from './pages/Forum';
import { ForumPostDetail } from './pages/ForumPostDetail';
import GemBank from './pages/GemBank';
import GemDetail from './pages/GemDetail';
import { RequireAuth } from './components/RequireAuth';

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
          { path: 'progress', Component: MyProgress },
          { path: 'profile', Component: Profile },
          { path: 'search', Component: Search },
        ],
      },
    ],
  },
]);
