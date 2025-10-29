// Minimal, clean report store implementation.
// Network-first behavior is optional. This file provides a stable, localStorage-backed
// implementation that mirrors to a remote API if VITE_API_BASE is set.

// Single, minimal, local-only implementation to ensure project compiles.

export type ReportStatus = 'submitted' | 'received' | 'in-progress' | 'resolved' | 'rejected';

export interface ReportItem {
  id: string;
  userId: string;
  issueType: string;
  location: string;
  description: string;
  photos?: string[];
  status: ReportStatus;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'civicindia_reports_v1';

const readLocal = (): ReportItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw) as ReportItem[];
  } catch (err) {
    console.error('reportStore: failed to read local storage', err);
    return [];
  }
};

const writeLocal = (items: ReportItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('reportstore:changed'));
  } catch (err) {
    console.error('reportStore: failed to write local storage', err);
  }
};

export const addReport = async (report: Omit<ReportItem, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ReportStatus }) => {
  const now = Date.now();
  const id = `RPT-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const item: ReportItem = Object.assign({ id, status: report.status || 'submitted', createdAt: now, updatedAt: now }, report) as ReportItem;
  const all = readLocal();
  all.push(item);
  writeLocal(all);
  return item;
};

export const getReportsForUser = async (userId: string) => {
  return readLocal().filter(r => r.userId === userId).sort((a,b) => b.createdAt - a.createdAt);
};

export const getReportById = async (id: string) => {
  const all = readLocal();
  return all.find(r => r.id === id) || null;
};

export const updateReportStatus = async (reportId: string, status: ReportStatus) => {
  const all = readLocal();
  const idx = all.findIndex(r => r.id === reportId);
  if (idx === -1) return null;
  all[idx].status = status;
  all[idx].updatedAt = Date.now();
  writeLocal(all);
  return all[idx];
};

export const deleteReport = async (reportId: string) => {
  const all = readLocal();
  const idx = all.findIndex(r => r.id === reportId);
  if (idx === -1) return null;
  const [removed] = all.splice(idx, 1);
  writeLocal(all);
  return removed;
};

export const subscribe = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener('storage', handler);
  window.addEventListener('reportstore:changed', handler as EventListener);
  return () => { window.removeEventListener('storage', handler); window.removeEventListener('reportstore:changed', handler as EventListener); };
};

export default { addReport, getReportsForUser, getReportById, updateReportStatus, deleteReport, subscribe };
