// This is your new app/page.tsx
"use client"; 

import { useState } from 'react';
import Head from 'next/head';
import ProjectCard from '../components/ProjectCard';
import QuizModal from '../components/QuizModal';

// 1. Update our fake data with new fields
const fakeProjects = [
  { 
    id: 1, 
    title: 'Annual Downtown Food Drive', 
    date: 'Nov 21, 2025', 
    location: 'Bedok',
    org: 'SG Cares Volunteer Centre',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649414?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjUyOXwwfDF8c2VhcmNofDR8fGZvb2QlMjBkcml2ZXxlbnwwfHx8fDE2OTk4NzYyNTE&ixlib=rb-4.0.3&q=80&w=400',
    spotsLeft: 11
  },
  { 
    id: 2, 
    title: 'Volunteer Tutors (Sengkang)', 
    date: 'Jan 05, 2026', 
    location: 'Bethesda CARE Centre',
    org: 'Bethesda CARE Centre',
    imageUrl: 'https://images.unsplash.com/photo-1542887800-01b0f15f3b7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjUyOXwwfDF8c2VhcmNofDEwfHx0dXRvcnxlbnwwfHx8fDE2OTk4NzYzMTM&ixlib=rb-4.0.3&q=80&w=400',
    spotsLeft: 10
  },
  { 
    id: 3, 
    title: 'Health Awareness Outreach', 
    date: 'Nov 17, 2025', 
    location: 'Filos Community Services',
    org: 'Filos Community Services',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjUyOXwwfDF8c2VhcmNofDF8fGhlYWx0aCUyMGNoZWNrfGVufDB8fHx8fDE2OTk4NzYzNDU&ixlib=rb-4.0.3&q=80&w=400',
    spotsLeft: 5
  }
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openQuiz = () => setIsModalOpen(true);
  const closeQuiz = () => setIsModalOpen(false);

  return (
    <div>
      <Head>
        <title>Be a volunteer</title>
      </Head>

      {/* Use Tailwind for padding and max-width */}
      <main className="container mx-auto p-4 md:p-8">
        
        {/* Hero Banner (styled with Tailwind) */}
        <div className="hero-banner p-8 bg-gray-100 rounded-lg mb-8">
          <h2 className="text-3xl font-bold mb-2">Find Your Perfect Volunteer Match.</h2>
          <p className="text-lg text-gray-700 mb-4">Let our AI find opportunities tailored to your unique skills and interests.</p>
          <button 
            onClick={openQuiz}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take the 1-Minute Quiz
          </button>
        </div>

        {/* Search and Filter Bar (like your photo) */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">Explore opportunities</h3>
          {/* We can build the search/filter inputs here later */}
        </div>

        {/* 2. This is the new CSS Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 3. We pass the new props to our redesigned card */}
          {fakeProjects.map(project => (
            <ProjectCard 
              key={project.id}
              id={project.id}
              title={project.title}
              org={project.org}
              date={project.date}
              location={project.location}
              imageUrl={project.imageUrl}
              spotsLeft={project.spotsLeft}
            />
          ))}
        </div>
      </main>

      <QuizModal 
        show={isModalOpen}
        onClose={closeQuiz}
      />
    </div>
  );
}