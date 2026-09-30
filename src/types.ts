export type Role = 'admin' | 'head' | 'pm' | 'officer' | 'grant' | 'scholar' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  roles: Role[];
  settings?: { theme: 'light' | 'dark'; telegramChatId?: string; quietHours?: { from: string; to: string } };
}

export interface DirectoryItem {
  id: string;
  name: string;
  type: 'direction' | 'expense' | 'docType' | 'status';
  color?: string;
}

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done' | 'blocked';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type GrantStatus = 'preparation' | 'submitted' | 'expertise' | 'awarded' | 'executing' | 'reporting' | 'completed' | 'rejected';
export type DocStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  projectId?: string;
  grantId?: string;
  indicatorId?: string;
  dueDate?: string;
  createdAt: string;
  createdBy: string;
  checklist?: { text: string; done: boolean }[];
  dependencies?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  meetingId?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  direction: string;
  status: ProjectStatus;
  manager: string;
  startDate: string;
  endDate: string;
  progress: number;
  portfolio?: string;
  createdAt: string;
  createdBy: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  projectIds: string[];
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface Risk {
  id: string;
  projectId: string;
  grantId?: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'open' | 'mitigated' | 'realized' | 'closed';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: DocStatus;
  projectId?: string;
  grantId?: string;
  indicatorId?: string;
  initiator: string;
  createdAt: string;
  fileUrl?: string;
  fileBase64?: string;
  route?: { step: number; approver: string; status: 'pending' | 'approved' | 'rejected'; date?: string }[];
}

export interface Grant {
  id: string;
  name: string;
  status: GrantStatus;
  amount: number;
  spent: number;
  startDate: string;
  endDate: string;
  manager: string;
  stages: GrantStage[];
  createdAt: string;
}

export interface GrantStage {
  id: string;
  name: string;
  dueDate: string;
  completed: boolean;
  reportDue?: string;
}

export interface Indicator {
  id: string;
  name: string;
  unit: string;
  planValue: number;
  factValue: number;
  year: number;
  responsible: string;
  docIds: string[];
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  applications: Application[];
}

export interface Application {
  id: string;
  campaignId: string;
  applicantName: string;
  status: 'submitted' | 'approved' | 'rejected';
  rating: number;
  amount?: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  participants: string[];
  agenda: string[];
  protocol?: string;
  decisions: Decision[];
  createdAt: string;
}

export interface Decision {
  id: string;
  meetingId: string;
  text: string;
  assignee: string;
  dueDate: string;
  objectId?: string;
  objectType?: 'project' | 'grant' | 'indicator' | 'campaign';
  status: 'pending' | 'in_progress' | 'done' | 'overdue';
  taskId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  object: string;
  details: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ReportArchive {
  id: string;
  name: string;
  type: string;
  period: string;
  createdBy: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  directories: DirectoryItem[];
  projects: Project[];
  portfolios: Portfolio[];
  tasks: Task[];
  documents: Document[];
  risks: Risk[];
  milestones: Milestone[];
  grants: Grant[];
  indicators: Indicator[];
  campaigns: Campaign[];
  meetings: Meeting[];
  decisions: Decision[];
  logs: LogEntry[];
  notifications: Notification[];
  reportsArchive: ReportArchive[];
}

export const initialData: AppState = {
  users: [],
  directories: [
    { id: 'dir-1', name: 'Научные исследования', type: 'direction' },
    { id: 'dir-2', name: 'Образование', type: 'direction' },
    { id: 'dir-3', name: 'Инновации', type: 'direction' },
    { id: 'dir-4', name: 'Международное сотрудничество', type: 'direction' },
    { id: 'exp-1', name: 'Оборудование', type: 'expense' },
    { id: 'exp-2', name: 'Командировки', type: 'expense' },
    { id: 'exp-3', name: 'Материалы', type: 'expense' },
    { id: 'exp-4', name: 'Услуги', type: 'expense' },
    { id: 'dt-1', name: 'Заявка на грант', type: 'docType' },
    { id: 'dt-2', name: 'Отчет по гранту', type: 'docType' },
    { id: 'dt-3', name: 'Представление к стипендии', type: 'docType' },
    { id: 'dt-4', name: 'Протокол совещания', type: 'docType' },
    { id: 'st-1', name: 'Новый', type: 'status', color: '#6b7280' },
    { id: 'st-2', name: 'В работе', type: 'status', color: '#3b82f6' },
    { id: 'st-3', name: 'На проверке', type: 'status', color: '#f59e0b' },
    { id: 'st-4', name: 'Готово', type: 'status', color: '#10b981' },
    { id: 'st-5', name: 'Просрочено', type: 'status', color: '#ef4444' },
  ],
  projects: [],
  portfolios: [],
  tasks: [],
  documents: [],
  risks: [],
  milestones: [],
  grants: [],
  indicators: [],
  campaigns: [],
  meetings: [],
  decisions: [],
  logs: [],
  notifications: [],
  reportsArchive: [],
};
