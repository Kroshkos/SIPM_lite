import { useState } from 'react';
import { useStore } from '../store';
import { Project, ProjectStatus, Risk, Milestone } from '../types';
import { Plus, X, AlertTriangle, CheckCircle2, Clock, Flag } from 'lucide-react';

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: 'Планирование', color: 'bg-gray-400' },
  active: { label: 'Активный', color: 'bg-blue-500' },
  paused: { label: 'Приостановлен', color: 'bg-yellow-500' },
  completed: { label: 'Завершён', color: 'bg-green-500' },
  cancelled: { label: 'Отменён', color: 'bg-red-500' },
};

function getProjectHealth(project: Project, tasks: any[], risks: Risk[]) {
  const today = new Date().toISOString().split('T')[0];
  const pTasks = tasks.filter(t => t.projectId === project.id);
  const hasOverdue = pTasks.some(t => t.dueDate && t.dueDate < today && t.status !== 'done');
  const hasCriticalRisk = risks.some(r => r.projectId === project.id && r.impact === 'critical' && r.status === 'open');
  const hasNearDeadline = pTasks.some(t => t.dueDate && t.dueDate >= today && t.dueDate <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] && t.status !== 'done');
  const hasHighRisk = risks.some(r => r.projectId === project.id && (r.impact === 'high' || r.probability === 'high') && r.status === 'open');
  
  if (hasOverdue || hasCriticalRisk) return '🔴';
  if (hasNearDeadline || hasHighRisk) return '🟡';
  return '🟢';
}

function ProjectForm({ project, onClose }: { project?: Project; onClose: () => void }) {
  const addProject = useStore(s => s.addProject);
  const updateProject = useStore(s => s.updateProject);
  const directories = useStore(s => s.directories);
  const currentUser = useStore(s => s.currentUser);

  const [form, setForm] = useState({
    name: project?.name || '',
    code: project?.code || '',
    direction: project?.direction || '',
    status: project?.status || 'planning' as ProjectStatus,
    manager: project?.manager || currentUser || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    progress: project?.progress || 0,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (project) {
      updateProject(project.id, form);
    } else {
      addProject({ ...form, createdBy: currentUser || '' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{project ? 'Редактировать проект' : 'Новый проект'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Код</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Направление</label>
            <select value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
              <option value="">—</option>
              {directories.filter(d => d.type === 'direction').map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Руководитель</label>
              <input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата начала</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата окончания</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Прогресс: {form.progress}%</label>
            <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))}
              className="w-full" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Отмена</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsModule() {
  const projects = useStore(s => s.projects);
  const tasks = useStore(s => s.tasks);
  const risks = useStore(s => s.risks);
  const milestones = useStore(s => s.milestones);
  const deleteProject = useStore(s => s.deleteProject);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Проекты ({projects.length})</h2>
        <button onClick={() => { setEditProject(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
          <Plus size={16} /> Новый проект
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-400">Нет проектов. Создайте первый проект для начала работы.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => {
            const health = getProjectHealth(p, tasks, risks);
            const pTasks = tasks.filter(t => t.projectId === p.id);
            const pRisks = risks.filter(r => r.projectId === p.id);
            const pMilestones = milestones.filter(m => m.projectId === p.id);
            
            return (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer" onClick={() => setSelectedProject(p)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{health}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</h3>
                    </div>
                    {p.code && <p className="text-xs text-gray-400 mt-0.5">{p.code}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusConfig[p.status].color}`}>
                    {statusConfig[p.status].label}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Прогресс</span>
                    <span className="font-medium">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${p.progress >= 80 ? 'bg-green-500' : p.progress >= 40 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.endDate || '—'}</span>
                    <span className="flex items-center gap-1"><Flag size={12} /> {pTasks.length} задач</span>
                    {pRisks.length > 0 && <span className="flex items-center gap-1 text-orange-500"><AlertTriangle size={12} /> {pRisks.length}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project detail modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProjectHealth(selectedProject, tasks, risks)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedProject.name}</h3>
                  <p className="text-xs text-gray-400">{selectedProject.code} • {selectedProject.manager}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditProject(selectedProject); setShowForm(true); setSelectedProject(null); }} className="text-sm text-blue-500 hover:text-blue-600 px-2 py-1">Изменить</button>
                <button onClick={() => setSelectedProject(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.projectId === selectedProject.id).length}</p>
                  <p className="text-xs text-gray-400">Задач</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{risks.filter(r => r.projectId === selectedProject.id).length}</p>
                  <p className="text-xs text-gray-400">Рисков</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{milestones.filter(m => m.projectId === selectedProject.id && m.completed).length}</p>
                  <p className="text-xs text-gray-400">Вех выполнено</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProject.progress}%</p>
                  <p className="text-xs text-gray-400">Прогресс</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Задачи проекта</h4>
                {tasks.filter(t => t.projectId === selectedProject.id).length === 0 ? (
                  <p className="text-sm text-gray-400">Нет задач</p>
                ) : (
                  <div className="space-y-1">
                    {tasks.filter(t => t.projectId === selectedProject.id).map(t => (
                      <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className={`w-2 h-2 rounded-full ${t.status === 'done' ? 'bg-green-500' : t.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{t.title}</span>
                        <span className="text-xs text-gray-400">{t.assignee}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Риски</h4>
                {risks.filter(r => r.projectId === selectedProject.id).length === 0 ? (
                  <p className="text-sm text-gray-400">Нет рисков</p>
                ) : (
                  <div className="space-y-1">
                    {risks.filter(r => r.projectId === selectedProject.id).map(r => (
                      <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className={`text-sm ${r.impact === 'critical' ? '🔴' : r.impact === 'high' ? '🟠' : r.impact === 'medium' ? '🟡' : '🟢'}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{r.description}</span>
                        <span className="text-xs text-gray-400">{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && <ProjectForm project={editProject} onClose={() => { setShowForm(false); setEditProject(undefined); }} />}
    </div>
  );
}
