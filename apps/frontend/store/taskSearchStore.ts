import { create } from 'zustand';

export type TaskSearchParams = {
  statusGroup: 'todo' | 'doing' | 'done' | 'todo_doing' | 'doing_done' | 'todo_done' | 'all';
  indexType: 'start' | 'end';
  sort: 'asc' | 'dasc';
  fromDate?: string | undefined;
  toDate?: string | undefined;
};

const defaultParams: TaskSearchParams = {
  statusGroup: 'todo_doing',
  indexType: 'start',
  sort: 'asc',
  fromDate: undefined,
  toDate: undefined,
};

export const useTaskSearchStore = create<{
  params: TaskSearchParams;
  setParams: (p: Partial<TaskSearchParams>) => void;
  reset: () => void;
}>((set) => ({
  params: defaultParams,
  setParams: (p) => set((state) => ({ params: { ...state.params, ...p } })),
  reset: () => set({ params: defaultParams }),
}));
