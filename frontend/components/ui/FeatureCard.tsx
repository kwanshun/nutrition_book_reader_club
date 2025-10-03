import Link from 'next/link';

interface FeatureCardProps {
  href: string;
  icon: string;
  label: string;
}

export default function FeatureCard({ href, icon, label }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow"
    >
      <div className="text-5xl">{icon}</div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  );
}

