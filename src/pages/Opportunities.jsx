import { useMemo, useState, useEffect, useCallback } from 'react';
import './Opportunities.css';
import { allOpportunities } from '../data/opportunities';
import QuizModal from '../components/QuizModal'; // <-- NEW: Import the modal

const Opportunities = ({ profile = {}, onApply, defaultProfile, onQuizComplete }) => {
  const profileName = profile.name || defaultProfile?.name || 'Volunteer';

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  //Add state to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = useCallback((id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((fav) => fav !== id)
        : [...current, id]
    );
  }, []);

  const locations = useMemo(() => Array.from(new Set(allOpportunities.map((item) => item.location))), []);

  const skills = useMemo(
    () =>
      Array.from(
        new Set(
          allOpportunities
            .flatMap((item) => item.skills || [])
            .map((skill) => skill.toLowerCase())
        )
      ).sort(),
    []
  );
  // --- NEW (Optional Bonus): This syncs the dropdown with your profile ---
  // When your profile changes, this will try to auto-select a skill in the filter
  useEffect(() => {
    const profileSkills = profile.skills || [];
    if (profileSkills.length > 0) {
      // Find the first profile skill that is also in the dropdown list
      const topSkill = profileSkills.find(ps => skills.includes(ps.toLowerCase()));
      if (topSkill) {
        setSkillFilter(topSkill.toLowerCase());
      }
    }
  }, [profile.skills, skills]); // Re-run if profile.skills changes
  
  // --- UPDATED: The filter logic with AI matching ---
  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // --- NEW: Get the user's interests from the profile ---
    const userInterests = profile.interests || [];

    return allOpportunities.filter((opportunity) => {
      // Your existing filter logic
      const matchesSearch =
        !normalizedSearch ||
        opportunity.title.toLowerCase().includes(normalizedSearch) ||
        opportunity.description.toLowerCase().includes(normalizedSearch) ||
        opportunity.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch));

      const matchesLocation = locationFilter === 'all' || opportunity.location === locationFilter;
      const matchesSkill =
        skillFilter === 'all' || opportunity.skills.some((skill) => skill.toLowerCase() === skillFilter);
      
      // --- NEW: The AI Matching Logic ---
      // This checks for an overlap between the user's interests and the opportunity's interests
      const matchesAiInterests =
        userInterests.length === 0 || // If user has no interests, show all
        opportunity.interests.some(interest => // <-- THE KEY CHANGE
          userInterests.includes(interest.toLowerCase())
        );

      // --- UPDATED: All filters must now be true ---
      return matchesAiInterests && matchesSearch && matchesLocation && matchesSkill;
    });

    // --- UPDATED: Add profile.interests to the dependency array ---
  }, [locationFilter, skillFilter, searchTerm, profile.interests]);

  return (
    <section className="opportunities-shell">
      <header className="opportunities-hero">
        <p className="eyebrow">All opportunities</p>
        <h1>Find the next place to lend a hand.</h1>
        <p>Browse every opportunity currently accepting volunteers and apply when one speaks to you.</p>
        
        {/* --- NEW: Add the button to open the quiz --- */}
        <button
          type="button"
          className="link-button" // Use your existing style
          style={{ fontSize: '1.1rem', marginTop: '0.5rem', alignSelf: 'flex-start' }}
          onClick={() => setIsModalOpen(true)}
        >
          ✨ Personalize Your Feed (Take Quiz)
        </button>
      </header>
      
      <div className="opportunities-filters" role="search">
        <label className="filter-field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Role, skill, cause…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <label className="filter-field">
          <span>Location</span>
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Skills</span>
          <select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)}>
            <option value="all">All skills</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill.replace(/(^\w|\s\w)/g, (s) => s.toUpperCase())}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="opportunities-list">
        {filteredOpportunities.length ? (
          filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onApply={onApply}
              isFavorite={favorites.includes(opportunity.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        ) : (
          <p className="opportunities-empty">No opportunities match your filters right now.</p>
        )}
      </div>
      <QuizModal 
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={onQuizComplete} // This passes the tags up to App.jsx
      />
    </section>
  );
};
const OpportunityCard = ({ opportunity, onApply, isFavorite, onToggleFavorite }) => (
  <article className="opportunity-card">
    <div className="opportunity-card__icon" aria-hidden="true">
      <span />
    </div>
    <div className="opportunity-card__body">
      <div className="opportunity-card__header">
        <h3>{opportunity.title}</h3>
        <p className="opportunity-card__location">{opportunity.location}</p>
      </div>
      <p className="opportunity-card__description">{opportunity.description}</p>
      <div className="opportunity-card__skills">
        {opportunity.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </div>

    <button
      className={`home-card__favorite${isFavorite ? ' active' : ''}`}
      type="button"
      aria-label="Save opportunity"
      aria-pressed={isFavorite}
      onClick={() => onToggleFavorite(opportunity.id)}
    >
      ♥
    </button>
  </article>
);

export default Opportunities;