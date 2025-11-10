// in components/QuizModal.tsx
"use client";

import { useState } from 'react';

// Define the props our component will accept
type QuizModalProps = {
  show: boolean;
  onClose: () => void;
};

// This will be the shape of our API response (from your Python script)
type TagResult = {
  interests: string[];
  skills: string[];
};

export default function QuizModal({ show, onClose }: QuizModalProps) {
  // State for the form
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");

  // New state to manage the API call
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<TagResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);

    // Combine the two text areas into one string
    const combinedDescription = `
      Interests: ${interests}
      Skills: ${skills}
    `;

    try {
      // 1. Call our *Next.js middleman*, NOT the Python API directly
      const response = await fetch('/api/get-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: combinedDescription }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the server.');
      }

      const tags: TagResult = await response.json();
      
      // 2. We got a response! Show the feedback screen.
      setApiResponse(tags);

    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all state when closing
    setInterests("");
    setSkills("");
    setIsLoading(false);
    setApiResponse(null);
    setApiError(null);
    onClose(); // Call the parent's close function
  };

  // If the "show" prop is false, render nothing
  if (!show) {
    return null;
  }

  // Helper function to render the modal's content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={styles.content}>
          <p>Processing your answers...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (apiError) {
      return (
        <div style={styles.content}>
          <h4>Oops! Something went wrong.</h4>
          <p style={{ color: 'red' }}>{apiError}</p>
          <button onClick={handleSubmit} style={styles.submitButton}>
            Try Again
          </button>
        </div>
      );
    }

    if (apiResponse) {
      // This is the "Feedback Loop" screen we designed
      return (
        <div style={styles.content}>
          <h4>We've updated your profile!</h4>
          <p>Based on your answers, here are your new tags:</p>
          
          <div>
            <strong>Interests:</strong>
            <div style={styles.tagContainer}>
              {apiResponse.interests.map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <strong>Skills:</strong>
            <div style={styles.tagContainer}>
              {apiResponse.skills.map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
          
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            You can always manage these in your profile.
          </p>

          <button onClick={handleClose} style={styles.submitButton}>
            Great! See My Matches
          </button>
        </div>
      );
    }

    // Default: Show the quiz form
    return (
      <div style={styles.content}>
        <label htmlFor="interests">
          What events or causes are you interested in?
        </label>
        <textarea
          id="interests"
          style={styles.textarea}
          value={interests}
          onChange={e => setInterests(e.target.value)}
          placeholder="e.g., helping animals, working with children, community events..."
        />
        
        <label htmlFor="skills" style={{ marginTop: '1rem' }}>
          What skills or experience can you offer?
        </label>
        <textarea
          id="skills"
          style={styles.textarea}
          value={skills}
          onChange={e => setSkills(e.target.value)}
          placeholder="e.g., graphic design, public speaking, organizing..."
        />
        
        <button onClick={handleSubmit} style={styles.submitButton}>
          Find My Matches
        </button>
      </div>
    );
  };

  // The main modal structure
  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3>Find Your Perfect Match</h3>
          <button onClick={handleClose} style={styles.closeButton}>&times;</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

// Some basic styles to make it look like a modal
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
  },
  closeButton: {
    border: 'none',
    background: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  content: {
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    marginTop: '5px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  submitButton: {
    marginTop: '20px',
    padding: '10px 15px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  tag: {
    backgroundColor: '#e0e0e0',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '0.9rem',
  },
} as const;