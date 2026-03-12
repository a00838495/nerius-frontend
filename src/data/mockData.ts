export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'not_started' | 'in_progress' | 'completed';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  duration: string;
  durationMinutes: number;
  image: string;
  progress: number;
  status: CourseStatus;
  rating: number;
  enrollments: number;
  category: string;
  tags: string[];
  instructor: string;
  modules: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  department: string;
  isCurrentUser?: boolean;
  badge?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  color: string;
}

export interface WeeklyProgress {
  day: string;
  hours: number;
}

export const CURRENT_USER = {
  id: 'u003',
  name: 'Sarah Johnson',
  firstName: 'Sarah',
  avatar: 'https://images.unsplash.com/photo-1762522926984-e721bff0d6c6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGNvcnBvcmF0ZSUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzcyMTI1MDUxfDA&ixlib=rb-4.1.0&q=80&w=80',
  department: 'Digital Innovation',
  role: 'Product Manager',
  level: 'AI Practitioner',
  levelNumber: 4,
  levelProgress: 72,
  nextLevel: 'AI Specialist',
  points: 2480,
  rank: 3,
  rankBelow: 'Elena Rodriguez',
  completedCourses: 2,
  inProgressCourses: 2,
  avgScore: 88,
  totalHours: 14,
  streak: 7,
};

export const COURSES: Course[] = [
  {
    id: 'c001',
    title: 'AI Fundamentals',
    description: 'Master the core concepts of Artificial Intelligence, including key terminology, use cases, and the AI landscape in modern business.',
    level: 'Beginner',
    duration: '4h 30m',
    durationMinutes: 270,
    image: 'https://images.unsplash.com/photo-1770170389700-eb0f9b910ed8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 65,
    status: 'in_progress',
    rating: 4.8,
    enrollments: 1240,
    category: 'Foundations',
    tags: ['AI', 'Basics', 'Strategy'],
    instructor: 'Dr. Maria Chen',
    modules: 8,
  },
  {
    id: 'c002',
    title: 'Machine Learning Essentials',
    description: 'Explore supervised and unsupervised learning, model evaluation, and real-world ML applications for enterprise environments.',
    level: 'Intermediate',
    duration: '8h 15m',
    durationMinutes: 495,
    image: 'https://images.unsplash.com/photo-1761740533449-b8d4385e60b0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 30,
    status: 'in_progress',
    rating: 4.7,
    enrollments: 986,
    category: 'Machine Learning',
    tags: ['ML', 'Algorithms', 'Data'],
    instructor: 'Prof. James Liu',
    modules: 12,
  },
  {
    id: 'c003',
    title: 'Prompt Engineering Mastery',
    description: 'Learn how to design, optimize and deploy effective prompts for large language models in business contexts.',
    level: 'Beginner',
    duration: '3h 00m',
    durationMinutes: 180,
    image: 'https://images.unsplash.com/photo-1568716353609-12ddc5c67f04?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 0,
    status: 'not_started',
    rating: 4.9,
    enrollments: 2150,
    category: 'Generative AI',
    tags: ['Prompts', 'LLMs', 'ChatGPT'],
    instructor: 'Alex Rivera',
    modules: 6,
  },
  {
    id: 'c004',
    title: 'Computer Vision & Deep Learning',
    description: 'Deep dive into convolutional neural networks, object detection, and image classification for industrial applications.',
    level: 'Advanced',
    duration: '12h 45m',
    durationMinutes: 765,
    image: 'https://images.unsplash.com/photo-1695902173528-0b15104c4554?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 0,
    status: 'not_started',
    rating: 4.6,
    enrollments: 654,
    category: 'Deep Learning',
    tags: ['CV', 'Neural Networks', 'Images'],
    instructor: 'Dr. Priya Sharma',
    modules: 18,
  },
  {
    id: 'c005',
    title: 'Natural Language Processing',
    description: 'Understand text analytics, sentiment analysis, named entity recognition and transformers for business intelligence.',
    level: 'Intermediate',
    duration: '6h 20m',
    durationMinutes: 380,
    image: 'https://images.unsplash.com/photo-1704969724000-154d4fb94344?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 0,
    status: 'not_started',
    rating: 4.5,
    enrollments: 823,
    category: 'NLP',
    tags: ['NLP', 'Text', 'Transformers'],
    instructor: 'Dr. Omar Hassan',
    modules: 10,
  },
  {
    id: 'c006',
    title: 'AI Ethics & Governance',
    description: 'Navigate the ethical landscape of AI: bias, fairness, transparency, and responsible AI frameworks for enterprise.',
    level: 'Beginner',
    duration: '2h 30m',
    durationMinutes: 150,
    image: 'https://images.unsplash.com/photo-1531835415135-698b8d7e0ba4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 100,
    status: 'completed',
    rating: 4.8,
    enrollments: 1580,
    category: 'Ethics',
    tags: ['Ethics', 'Governance', 'Policy'],
    instructor: 'Sarah Whitfield',
    modules: 5,
  },
  {
    id: 'c007',
    title: 'Predictive Analytics',
    description: 'Build forecasting models and data pipelines to drive business decisions using statistical and machine learning methods.',
    level: 'Intermediate',
    duration: '5h 00m',
    durationMinutes: 300,
    image: 'https://images.unsplash.com/photo-1761223976378-54f7a5769934?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 0,
    status: 'not_started',
    rating: 4.7,
    enrollments: 745,
    category: 'Analytics',
    tags: ['Analytics', 'Forecasting', 'Statistics'],
    instructor: 'Michael Torres',
    modules: 9,
  },
  {
    id: 'c008',
    title: 'Generative AI for Business',
    description: 'Explore generative AI tools, workflows, and real-world productivity use cases tailored for enterprise teams.',
    level: 'Beginner',
    duration: '3h 30m',
    durationMinutes: 210,
    image: 'https://images.unsplash.com/photo-1641312874336-6279a832a3dc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixlib=rb-4.1.0&q=80&w=360',
    progress: 0,
    status: 'not_started',
    rating: 4.9,
    enrollments: 3200,
    category: 'Generative AI',
    tags: ['GenAI', 'Productivity', 'Business'],
    instructor: 'Lisa Park',
    modules: 7,
  },
  {
    id: 'c009',
    title: 'MLOps & AI Deployment',
    description: 'Learn to operationalize machine learning models at scale using CI/CD pipelines, monitoring, and cloud platforms.',
    level: 'Advanced',
    duration: '10h 00m',
    durationMinutes: 600,
    image: 'https://images.unsplash.com/photo-1770170389700-eb0f9b910ed8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbWFjaGluZSUyMGxlYXJuaW5nJTIwdGVjaG5vbG9neSUyMGFic3RyYWN0fGVufDF8fHx8MTc3MjEyNTA0MHww&ixlib=rb-4.1.0&q=80&w=360',
    progress: 0,
    status: 'not_started',
    rating: 4.6,
    enrollments: 498,
    category: 'MLOps',
    tags: ['MLOps', 'DevOps', 'Cloud'],
    instructor: 'Dr. Kevin Walsh',
    modules: 15,
  },
  {
    id: 'c010',
    title: 'Data-Driven Decision Making',
    description: 'Leverage data storytelling, visualization, and analytical frameworks to inform strategic business decisions.',
    level: 'Beginner',
    duration: '4h 00m',
    durationMinutes: 240,
    image: 'https://images.unsplash.com/photo-1761740533449-b8d4385e60b0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMG5ldXJhbCUyMG5ldHdvcmslMjBkaWdpdGFsJTIwdmlzdWFsaXphdGlvbnxlbnwxfHx8fDE3NzIxMjUwNDF8MA&ixlib=rb-4.1.0&q=80&w=360',
    progress: 100,
    status: 'completed',
    rating: 4.8,
    enrollments: 1890,
    category: 'Foundations',
    tags: ['Data', 'Strategy', 'Decisions'],
    instructor: 'Anna Fischer',
    modules: 8,
  },
];

export const LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'u001',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=48&ixlib=rb-4.1.0&q=80&w=48',
    points: 2840,
    rank: 1,
    department: 'R&D Engineering',
    badge: '🥇',
  },
  {
    id: 'u002',
    name: 'Elena Rodriguez',
    avatar: '',
    points: 2620,
    rank: 2,
    department: 'Product Design',
    badge: '🥈',
  },
  {
    id: 'u003',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1762522926984-e721bff0d6c6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=48&ixlib=rb-4.1.0&q=80&w=48',
    points: 2480,
    rank: 3,
    department: 'Digital Innovation',
    isCurrentUser: true,
    badge: '🥉',
  },
  {
    id: 'u004',
    name: 'James Park',
    avatar: '',
    points: 2150,
    rank: 4,
    department: 'Supply Chain',
  },
  {
    id: 'u005',
    name: 'Aisha Williams',
    avatar: '',
    points: 1980,
    rank: 5,
    department: 'Customer Experience',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a001',
    name: 'First Steps',
    description: 'Completed your first course',
    icon: '🚀',
    unlocked: true,
    unlockedAt: 'Jan 15, 2026',
    color: '#3D8FD4',
  },
  {
    id: 'a002',
    name: 'AI Explorer',
    description: 'Completed 2 AI courses',
    icon: '🔭',
    unlocked: true,
    unlockedAt: 'Feb 3, 2026',
    color: '#6B8E3E',
  },
  {
    id: 'a003',
    name: 'Speed Learner',
    description: 'Completed a course in one session',
    icon: '⚡',
    unlocked: true,
    unlockedAt: 'Jan 15, 2026',
    color: '#D4A017',
  },
  {
    id: 'a004',
    name: 'Perfect Score',
    description: 'Score 100% on a quiz',
    icon: '🏆',
    unlocked: false,
    color: '#C8714A',
  },
  {
    id: 'a005',
    name: 'Streak Master',
    description: 'Maintain a 14-day learning streak',
    icon: '🔥',
    unlocked: false,
    color: '#C8714A',
  },
  {
    id: 'a006',
    name: 'Team Player',
    description: 'Share 5 resources with colleagues',
    icon: '🤝',
    unlocked: false,
    color: '#6B8E3E',
  },
  {
    id: 'a007',
    name: 'Knowledge Seeker',
    description: 'Complete 5 courses',
    icon: '📚',
    unlocked: false,
    color: '#3D8FD4',
  },
  {
    id: 'a008',
    name: 'AI Champion',
    description: 'Reach the top of the leaderboard',
    icon: '👑',
    unlocked: false,
    color: '#D4A017',
  },
];

export const WEEKLY_PROGRESS: WeeklyProgress[] = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.0 },
  { day: 'Wed', hours: 0.5 },
  { day: 'Thu', hours: 3.0 },
  { day: 'Fri', hours: 2.5 },
  { day: 'Sat', hours: 1.0 },
  { day: 'Sun', hours: 0 },
];

export const COURSE_HISTORY = [
  { courseId: 'c006', completedAt: 'Jan 15, 2026', score: 94, timeSpent: '2h 28m' },
  { courseId: 'c010', completedAt: 'Feb 3, 2026', score: 88, timeSpent: '3h 55m' },
];
