'use client';

import { create } from 'zustand';

type AlertType = 'success' | 'error' | 'info';

interface Alert {
  id: string;
  message: string;
  type: AlertType;
}

type AlertState = {
  alerts: Alert[];
  addAlert: (message: string, type: AlertType, time?: number) => void;
  removeAlerts: (id: string) => void;
};

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (message, type = 'info', time: number = 60000) => {
    const id = crypto.randomUUID();
    set((state) => ({ alerts: [...state.alerts, { id, message, type }] }));

    // 1分後に自動で削除
    setTimeout(() => {
      set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
    }, time);
  },
  removeAlerts: (id) => {
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },
}));
