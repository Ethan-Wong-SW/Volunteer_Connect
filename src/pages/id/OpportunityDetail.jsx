import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import './OpportunityDetail.css';
import { allOpportunities } from '../../data/opportunities';
import cardArtwork from '../../assets/43180.jpg';

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

const OpportunityDetail = ({ onApply }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunity = allOpportunities.find((item) => String(item.id) === id);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('favorites'));
      return Array.from(new Set((Array.isArray(stored) ? stored : []).map((item) => normalizeFavoriteId(item))));
    } catch {
      return [];
    }
  });
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const snackbarTimerRef = useRef(null);

  if (!opportunity) {
    return <Navigate to="/opportunities" replace />;
  }

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    }
  }, [favorites]);

  const handleApplyNow = () => {
    if (typeof onApply === 'function') {
      onApply(opportunity);
    }
  };

  const handleViewReviews = () => {
    navigate(`/opportunities/${opportunity.id}/reviews`);
  };

  const dateLabel = formatStartDate(opportunity.startDate || opportunity.date);
  const isFavorite = useMemo(
    () => favorites.map(normalizeFavoriteId).includes(normalizeFavoriteId(opportunity.id)),
    [favorites, opportunity.id],
  );

  const handleToggleFavorite = () => {
    const idValue = normalizeFavoriteId(opportunity.id);
    setFavorites((current) => {
      const normalizedCurrent = current.map(normalizeFavoriteId);
      const next = normalizedCurrent.includes(idValue)
        ? normalizedCurrent.filter((fav) => fav !== idValue)
        : [...normalizedCurrent, idValue];

      const nowFavorited = !normalizedCurrent.includes(idValue);
      if (snackbarTimerRef.current) {
        clearTimeout(snackbarTimerRef.current);
      }
      setSnackbarMessage(nowFavorited ? 'Added to favourites' : 'Removed from favourites');
      setSnackbarVisible(true);
      snackbarTimerRef.current = setTimeout(() => {
        setSnackbarVisible(false);
        snackbarTimerRef.current = null;
      }, 2500);

      return Array.from(new Set(next));
    });
  };

  useEffect(
    () => () => {
      if (snackbarTimerRef.current) {
        clearTimeout(snackbarTimerRef.current);
      }
    },
    [],
  );

  return (
    <>
      <section className="opportunity-detail-shell">
        <button type="button" className="opportunity-detail__back" onClick={() => navigate('/opportunities')}>
          ← Back to opportunities
        </button>

        <article className="opportunity-detail-card">
          <header className="opportunity-detail-card__header">
            <div>
              <p className="opportunity-detail-card__org">{opportunity.organizer || 'Community Partner'}</p>
              <h1>{opportunity.title}</h1>
            </div>
            <span className="opportunity-detail-card__date">{dateLabel}</span>
          </header>

          <div className="opportunity-detail-card__media">
            <img src={cardArtwork} alt="" aria-hidden="true" />
          </div>

          <section className="opportunity-detail-card__section">
            <h2>Overview</h2>
            <p>{opportunity.description}</p>
          </section>

          <section className="opportunity-detail-card__section">
            <h2>Requirements</h2>
            <p>No requirements needed.</p>
          </section>

          <section className="opportunity-detail-card__quickfacts">
            <div>
              <h3>Location</h3>
              <p>{opportunity.location || 'Remote / Hybrid'}</p>
            </div>
            <div>
              <h3>Skills highlighted</h3>
              <div className="opportunity-detail-card__skills">
                {opportunity.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          </section>

          <div className="opportunity-detail-card__actions">
            <button
              type="button"
              className={`opportunity-detail-favorite${isFavorite ? ' active' : ''}`}
              onClick={handleToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
            >
              ♥
            </button>
            <div className="opportunity-detail-card__cta-group">
              <button
                type="button"
                className="opportunity-detail-card__button opportunity-detail-card__button--outline"
                onClick={handleViewReviews}
              >
                Reviews
              </button>
              <button
                type="button"
                className="opportunity-detail-card__button opportunity-detail-card__button--primary"
                onClick={handleApplyNow}
              >
                Apply now
              </button>
            </div>
          </div>
        </article>
      </section>
      <div className={`opportunity-detail-snackbar${snackbarVisible ? ' visible' : ''}`} role="status" aria-live="polite">
        {snackbarMessage}
      </div>
    </>
  );
};

export default OpportunityDetail;
