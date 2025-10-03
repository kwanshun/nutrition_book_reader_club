import Image from 'next/image';

interface DashboardHeaderProps {
  period?: number;
  organizationName?: string;
  programName?: string;
}

export default function DashboardHeader({
  period = 21,
  organizationName = '澳門營養交流協會',
  programName = '營養人生讀書會',
}: DashboardHeaderProps) {
  return (
    <header className="bg-black text-white p-6">
      <div className="max-w-md mx-auto flex items-center gap-4">
        {/* Book Cover */}
        <div className="flex-shrink-0 w-24 h-32 bg-white rounded shadow-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            書籍封面
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">第{period}期</h1>
          <p className="text-sm leading-relaxed">
            {organizationName}
            <br />
            {programName}
          </p>
        </div>
      </div>
    </header>
  );
}

