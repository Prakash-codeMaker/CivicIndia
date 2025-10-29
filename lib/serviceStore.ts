// Simple localStorage-backed service applications store

export type ServiceType = 'housing'|'utilities'|'health'|'education'|'employment'|'financial-assistance';

export interface ServiceApplication {
  id: string;
  userId: string;
  service: ServiceType;
  data: Record<string, any>;
  attachments?: string[]; // data URLs
  status: 'submitted'|'received'|'in-review'|'approved'|'rejected';
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'civicindia_service_apps_v1';

const readLocal = (): ServiceApplication[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw) as ServiceApplication[];
  } catch (err) {
    console.error('serviceStore: failed to read local storage', err);
    return [];
  }
};

const writeLocal = (items: ServiceApplication[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('servicestore:changed'));
  } catch (err) {
    console.error('serviceStore: failed to write local storage', err);
  }
};

export const addApplication = async (app: Omit<ServiceApplication, 'id'|'createdAt'|'updatedAt'|'status'> & { status?: ServiceApplication['status'] }) => {
  const now = Date.now();
  const id = `APP-${now.toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const item: ServiceApplication = Object.assign({ id, status: app.status || 'submitted', createdAt: now, updatedAt: now }, app) as ServiceApplication;
  const all = readLocal();
  all.push(item);
  writeLocal(all);
  return item;
};

export const getApplicationsForUser = async (userId: string) => {
  return readLocal().filter(a => a.userId === userId).sort((a,b) => b.createdAt - a.createdAt);
};

export const getApplicationById = async (id: string) => {
  const all = readLocal();
  return all.find(a => a.id === id) || null;
};

export const updateApplicationStatus = async (id: string, status: ServiceApplication['status']) => {
  const all = readLocal();
  const idx = all.findIndex(a => a.id === id);
  if (idx === -1) return null;
  all[idx].status = status;
  all[idx].updatedAt = Date.now();
  writeLocal(all);
  return all[idx];
};

export const subscribe = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener('storage', handler);
  window.addEventListener('servicestore:changed', handler as EventListener);
  return () => { window.removeEventListener('storage', handler); window.removeEventListener('servicestore:changed', handler as EventListener); };
};

export default { addApplication, getApplicationsForUser, getApplicationById, updateApplicationStatus, subscribe };
