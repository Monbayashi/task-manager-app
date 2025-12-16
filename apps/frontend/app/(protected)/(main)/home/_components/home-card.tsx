'use client';

export const HomeCard = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => {
  return (
    <div className="rounded-base w-full max-w-xs rounded-xl border border-gray-500 p-4 shadow-lg">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-gray-00 me-1 text-base font-semibold text-gray-700 sm:text-lg">{title}</h3>
      </div>
      {children}
      <div className="px-6 text-right text-sm text-gray-500">{description}</div>
    </div>
  );
};
