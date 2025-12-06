import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const normalizeFavoriteId = (value) => {
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? value : asNumber;
};

const Opportunities = ({ profile = {}, onApply, onQuizComplete, onClearProfile }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [interestFilter, setInterestFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const snackbarTimerRef = useRef(null);
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('favorites')) || [];
      return Array.from(new Set((Array.isArray(parsed) ? parsed : []).map((value) => normalizeFavoriteId(value))));
    } catch {
      return [];
    }
  });

  // Check if user has completed the quiz
  const hasCompletedQuiz = !!(profile.skills?.length > 0 || profile.interests?.length > 0);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    }
  }, [favorites]);

  const handleToggleFavorite = useCallback((id) => {
    const idValue = normalizeFavoriteId(id);
    setFavorites((current) => {
      const normalizedCurrent = current.map(normalizeFavoriteId);
      const isFavorited = normalizedCurrent.includes(idValue);
      const next = isFavorited
        ? normalizedCurrent.filter((fav) => fav !== idValue)
        : [...normalizedCurrent, idValue];
      if (snackbarTimerRef.current) {
        clearTimeout(snackbarTimerRef.current);
      }
      setSnackbarMessage(isFavorited ? 'Removed from favourites' : 'Added to favourites');
      setSnackbarVisible(true);
      snackbarTimerRef.current = setTimeout(() => {
        setSnackbarVisible(false);
        snackbarTimerRef.current = null;
      }, 2500);

      return Array.from(new Set(next));
    });
  }, []);

  useEffect(() => () => {
    if (snackbarTimerRef.current) {
      clearTimeout(snackbarTimerRef.current);
    }
  }, []);

  const locations = useMemo(
    () => Array.from(new Set(allOpportunities.map((item) => item.location))).sort(),
    [],
  );

  const { skills, skillLabelMap, uniqueInterests } = useMemo(() => {
    const labelMap = new Map();
    const interestSet = new Set();

    allOpportunities.forEach((item) => {
      (item.skills || []).forEach((skill) => {
        const normalized = skill.toLowerCase();
        if (!labelMap.has(normalized)) {
          labelMap.set(normalized, skill);
        }
      });
      (item.interests || []).forEach((int) => {
        interestSet.add(int);
      });
    });

    const uniqueSkills = Array.from(labelMap.keys()).sort();
    const sortedInterests = Array.from(interestSet).sort((a, b) => a.localeCompare(b));

    return { skills: uniqueSkills, skillLabelMap: labelMap, uniqueInterests: sortedInterests };
  }, []);

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedUserInterests = (profile.interests || []).map((interest) => interest.toLowerCase());
    const normalizedUserSkills = (profile.skills || []).map((s) => s.toLowerCase());

    const userInterestSet = new Set(normalizedUserInterests);
    const userSkillSet = new Set(normalizedUserSkills);

    const scored = allOpportunities
      .map((opportunity, index) => ({ opportunity, index }))
      .filter(({ opportunity }) => {
        // 1. Search Filter
        const matchesSearch =
          !normalizedSearch ||
          opportunity.title.toLowerCase().includes(normalizedSearch) ||
          opportunity.description.toLowerCase().includes(normalizedSearch) ||
          opportunity.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch));

        if (!matchesSearch) return false;

        // 2. Location Filter
        const matchesLocation = locationFilter === 'all' || opportunity.location === locationFilter;

        // 3. Skill Filter (Dropdown)
        const matchesSkill =
          skillFilter === 'all' || opportunity.skills.some((skill) => skill.toLowerCase() === skillFilter);

        // 4. Interest Filter (Dropdown)
        const matchesInterestFilter =
          interestFilter === 'all' || opportunity.interests.some(i => i.toLowerCase() === interestFilter.toLowerCase());

        // 5. Date Filter
        let matchesDate = true;
        const oppDateString = opportunity.date || opportunity.startDate;

        if (oppDateString) {
          const oppDate = new Date(oppDateString);

          if (!Number.isNaN(oppDate.getTime())) {
            oppDate.setHours(0, 0, 0, 0);

            if (dateRange.start) {
              const startDate = new Date(dateRange.start);
              startDate.setHours(0, 0, 0, 0);
              if (oppDate < startDate) matchesDate = false;
            }

            if (matchesDate && dateRange.end) {
              const endDate = new Date(dateRange.end);
              endDate.setHours(0, 0, 0, 0);
              if (oppDate > endDate) matchesDate = false;
            }
          }
        }

        return matchesLocation && matchesSkill && matchesInterestFilter && matchesDate;
      })
      .map(({ opportunity, index }) => {
        // Scoring logic for sorting
        const opportunityInterests = (opportunity.interests || []).map((interest) => interest.toLowerCase());
        const interestOverlap = opportunityInterests.filter((interest) => userInterestSet.has(interest)).length;

        const opportunitySkills = (opportunity.skills || []).map((skill) => skill.toLowerCase());
        const skillOverlap = opportunitySkills.filter((skill) => userSkillSet.has(skill)).length;

        return {
          opportunity,
          index,
          interestOverlap,
          skillOverlap,
        };
      });

    scored.sort((a, b) => {
      // Priority 1: Interest Overlap
      if (b.interestOverlap !== a.interestOverlap) {
        return b.interestOverlap - a.interestOverlap;
      }
      // Priority 2: Skill Overlap
      if (b.skillOverlap !== a.skillOverlap) {
        return b.skillOverlap - a.skillOverlap;
      }
      return a.index - b.index;
    });

    return scored.map(({ opportunity }) => opportunity);
  }, [searchTerm, locationFilter, skillFilter, interestFilter, dateRange, profile.interests, profile.skills]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setSkillFilter('all');
    setInterestFilter('all');
    setDateRange({ start: '', end: '' });
    if (onClearProfile) onClearProfile();
  };



  return (
    <>
      <section className="opportunities-shell">
        <header className="opportunities-hero">
          <p className="eyebrow">All opportunities</p>
          <h1>Find the next place to lend a hand.</h1>
          <p>Browse every opportunity currently accepting volunteers and apply when one speaks to you.</p>
        </header>

        <div className="quiz-callout">
          <div className="quiz-callout__content">
            <div className="quiz-callout__icon">
              ✨
            </div>
            <div className="quiz-callout__text">
              <h3>Ready to find your perfect match?</h3>
              <p>Take our 1-minute quiz to personalize your feed based on your unique skills and interests.</p>
            </div>
          </div>
          <button
            type="button"
            className="quiz-callout__button"
            onClick={() => setIsModalOpen(true)}
          >
            Take the Quiz
          </button>
        </div>

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
              {skills.map((skill) => {
                const label = skillLabelMap.get(skill) ?? skill.replace(/(^\w|\s\w)/g, (s) => s.toUpperCase());
                return (
                  <option key={skill} value={skill}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="filter-field">
            <span>Interests</span>
            <select value={interestFilter} onChange={(event) => setInterestFilter(event.target.value)}>
              <option value="all">All interests</option>
              {uniqueInterests.map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>From</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(event) => setDateRange(prev => ({ ...prev, start: event.target.value }))}
              style={{ fontFamily: 'inherit' }}
            />
          </label>

          <label className="filter-field">
            <span>To</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(event) => setDateRange(prev => ({ ...prev, end: event.target.value }))}
              style={{ fontFamily: 'inherit' }}
            />
          </label>

          <div className="filter-field">
            <span style={{ visibility: 'hidden' }}>Action</span>
            <button
              type="button"
              className="filter-clear-btn"
              onClick={handleClearFilters}
              title="Clear all skills and interests from your profile"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="opportunities-list">
          {!showAllOpportunities && hasCompletedQuiz && (
            <h2 className="opportunities-section-title">Recommended opportunities based on your interests and skills</h2>
          )}
          {filteredOpportunities.length ? (
            <>
              {(showAllOpportunities || !hasCompletedQuiz ? filteredOpportunities : filteredOpportunities.slice(0, 6)).map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onApply={onApply}
                  isFavorite={favorites.includes(opportunity.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onOpen={() => navigate(`/opportunities/${opportunity.id}`)}
                />
              ))}
              {!showAllOpportunities && hasCompletedQuiz && filteredOpportunities.length > 6 && (
                <div className="opportunities-see-all-container">
                  <button
                    type="button"
                    className="opportunities-see-all-btn"
                    onClick={() => setShowAllOpportunities(true)}
                  >
                    See all opportunities
                  </button>
                </div>
              )}
              {showAllOpportunities && hasCompletedQuiz && filteredOpportunities.length > 6 && (
                <div className="opportunities-see-all-container">
                  <button
                    type="button"
                    className="opportunities-see-all-btn"
                    onClick={() => {
                      setShowAllOpportunities(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Show top 6 recommendations
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="opportunities-empty">No opportunities match your filters right now.</p>
          )}
        </div>
        <QuizModal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={onQuizComplete}
        />
      </section>
      <div className={`snackbar${snackbarVisible ? ' visible' : ''}`} role="status" aria-live="polite">
        {snackbarMessage}
      </div>
    </>
  );
};
const OpportunityCard = ({ opportunity, onApply, isFavorite, onToggleFavorite, onOpen }) => {
  const organizer = opportunity.organizer || 'Community Partner';
  const dateLabel = formatStartDate(opportunity.startDate || opportunity.date);
  const resolvedSpots = opportunity.spotsLeft;
  const spotsLeft =
    typeof resolvedSpots === 'number'
      ? `${resolvedSpots} spots left`
      : resolvedSpots || `${Math.max(2, 8 - (opportunity.id % 4))} spots left`;

  const handleCardClick = (event) => {
    if (event.target.closest('button')) return;
    onOpen?.();
  };

  return (
    <article
      className="opportunity-card opportunity-card--clickable"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick(event);
        }
      }}
    >
      <div className="opportunity-card__media">
        <img src={cardArtwork} alt="" aria-hidden="true" />
        <span className="opportunity-card__badge">{spotsLeft}</span>
        <button
          className={`home-card__favorite${isFavorite ? ' active' : ''}`}
          type="button"
          aria-label={isFavorite ? 'Remove from saved opportunities' : 'Save opportunity'}
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(opportunity.id);
          }}
        >
          ♥
        </button>
      </div>
      <div className="opportunity-card__content">
        <h3>{opportunity.title}</h3>
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
