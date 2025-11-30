'use client';

import clsx from 'clsx';

type TagProps = {
  tagName: string;
  tagColor: {
    color: string;
    backgroundColor: string;
  };
};

/**
 * タグ
 */
export const Tag = ({ tagName, tagColor }: TagProps) => {
  return (
    <span style={tagColor} className="rounded-full border border-gray-600 px-4 py-1 text-sm">
      {tagName}
    </span>
  );
};

/**
 * タスクステータスタグ
 */
export const TagStatus = ({ type }: { type: 'todo' | 'doing' | 'done' }) => {
  const statusInfo = {
    todo: {
      text: '未着手',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" width="32" height="32" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
          />
        </svg>
      ),
    },
    doing: {
      text: '進行中',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" width="32" height="32" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="m12.05 19l2.85-2.825l-2.85-2.825L11 14.4l1.075 1.075q-.7.025-1.362-.225t-1.188-.775q-.5-.5-.763-1.15t-.262-1.3q0-.425.113-.85t.312-.825l-1.1-1.1q-.425.625-.625 1.325T7 12q0 .95.375 1.875t1.1 1.65t1.625 1.088t1.85.387l-.95.95zm4.125-4.25q.425-.625.625-1.325T17 12q0-.95-.363-1.888T15.55 8.45t-1.638-1.075t-1.862-.35L13 6.05L11.95 5L9.1 7.825l2.85 2.825L13 9.6l-1.1-1.1q.675 0 1.375.263t1.2.762t.763 1.15t.262 1.3q0 .425-.112.85t-.313.825zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
          />
        </svg>
      ),
    },
    done: {
      text: '完了',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" width="32" height="32" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
          />
        </svg>
      ),
    },
  }[type];

  return (
    <span
      className={clsx(
        'flex items-center gap-2 rounded-full py-1 pr-4 pl-2 text-xs font-bold',
        type === 'todo' && 'bg-green-200 text-green-900 ring-2 ring-green-900',
        type === 'doing' && 'bg-yellow-100 text-yellow-900 ring-2 ring-yellow-900',
        type === 'done' && 'bg-purple-100 text-purple-900 ring-2 ring-purple-900'
      )}
    >
      {statusInfo.icon}
      {statusInfo.text}
    </span>
  );
};
