import { Navigate, useNavigate, useParams } from 'react-router-dom';
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

const OpportunityDetail = ({ onApply }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunity = allOpportunities.find((item) => String(item.id) === id);

  if (!opportunity) {
    return <Navigate to="/opportunities" replace />;
  }

  const handleApplyNow = () => {
    if (typeof onApply === 'function') {
      onApply(opportunity);
    }
  };

  const handleViewReviews = () => {
    navigate(`/opportunities/${opportunity.id}/reviews`);
  };

  const dateLabel = formatStartDate(opportunity.startDate || opportunity.date);

  return (
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
      </article>
    </section>
  );
};

export default OpportunityDetail;
