import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { allOpportunities } from '../data/opportunities';
import cardArtwork from '../assets/43180.jpg';

const formatStartDate = (value) => {
  if (!value) return 'Flexible start';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const readFavoritesFromStorage = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = JSON.parse(localStorage.getItem('favorites'));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const FavoriteCard = ({ opportunity, onToggleFavorite }) => {
  const organizer = opportunity.organizer || 'Community Partner';
  const dateLabel = formatStartDate(opportunity.startDate || opportunity.date);
  const resolvedSpots = opportunity.spotsLeft;
  const spotsLeft =
    typeof resolvedSpots === 'number'
      ? `${resolvedSpots} spots left`
      : resolvedSpots || `${Math.max(2, 8 - (opportunity.id % 4))} spots left`;

  return (
    <article className="opportunity-card home-favorite-card">
      <div className="opportunity-card__media">
        <img src={cardArtwork} alt="" aria-hidden="true" />
        <span className="opportunity-card__badge">{spotsLeft}</span>
        <button
          className="home-card__favorite active"
          type="button"
          aria-label="Remove from saved opportunities"
          aria-pressed="true"
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

const Home = () => {
  const [favoriteIds, setFavoriteIds] = useState(readFavoritesFromStorage);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncFavorites = () => {
      setFavoriteIds(readFavoritesFromStorage());
    };

    window.addEventListener('storage', syncFavorites);
    window.addEventListener('favoritesUpdated', syncFavorites);
    return () => {
      window.removeEventListener('storage', syncFavorites);
      window.removeEventListener('favoritesUpdated', syncFavorites);
    };
  }, []);

  const favoriteOpportunities = useMemo(
    () => allOpportunities.filter((opportunity) => favoriteIds.includes(opportunity.id)),
    [favoriteIds],
  );

  const handleToggleFavorite = useCallback((id) => {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((fav) => fav !== id) : [...current, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      }
      return next;
    });
  }, []);

  return (
    <section className="home-shell">
      <header className="home-hero">
        <p className="home-hero__eyebrow">Favorites</p>
        <h1>Your saved opportunities</h1>
        <p>
          Quickly jump back into roles you've bookmarked. We keep this list synced with your saved opportunities so you
          can act when the time is right.
        </p>
      </header>

      {favoriteOpportunities.length ? (
        <div className="home-favorites-grid">
          {favoriteOpportunities.map((opportunity) => (
            <FavoriteCard key={opportunity.id} opportunity={opportunity} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      ) : (
        <div className="home-empty-state">
          <p>You haven't added anything to your favorites yet.</p>
          <p>Explore the full list of opportunities and tap the heart icon to save them here.</p>
          <Link to="/opportunities" className="home-cta">
            Discover opportunities
          </Link>
        </div>
      )}
    </section>
  );
};

export default Home;
