import { useState } from 'react';
import { useStore } from '../store';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

type ReportType = 'projects' | 'grants' | 'priority2030' | 'scholarships' | 'documents' | 'summary';

export function ReportsModule() {
  const tasks = useStore(s => s.tasks);
  const projects = useStore(s => s.projects);
  const grants = useStore(s => s.grants);
  const indicators = useStore(s => s.indicators);
  const campaigns = useStore(s => s.campaigns);
  const documents = useStore(s => s.documents);
  const meetings = useStore(s => s.meetings);
  const decisions = useStore(s => s.decisions);
  const risks = useStore(s => s.risks);
  const logs = useStore(s => s.logs);
  const [selectedReport, setSelectedReport] = useState<ReportType>('summary');
  const [period, setPeriod] = useState({ from: '', to: '' });

  const reportTypes: { id: ReportType; label: string; desc: string }[] = [
    { id: 'summary', label: 'Сводный отчёт', desc: 'Общий отчёт по управлению' },
    { id: 'projects', label: 'Проектная работа', desc: 'Отчёт по проектам и портфелям' },
    { id: 'grants', label: 'Гранты', desc: 'Отчёт по грантовой деятельности' },
    { id: 'priority2030', label: 'Приоритет-2030', desc: 'Показатели программы' },
    { id: 'scholarships', label: 'Стипендии', desc: 'Именные стипендии' },
    { id: 'documents', label: 'Документооборот', desc: 'Статистика документов' },
  ];

  const generateXLSX = () => {
    const wb = XLSX.utils.book_new();
    
    if (selectedReport === 'summary' || selectedReport === 'projects') {
      const projData = projects.map(p => ({
        'Код': p.code, 'Название': p.name, 'Статус': p.status, 'Руководитель': p.manager,
        'Начало': p.startDate, 'Окончание': p.endDate, 'Прогресс %': p.progress,
      }));
      if (projData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projData), 'Проекты');
      
      const taskData = tasks.map(t => ({
        'Задача': t.title, 'Статус': t.status, 'Исполнитель': t.assignee,
        'Приоритет': t.priority, 'Срок': t.dueDate || '', 'Проект': t.projectId || '',
      }));
      if (taskData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskData), 'Задачи');
    }

    if (selectedReport === 'summary' || selectedReport === 'grants') {
      const grantData = grants.map(g => ({
        'Название': g.name, 'Статус': g.status, 'Сумма': g.amount, 'Освоено': g.spent,
        'Остаток': g.amount - g.spent, 'Руководитель': g.manager, 'Начало': g.startDate, 'Окончание': g.endDate,
      }));
      if (grantData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(grantData), 'Гранты');
    }

    if (selectedReport === 'summary' || selectedReport === 'priority2030') {
      const indData = indicators.map(i => ({
        'Показатель': i.name, 'Ед.': i.unit, 'План': i.planValue, 'Факт': i.factValue,
        'Выполнение %': i.planValue > 0 ? Math.round((i.factValue / i.planValue) * 100) : 0,
        'Ответственный': i.responsible, 'Год': i.year,
      }));
      if (indData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(indData), 'Показатели');
    }

    if (selectedReport === 'summary' || selectedReport === 'scholarships') {
      const campData = campaigns.flatMap(c => c.applications.map(a => ({
        'Кампания': c.name, 'Заявитель': a.applicantName, 'Статус': a.status,
        'Рейтинг': a.rating, 'Сумма': a.amount || 0,
      })));
      if (campData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(campData), 'Стипендии');
    }

    if (selectedReport === 'summary' || selectedReport === 'documents') {
      const docData = documents.map(d => ({
        'Название': d.name, 'Тип': d.type, 'Статус': d.status, 'Инициатор': d.initiator,
        'Дата': new Date(d.createdAt).toLocaleDateString('ru'),
      }));
      if (docData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docData), 'Документы');
    }

    if (selectedReport === 'summary') {
      const decData = decisions.map(d => ({
        'Решение': d.text, 'Ответственный': d.assignee, 'Срок': d.dueDate, 'Статус': d.status,
      }));
      if (decData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(decData), 'Решения');
    }

    XLSX.writeFile(wb, `caesar_report_${selectedReport}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(16);
    doc.text('АИС "Цезарь" — Отчёт', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.text(`Дата формирования: ${new Date().toLocaleString('ru')}`, 105, y, { align: 'center' });
    y += 15;

    if (selectedReport === 'summary' || selectedReport === 'projects') {
      doc.setFontSize(14);
      doc.text('Проекты', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Всего проектов: ${projects.length}`, 20, y); y += 6;
      doc.text(`Активных: ${projects.filter(p => p.status === 'active').length}`, 20, y); y += 6;
      doc.text(`Завершённых: ${projects.filter(p => p.status === 'completed').length}`, 20, y); y += 6;
      doc.text(`Всего задач: ${tasks.length}`, 20, y); y += 6;
      const today = new Date().toISOString().split('T')[0];
      doc.text(`Просроченных задач: ${tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length}`, 20, y); y += 6;
      doc.text(`Задач на блоке: ${tasks.filter(t => t.status === 'blocked').length}`, 20, y); y += 10;
    }

    if (selectedReport === 'summary' || selectedReport === 'grants') {
      doc.setFontSize(14);
      doc.text('Гранты', 20, y); y += 8;
      doc.setFontSize(10);
      const totalAmount = grants.reduce((s, g) => s + g.amount, 0);
      const totalSpent = grants.reduce((s, g) => s + g.spent, 0);
      doc.text(`Всего грантов: ${grants.length}`, 20, y); y += 6;
      doc.text(`Общая сумма: ${totalAmount.toLocaleString('ru')} руб.`, 20, y); y += 6;
      doc.text(`Освоено: ${totalSpent.toLocaleString('ru')} руб.`, 20, y); y += 6;
      doc.text(`Остаток: ${(totalAmount - totalSpent).toLocaleString('ru')} руб.`, 20, y); y += 10;
    }

    if (selectedReport === 'summary' || selectedReport === 'priority2030') {
      doc.setFontSize(14);
      doc.text('Приоритет-2030', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Показателей: ${indicators.length}`, 20, y); y += 6;
      const avgPct = indicators.length > 0 ? Math.round(indicators.reduce((s, i) => s + (i.planValue > 0 ? (i.factValue / i.planValue) * 100 : 0), 0) / indicators.length) : 0;
      doc.text(`Среднее выполнение: ${avgPct}%`, 20, y); y += 6;
      doc.text(`С отставанием: ${indicators.filter(i => i.planValue > 0 && (i.factValue / i.planValue) < 0.8).length}`, 20, y); y += 10;
    }

    if (selectedReport === 'summary') {
      doc.setFontSize(14);
      doc.text('Совещания и решения', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Всего совещаний: ${meetings.length}`, 20, y); y += 6;
      doc.text(`Принято решений: ${decisions.length}`, 20, y); y += 6;
      doc.text(`Исполнено: ${decisions.filter(d => d.status === 'done').length}`, 20, y); y += 6;
      doc.text(`Просрочено: ${decisions.filter(d => d.status === 'overdue').length}`, 20, y); y += 10;
      
      doc.setFontSize(14);
      doc.text('Риски', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Открытых рисков: ${risks.filter(r => r.status === 'open').length}`, 20, y); y += 6;
      doc.text(`Критических: ${risks.filter(r => r.impact === 'critical' && r.status === 'open').length}`, 20, y); y += 10;
    }

    doc.save(`caesar_report_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const renderReportPreview = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (selectedReport) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{projects.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Проектов</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{tasks.filter(t => t.status === 'done').length}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Задач выполнено</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{grants.length}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Грантов</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{meetings.length}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Совещаний</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ключевые показатели</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Просроченных задач</span><span className="text-red-600 font-medium">{tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Задач на блоке</span><span className="text-orange-600 font-medium">{tasks.filter(t => t.status === 'blocked').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Критических рисков</span><span className="text-red-600 font-medium">{risks.filter(r => r.impact === 'critical' && r.status === 'open').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Решений просрочено</span><span className="text-red-600 font-medium">{decisions.filter(d => d.status === 'overdue').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Освоение грантов</span><span className="text-green-600 font-medium">{grants.reduce((s,g) => s+g.amount, 0) > 0 ? Math.round((grants.reduce((s,g) => s+g.spent, 0) / grants.reduce((s,g) => s+g.amount, 0)) * 100) : 0}%</span></div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
                <p className="text-xs text-gray-400">Всего</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-gray-400">Активных</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{projects.length > 0 ? Math.round(projects.reduce((s,p) => s+p.progress, 0)/projects.length) : 0}%</p>
                <p className="text-xs text-gray-400">Ср. прогресс</p>
              </div>
            </div>
            {projects.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
                  <span className="text-sm text-gray-500">{p.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'grants':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{grants.reduce((s,g)=>s+g.amount,0).toLocaleString('ru')} ₽</p>
                <p className="text-xs text-gray-400">Общая сумма</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-green-600">{grants.reduce((s,g)=>s+g.spent,0).toLocaleString('ru')} ₽</p>
                <p className="text-xs text-gray-400">Освоено</p>
              </div>
            </div>
            {grants.map(g => (
              <div key={g.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{g.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${g.status === 'executing' ? 'bg-blue-500' : 'bg-gray-400'}`}>{g.status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{g.spent.toLocaleString('ru')} / {g.amount.toLocaleString('ru')} ₽</p>
              </div>
            ))}
          </div>
        );
      default:
        return <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center text-gray-400">Выберите тип отчёта для просмотра</div>;
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Генератор отчётов</h2>
        <div className="flex gap-2">
          <button onClick={generateXLSX} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 shadow-lg shadow-green-500/25">
            <FileSpreadsheet size={16} /> XLSX
          </button>
          <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 shadow-lg shadow-red-500/25">
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {reportTypes.map(r => (
          <button key={r.id} onClick={() => setSelectedReport(r.id)}
            className={`p-3 rounded-xl text-left transition ${selectedReport === r.id ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}>
            <p className={`text-sm font-medium ${selectedReport === r.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>{r.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
        <span className="text-sm text-gray-500">Период:</span>
        <input type="date" value={period.from} onChange={e => setPeriod(p => ({ ...p, from: e.target.value }))}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
        <span className="text-gray-400">—</span>
        <input type="date" value={period.to} onChange={e => setPeriod(p => ({ ...p, to: e.target.value }))}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-500" />
          Предпросмотр: {reportTypes.find(r => r.id === selectedReport)?.label}
        </h3>
        {renderReportPreview()}
      </div>
    </div>
  );
}
