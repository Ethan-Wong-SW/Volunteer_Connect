// in app/project/[id]/page.tsx
"use client";

// We'll use this to get the 'id' from the URL
import { useParams } from 'next/navigation';

// This is a placeholder for a Review component we can make later
function ReviewsSection() {
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold mb-4">Past Volunteer Reviews</h3>
      {/* A "fake" review */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-1">
          <span className="font-bold mr-2">John D.</span>
          <span className="text-yellow-500">★★★★☆</span>
        </div>
        <p className="text-gray-700">
          "A really rewarding experience. The team was well-organized and everyone was friendly. 
          The seniors were lovely. Will definitely volunteer again!"
        </p>
      </div>
    </div>
  )
}

// This is the main page component
export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id; // This gets the 'id' from the URL

  // In a real app, we'd use this 'projectId' to fetch data
  // from our Supabase database. For now, we'll just show it.

  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* This is the two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* --- LEFT (MAIN) COLUMN --- */}
        <div className="w-full lg:w-2/3">
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649414?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjUyOXwwfDF8c2VhcmNofDR8fGZvb2QlMjBkcml2ZXxlbnwwfHx8fDE2OTk4NzYyNTE&ixlib=rb-4.0.3&q=80&w=1000" 
            alt="Project"
            className="w-full h-96 object-cover rounded-lg mb-6"
          />

          <h2 className="text-xl font-semibold mb-2">About the opportunity</h2>
          <p className="text-gray-700 mb-4">
            Volunteers are needed as shopping assistants to accompany seniors from Active Ageing Centres for
            grocery shopping trips, as a form of engagement and bonding activities.
          </p>
          <p className="text-gray-700">
            Responsibilities include:
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Engaging, befriending and shopping with the seniors.</li>
              <li>Sharing simple cybersecurity tips.</li>
            </ul>
          </p>

          {/* This is the Review section you asked for */}
          <ReviewsSection />
        </div>

        {/* --- RIGHT (ACTION) COLUMN --- */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-8 border rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Annual Downtown Food Drive</h2>
            
            <div className="space-y-3 text-gray-800 mb-6">
              <div className="flex items-start">
                <span className="mr-3 mt-1">📍</span>
                <span>509B BEDOK NORTH STREET 3#02-157, Singapore 462509</span>
              </div>
              <div className="flex items-start">
                <span className="mr-3 mt-1">🗓️</span>
                <span>Fri, Nov 21, 2025<br/>9:00 AM - 1:00 PM</span>
              </div>
            </div>

            <button className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors text-lg">
              I want to volunteer
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}