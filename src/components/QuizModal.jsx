import { useEffect, useState } from 'react';
import './QuizModal.css';

export default function QuizModal({ show, onClose, onComplete }) {
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (show) return;
    setInterests('');
    setSkills('');
    setIsLoading(false);
    setApiResponse(null);
    setApiError(null);
  }, [show]);

  const handleSubmit = async () => {
    const trimmedInterests = interests.trim();
    const trimmedSkills = skills.trim();
    if (!trimmedInterests) {
      setApiError('Please fill in the interests field before finding matches.');
      setApiResponse(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);
    const combinedDescription = `Interests: ${trimmedInterests} Skills: ${trimmedSkills}`;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/get-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: combinedDescription }),
      });

      if (!response.ok) throw new Error('Failed to get a response.');
      
      const data = await response.json(); // data is { "tags": { ... } }

      // --- THIS IS THE FIX ---
      // Before (Buggy):
      // setApiResponse(data); 
      
      // After (Correct):
      setApiResponse(data.tags); // We need to set the *nested* object

    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // This function now sends the tags up to App.jsx
  const handleCloseAndSave = () => {
    if (apiResponse) {
      onComplete(apiResponse); // <-- Send tags to App.jsx
    }
    onClose(); // Close the modal
  };

  if (!show) return null;

  const renderContent = () => {
    if (isLoading) return <div className="modal-content"><p>Processing...</p></div>;
    if (apiError) {
      return (
        <div className="modal-content">
          <p>{apiError}</p>
          <button
            type="button"
            className="modal-button modal-button__secondary"
            onClick={() => setApiError(null)}
          >
            Back
          </button>
        </div>
      );
    }

    if (apiResponse) {
      // Feedback Screen
      return (
        <div className="modal-content">
          <h4>We've updated your profile!</h4>
          <div>
            <strong>Interests:</strong>
            <div className="tag-container">
              {apiResponse.interests.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <strong>Skills:</strong>
            <div className="tag-container">
              {apiResponse.skills.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </div>
          <button onClick={handleCloseAndSave} className="modal-button">
            Great! See My Matches
          </button>
        </div>
      );
    }

    // Quiz Form Screen
    return (
      <div className="modal-content">
        <label htmlFor="interests">
          What events or causes are you interested in?
        </label>
        <textarea
          id="interests"
          className="modal-textarea"
          placeholder="e.g., helping animals, working with children..."
          value={interests}
          onChange={e => setInterests(e.target.value)}
        />
        <label htmlFor="skills">
          What skills or experience can you offer?
        </label>
        <textarea
          id="skills"
          className="modal-textarea"
          placeholder="e.g., graphic design, public speaking..."
          value={skills}
          onChange={e => setSkills(e.target.value)}
        />
        <button onClick={handleSubmit} className="modal-button">
          Find My Matches
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-shell" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Find Your Perfect Match</h3>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
