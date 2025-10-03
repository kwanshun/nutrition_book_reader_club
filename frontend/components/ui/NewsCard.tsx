interface NewsCardProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export default function NewsCard({ title, description, imageUrl }: NewsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded" />
        ) : (
          <span className="text-2xl">🖼️</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

