import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Opportunities.css';
import { allOpportunities } from '../data/opportunities';
import QuizModal from '../components/QuizModal';
import cardArtwork from '../assets/43180.jpg';

const formatStartDate = (value) => {
  if (!value) return 'Flexible start';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const Opportunities = ({ profile = {}, onApply, onQuizComplete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
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

  const locations = useMemo(
    () => Array.from(new Set(allOpportunities.map((item) => item.location))).sort(),
    [],
  );

  const skills = useMemo(
    () =>
      Array.from(
        new Set(
          allOpportunities
            .flatMap((item) => item.skills || [])
            .map((skill) => skill.toLowerCase()),
        ),
      ).sort(),
    [],
  );

  useEffect(() => {
    const profileSkills = (profile.skills || []).map((skill) => skill.toLowerCase());
    if (!profileSkills.length) return;
    const matchedSkill = profileSkills.find((skill) => skills.includes(skill));
    if (matchedSkill) {
      setSkillFilter(matchedSkill);
    }
  }, [profile.skills, skills]);

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedUserInterests = (profile.interests || []).map((interest) => interest.toLowerCase());
    const userInterestSet = new Set(normalizedUserInterests);

    const scored = allOpportunities
      .map((opportunity, index) => ({ opportunity, index }))
      .filter(({ opportunity }) => {
        const matchesSearch =
          !normalizedSearch ||
          opportunity.title.toLowerCase().includes(normalizedSearch) ||
          opportunity.description.toLowerCase().includes(normalizedSearch) ||
          opportunity.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch));

        if (!matchesSearch) return false;

        const matchesLocation = locationFilter === 'all' || opportunity.location === locationFilter;
        const matchesSkill =
          skillFilter === 'all' || opportunity.skills.some((skill) => skill.toLowerCase() === skillFilter);

        return matchesLocation && matchesSkill;
      })
      .map(({ opportunity, index }) => {
        const opportunityInterests = (opportunity.interests || []).map((interest) => interest.toLowerCase());
        const overlap = opportunityInterests.filter((interest) => userInterestSet.has(interest));
        const hasAll = normalizedUserInterests.length > 0 && normalizedUserInterests.every((interest) =>
          opportunityInterests.includes(interest),
        );
        const category = normalizedUserInterests.length === 0
          ? 1 // keep middle bucket when user has no interests
          : hasAll
            ? 0
            : overlap.length > 0
              ? 1
              : 2;

        return {
          opportunity,
          index,
          category,
          overlapCount: overlap.length,
        };
      });

    scored.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category - b.category;
      }
      if (b.overlapCount !== a.overlapCount) {
        return b.overlapCount - a.overlapCount;
      }
      return a.index - b.index; // keep original ordering inside identical groups
    });

    return scored.map(({ opportunity }) => opportunity);
  }, [searchTerm, locationFilter, skillFilter, profile.interests]);

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
const OpportunityCard = ({ opportunity, onApply, isFavorite, onToggleFavorite }) => {
  const organizer = opportunity.organizer || 'Community Partner';
  const dateLabel = formatStartDate(opportunity.startDate || opportunity.date);
  const resolvedSpots = opportunity.spotsLeft;
  const spotsLeft =
    typeof resolvedSpots === 'number'
      ? `${resolvedSpots} spots left`
      : resolvedSpots || `${Math.max(2, 8 - (opportunity.id % 4))} spots left`;

  return (
    <article className="opportunity-card">
      <div className="opportunity-card__media">
        <img src={cardArtwork} alt="" aria-hidden="true" />
        <span className="opportunity-card__badge">{spotsLeft}</span>
        <button
          className={`home-card__favorite${isFavorite ? ' active' : ''}`}
          type="button"
          aria-label={isFavorite ? 'Remove from saved opportunities' : 'Save opportunity'}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(opportunity.id)}
        >
          ♥
        </button>
      </div>
      <div className="opportunity-card__content">
        <h3>
          <Link to={`/opportunities/${opportunity.id}`} className="opportunity-card__title-link">
            {opportunity.title}
          </Link>
        </h3>
        <p className="opportunity-card__org">{organizer}</p>
        <div className="opportunity-card__meta">
          <span className="opportunity-card__meta-item">
            <span aria-hidden="true">📍</span> {opportunity.location || 'Remote / Hybrid'}
          </span>
          <span className="opportunity-card__meta-item">
            <span aria-hidden="true">📅</span> {dateLabel}
          </span>
        </div>
        <p className="opportunity-card__description">{opportunity.description}</p>
        <div className="opportunity-card__skills">
          {opportunity.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default Opportunities;
