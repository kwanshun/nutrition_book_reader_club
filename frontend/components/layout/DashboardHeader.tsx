'use client';

interface DashboardHeaderProps {
  period?: number;
  organizationName?: string;
  programName?: string;
}

export default function DashboardHeader({
  period = 21,
  organizationName = '營養交流協會',
  programName = '營養人生讀書會',
}: DashboardHeaderProps) {
  return (
    <header className="bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Main content */}
        <div className="flex items-center gap-4">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-24 h-32 bg-white rounded shadow-lg overflow-hidden">
            <img 
              src="/book-cover.jpg" 
              alt="吃的營養 科學觀 - 書籍封面"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">書籍封面</div>';
                }
              }}
            />
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
      </div>
    </header>
  );
}

