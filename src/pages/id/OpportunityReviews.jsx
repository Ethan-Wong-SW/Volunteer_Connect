import { Navigate, useNavigate, useParams } from 'react-router-dom';
import './OpportunityReviews.css';
import { allOpportunities } from '../../data/opportunities';

const volunteerReviews = [
  {
    id: 'rev-olivia',
    reviewer: 'Olivia S.',
    rating: 5,
    message: 'Hands down the best volunteer shift I have done. Everything ran smoothly and everyone was so kind.',
  },
  {
    id: 'rev-tyler',
    reviewer: 'Tyler N.',
    rating: 4,
    message: 'Well organized and meaningful work. I would have liked a little more time for setup, but I still had a blast.',
  },
  {
    id: 'rev-ali',
    reviewer: 'Aliyah W.',
    rating: 5,
    message: 'Coordinators were ready with roles for all of us. Felt great to see the impact right away.',
  },
  {
    id: 'rev-marc',
    reviewer: 'Marcus K.',
    rating: 4,
    message: 'Friendly team and flexible shifts. You meet great people and help the community at the same time.',
  },
  {
    id: 'rev-fatima',
    reviewer: 'Fatima H.',
    rating: 5,
    message: 'Highly recommend! The organizers checked on us often and made sure we were supported the entire day.',
  },
];

const getReviewStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(safeRating).padEnd(5, '☆');
};

const averageRating = volunteerReviews.reduce((total, review) => total + review.rating, 0) / volunteerReviews.length;

const OpportunityReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunity = allOpportunities.find((item) => String(item.id) === id);

  if (!opportunity) {
    return <Navigate to="/opportunities" replace />;
  }

  return (
    <section className="opportunity-reviews-shell">
      <button type="button" className="opportunity-reviews__back" onClick={() => navigate(`/opportunities/${opportunity.id}`)}>
        ← Back to {opportunity.title}
      </button>

      <article className="opportunity-reviews-card">
        <header className="opportunity-reviews-card__header">
          <div>
            <p className="opportunity-reviews-card__org">{opportunity.organizer || 'Community Partner'}</p>
            <h1>{opportunity.title}</h1>
            <p className="opportunity-reviews-card__subtitle">Here is what past volunteers shared after helping out.</p>
          </div>
          <div
            className="opportunity-reviews-card__average"
            role="img"
            aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
          >
            <span>{getReviewStars(averageRating)}</span>
            <strong>{averageRating.toFixed(1)}</strong>
          </div>
        </header>

        <ul className="opportunity-reviews-card__list">
          {volunteerReviews.map((review) => (
            <li key={review.id} className="opportunity-reviews-card__review">
              <div role="img" aria-label={`${review.rating} out of 5 stars`} className="opportunity-reviews-card__stars">
                {getReviewStars(review.rating)}
              </div>
              <p className="opportunity-reviews-card__message">{review.message}</p>
              <p className="opportunity-reviews-card__author">— {review.reviewer}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default OpportunityReviews;
