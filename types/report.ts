export interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  assignedTo?: string;
  images?: string[];
  comments?: Comment[];
  history?: HistoryEntry[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: Date;
  user: string;
  details?: string;
}