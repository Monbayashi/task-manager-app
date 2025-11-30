'use client';

import { useAlertStore } from '@/store/alert';
import { CheckBadgeIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/** トーストアラート */
export function ToastAlerts() {
  const { alerts, removeAlerts } = useAlertStore();

  return (
    <div className="z-toast pointer-events-none fixed top-4 right-0 left-0 flex flex-col items-center gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={clsx(
            'pointer-events-auto flex w-full max-w-xl items-center justify-between rounded py-3 pr-4 pl-2 text-gray-700 shadow-lg transition-all',
            alert.type === 'success' && 'bg-green-100',
            alert.type === 'error' && 'bg-red-100',
            alert.type === 'info' && 'bg-blue-100'
          )}
        >
          {alert.type === 'success' && <CheckBadgeIcon className="size-10 pr-2" />}
          {alert.type === 'error' && <ExclamationTriangleIcon className="size-10 pr-2" />}
          {alert.type === 'info' && <InformationCircleIcon className="size-10 pr-2" />}
          <span className="whitespace-pre-wrap">{alert.message}</span>
          <button className="ml-4 text-gray-700 hover:opacity-80" onClick={() => removeAlerts(alert.id)}>
            <XMarkIcon className="size-6" />
          </button>
        </div>
      ))}
    </div>
  );
}
