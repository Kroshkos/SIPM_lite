import { create } from 'zustand';
import { AppState, initialData, Task, Project, Document, Grant, Meeting, Decision, Notification, LogEntry, Indicator, Campaign, Risk, Milestone } from './types';
import { v4 as uuid } from 'uuid';

interface StoreState extends AppState {
  currentUser: string | null;
  cloudToken: string | null;
  syncStatus: 'connected' | 'syncing' | 'error' | 'disconnected';
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModule: string;
  searchQuery: string;
  
  // Auth
  login: (name: string, token?: string) => void;
  logout: () => void;
  
  // UI
  setTheme: (t: 'light' | 'dark') => void;
  setSidebarOpen: (v: boolean) => void;
  setActiveModule: (m: string) => void;
  setSearchQuery: (q: string) => void;
  
  // CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  addGrant: (grant: Omit<Grant, 'id' | 'createdAt'>) => void;
  updateGrant: (id: string, updates: Partial<Grant>) => void;
  deleteGrant: (id: string) => void;
  
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  
  addDecision: (decision: Omit<Decision, 'id'>) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  convertDecisionsToTasks: (meetingId: string) => void;
  
  addIndicator: (ind: Omit<Indicator, 'id'>) => void;
  updateIndicator: (id: string, updates: Partial<Indicator>) => void;
  deleteIndicator: (id: string) => void;
  
  addCampaign: (c: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  addRisk: (r: Omit<Risk, 'id'>) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  
  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  
  addLog: (action: string, object: string, details: string) => void;
  
  // Cloud sync
  setSyncStatus: (s: 'connected' | 'syncing' | 'error' | 'disconnected') => void;
  exportData: () => string;
  importData: (json: string) => void;
}

const loadData = (): Partial<AppState> => {
  try {
    const saved = localStorage.getItem('caesar_data');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
};

const savedData = loadData();

export const useStore = create<StoreState>((set, get) => ({
  ...initialData,
  ...savedData,
  currentUser: localStorage.getItem('caesar_user'),
  cloudToken: localStorage.getItem('caesar_token'),
  syncStatus: 'disconnected',
  theme: (localStorage.getItem('caesar_theme') as 'light' | 'dark') || 'light',
  sidebarOpen: true,
  activeModule: 'dashboard',
  searchQuery: '',

  login: (name, token) => {
    localStorage.setItem('caesar_user', name);
    if (token) localStorage.setItem('caesar_token', token);
    set({ currentUser: name, cloudToken: token || null, syncStatus: token ? 'connected' : 'disconnected' });
    get().addLog('Вход в систему', 'Система', `Пользователь ${name} вошёл в систему`);
  },

  logout: () => {
    localStorage.removeItem('caesar_user');
    set({ currentUser: null });
  },

  setTheme: (t) => {
    localStorage.setItem('caesar_theme', t);
    set({ theme: t });
  },
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setActiveModule: (m) => set({ activeModule: m }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addTask: (task) => {
    const id = uuid();
    const newTask: Task = { ...task, id, createdAt: new Date().toISOString() };
    set((s) => ({ tasks: [...s.tasks, newTask] }));
    get().addLog('Создана задача', `Задача: ${task.title}`, `Исполнитель: ${task.assignee}`);
  },
  updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),

  addProject: (project) => {
    const id = uuid();
    const newProject: Project = { ...project, id, createdAt: new Date().toISOString() };
    set((s) => ({ projects: [...s.projects, newProject] }));
    get().addLog('Создан проект', `Проект: ${project.name}`, `Руководитель: ${project.manager}`);
  },
  updateProject: (id, updates) => set((s) => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p) })),
  deleteProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),

  addDocument: (doc) => {
    const id = uuid();
    const newDoc: Document = { ...doc, id, createdAt: new Date().toISOString() };
    set((s) => ({ documents: [...s.documents, newDoc] }));
    get().addLog('Создан документ', `Документ: ${doc.name}`, `Тип: ${doc.type}`);
  },
  updateDocument: (id, updates) => set((s) => ({ documents: s.documents.map(d => d.id === id ? { ...d, ...updates } : d) })),
  deleteDocument: (id) => set((s) => ({ documents: s.documents.filter(d => d.id !== id) })),

  addGrant: (grant) => {
    const id = uuid();
    const newGrant: Grant = { ...grant, id, createdAt: new Date().toISOString() };
    set((s) => ({ grants: [...s.grants, newGrant] }));
    get().addLog('Создан грант', `Грант: ${grant.name}`, `Сумма: ${grant.amount}`);
  },
  updateGrant: (id, updates) => set((s) => ({ grants: s.grants.map(g => g.id === id ? { ...g, ...updates } : g) })),
  deleteGrant: (id) => set((s) => ({ grants: s.grants.filter(g => g.id !== id) })),

  addMeeting: (meeting) => {
    const id = uuid();
    const newMeeting: Meeting = { ...meeting, id, createdAt: new Date().toISOString() };
    set((s) => ({ meetings: [...s.meetings, newMeeting] }));
    get().addLog('Создано совещание', `Совещание: ${meeting.title}`, `Дата: ${meeting.date}`);
  },
  updateMeeting: (id, updates) => set((s) => ({ meetings: s.meetings.map(m => m.id === id ? { ...m, ...updates } : m) })),
  deleteMeeting: (id) => set((s) => ({ meetings: s.meetings.filter(m => m.id !== id) })),

  addDecision: (decision) => {
    const id = uuid();
    const newDecision: Decision = { ...decision, id };
    set((s) => ({ decisions: [...s.decisions, newDecision] }));
  },
  updateDecision: (id, updates) => set((s) => ({ decisions: s.decisions.map(d => d.id === id ? { ...d, ...updates } : d) })),
  convertDecisionsToTasks: (meetingId) => {
    const state = get();
    const decisions = state.decisions.filter(d => d.meetingId === meetingId && !d.taskId);
    const newTasks: Task[] = [];
    const updatedDecisions = [...state.decisions];
    decisions.forEach(d => {
      const taskId = uuid();
      const task: Task = {
        id: taskId,
        title: d.text,
        description: `Поручение совещания от ${new Date().toLocaleDateString('ru')}`,
        status: 'in_progress',
        assignee: d.assignee,
        dueDate: d.dueDate,
        projectId: d.objectType === 'project' ? d.objectId : undefined,
        grantId: d.objectType === 'grant' ? d.objectId : undefined,
        meetingId,
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser || 'system',
        priority: 'high',
      };
      newTasks.push(task);
      const idx = updatedDecisions.findIndex(dec => dec.id === d.id);
      if (idx >= 0) updatedDecisions[idx] = { ...d, taskId };
    });
    set((s) => ({ tasks: [...s.tasks, ...newTasks], decisions: updatedDecisions }));
    get().addLog('Решения превращены в задачи', `Совещание`, `Создано ${newTasks.length} задач`);
  },

  addIndicator: (ind) => {
    const id = uuid();
    set((s) => ({ indicators: [...s.indicators, { ...ind, id }] }));
  },
  updateIndicator: (id, updates) => set((s) => ({ indicators: s.indicators.map(i => i.id === id ? { ...i, ...updates } : i) })),
  deleteIndicator: (id) => set((s) => ({ indicators: s.indicators.filter(i => i.id !== id) })),

  addCampaign: (c) => {
    const id = uuid();
    set((s) => ({ campaigns: [...s.campaigns, { ...c, id }] }));
  },
  updateCampaign: (id, updates) => set((s) => ({ campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...updates } : c) })),
  deleteCampaign: (id) => set((s) => ({ campaigns: s.campaigns.filter(c => c.id !== id) })),

  addRisk: (r) => {
    const id = uuid();
    set((s) => ({ risks: [...s.risks, { ...r, id }] }));
  },
  updateRisk: (id, updates) => set((s) => ({ risks: s.risks.map(r => r.id === id ? { ...r, ...updates } : r) })),
  deleteRisk: (id) => set((s) => ({ risks: s.risks.filter(r => r.id !== id) })),

  addMilestone: (m) => {
    const id = uuid();
    set((s) => ({ milestones: [...s.milestones, { ...m, id }] }));
  },
  updateMilestone: (id, updates) => set((s) => ({ milestones: s.milestones.map(m => m.id === id ? { ...m, ...updates } : m) })),
  deleteMilestone: (id) => set((s) => ({ milestones: s.milestones.filter(m => m.id !== id) })),

  addNotification: (n) => {
    const id = uuid();
    set((s) => ({ notifications: [...s.notifications, { ...n, id, read: false, createdAt: new Date().toISOString() }] }));
  },
  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),

  addLog: (action, object, details) => {
    const state = get();
    const entry: LogEntry = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      user: state.currentUser || 'system',
      action, object, details,
    };
    set((s) => ({ logs: [entry, ...s.logs].slice(0, 500) }));
  },

  setSyncStatus: (s) => set({ syncStatus: s }),
  exportData: () => {
    const state = get();
    const data: AppState = {
      users: state.users, directories: state.directories, projects: state.projects,
      portfolios: state.portfolios, tasks: state.tasks, documents: state.documents,
      risks: state.risks, milestones: state.milestones, grants: state.grants,
      indicators: state.indicators, campaigns: state.campaigns, meetings: state.meetings,
      decisions: state.decisions, logs: state.logs, notifications: state.notifications,
      reportsArchive: state.reportsArchive,
    };
    return JSON.stringify(data, null, 2);
  },
  importData: (json) => {
    try {
      const data = JSON.parse(json);
      set(data);
      localStorage.setItem('caesar_data', json);
    } catch (e) { console.error('Import error:', e); }
  },
}));

// Auto-save to localStorage
let saveTimeout: ReturnType<typeof setTimeout>;
useStore.subscribe((state) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const data: AppState = {
      users: state.users, directories: state.directories, projects: state.projects,
      portfolios: state.portfolios, tasks: state.tasks, documents: state.documents,
      risks: state.risks, milestones: state.milestones, grants: state.grants,
      indicators: state.indicators, campaigns: state.campaigns, meetings: state.meetings,
      decisions: state.decisions, logs: state.logs, notifications: state.notifications,
      reportsArchive: state.reportsArchive,
    };
    localStorage.setItem('caesar_data', JSON.stringify(data));
  }, 800);
});
