import { useStore } from '../store';
import { CheckSquare, FolderKanban, Award, Users, TrendingUp, AlertTriangle, Clock, FileText } from 'lucide-react';

export function Dashboard() {
  const tasks = useStore(s => s.tasks);
  const projects = useStore(s => s.projects);
  const grants = useStore(s => s.grants);
  const meetings = useStore(s => s.meetings);
  const indicators = useStore(s => s.indicators);
  const risks = useStore(s => s.risks);
  const documents = useStore(s => s.documents);
  const logs = useStore(s => s.logs);
  const decisions = useStore(s => s.decisions);

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done');
  const upcomingTasks = tasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] && t.status !== 'done');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  const criticalRisks = risks.filter(r => r.impact === 'critical' && r.status === 'open');
  const redProjects = projects.filter(p => {
    const pTasks = tasks.filter(t => t.projectId === p.id);
    const hasOverdue = pTasks.some(t => t.dueDate && t.dueDate < today && t.status !== 'done');
    const hasCriticalRisk = risks.some(r => r.projectId === p.id && r.impact === 'critical' && r.status === 'open');
    return hasOverdue || hasCriticalRisk;
  });

  const stats = [
    { label: 'Проекты', value: projects.length, icon: FolderKanban, color: 'bg-blue-500', sub: `${projects.filter(p => p.status === 'active').length} активных` },
    { label: 'Задачи', value: tasks.length, icon: CheckSquare, color: 'bg-green-500', sub: `${tasks.filter(t => t.status === 'done').length} выполнено` },
    { label: 'Гранты', value: grants.length, icon: Award, color: 'bg-purple-500', sub: `${grants.filter(g => g.status === 'executing').length} исполняется` },
    { label: 'Показатели', value: indicators.length, icon: TrendingUp, color: 'bg-orange-500', sub: `${indicators.filter(i => i.factValue >= i.planValue).length} в норме` },
  ];

  const alerts = [
    ...(overdueTasks.length > 0 ? [{ type: 'error' as const, text: `${overdueTasks.length} просроченных задач`, icon: AlertTriangle }] : []),
    ...(blockedTasks.length > 0 ? [{ type: 'warning' as const, text: `${blockedTasks.length} задач на блоке`, icon: AlertTriangle }] : []),
    ...(criticalRisks.length > 0 ? [{ type: 'error' as const, text: `${criticalRisks.length} критических рисков`, icon: AlertTriangle }] : []),
    ...(redProjects.length > 0 ? [{ type: 'error' as const, text: `${redProjects.length} проектов в красной зоне`, icon: AlertTriangle }] : []),
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`p-3 rounded-xl flex items-center gap-3 ${a.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'}`}>
              <a.icon size={18} />
              <span className="text-sm font-medium">{a.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            Ближайшие 7 дней
          </h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Нет предстоящих задач</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className={`w-2 h-2 rounded-full ${t.priority === 'critical' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.assignee} • {t.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText size={18} className="text-green-500" />
            Последние действия
          </h3>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Нет действий</p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 5).map(l => (
                <div key={l.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5">
                    {l.user[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{l.action}</p>
                    <p className="text-xs text-gray-400">{l.user} • {new Date(l.timestamp).toLocaleString('ru')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decisions status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users size={18} className="text-purple-500" />
            Решения совещаний
          </h3>
          {decisions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Нет решений</p>
          ) : (
            <div className="space-y-2">
              {decisions.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className={`w-2 h-2 rounded-full ${d.status === 'done' ? 'bg-green-500' : d.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{d.text}</p>
                    <p className="text-xs text-gray-400">{d.assignee} • до {d.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText size={18} className="text-orange-500" />
            Документы
          </h3>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Нет документов</p>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className={`text-lg ${d.status === 'approved' ? '🟢' : d.status === 'in_review' ? '🟡' : d.status === 'rejected' ? '🔴' : '⚪'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.type} • {d.initiator}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
