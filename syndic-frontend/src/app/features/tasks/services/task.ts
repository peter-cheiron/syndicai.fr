export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  referenceId?: string;          // e.g. "copro-001"
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;            // ISO date
  createdAt: string;           // ISO date
  createdBy?: string;          // resident id or "system" / "ai"

  // Optional links to your existing model (nice for AI + UI)
  relatedTopic?: string;     // one of history[].id, e.g. "t2024-05"
}