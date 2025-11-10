// in components/ProjectCard.tsx
import Link from 'next/link';

// 1. Update our props to include an image and link
type ProjectCardProps = {
  id: number;
  title: string;
  org: string;
  date: string;
  location: string;
  imageUrl: string; // <-- NEW
  spotsLeft?: number; // <-- NEW (optional)
};

export default function ProjectCard({ id, title, org, date, location, imageUrl, spotsLeft }: ProjectCardProps) {
  return (
    // 2. Wrap the card in a Link to make it clickable
    <Link href={`/project/${id}`} className="block rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="relative">
        {/* 3. Add the Image */}
        <img className="w-full h-48 object-cover" src={imageUrl} alt={title} />
        
        {/* 4. Add the "Spots Left" tag (like your photo) */}
        {spotsLeft && (
          <span className="absolute top-2 left-2 bg-white text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {spotsLeft} spots left
          </span>
        )}
      </div>
      
      {/* 5. Add the text content with padding */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{org}</p>
        
        {/* 6. Use flexbox for icons and text */}
        <div className="text-sm text-gray-800 space-y-1">
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            <span>{location}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🗓️</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}