'use client';

export const HomeCard = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => {
  return (
    <div className="rounded-base w-full max-w-xs rounded-xl border border-gray-500 p-4 shadow-lg">
      <div className="flex w-full items-center justify-between">
        <h5 className="text-gray-00 me-1 text-lg font-semibold text-gray-700">{title}</h5>
      </div>
      {children}
      <div className="px-6 text-right text-sm text-gray-500">{description}</div>
    </div>
  );
};
