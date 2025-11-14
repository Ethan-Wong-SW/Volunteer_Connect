import './Home.css';

const nearbyOpportunities = [
  {
    id: 1,
    title: 'Planting trees, XYZ',
    summary: 'Community park clean-up and planting.',
    date: '17 Oct 2025',
  },
  {
    id: 2,
    title: 'Give clean water',
    summary: 'Help assemble filter kits for families.',
    date: '21 Oct 2025',
  },
];

const recentOpportunities = [
  {
    id: 3,
    title: 'Collaborate in an orphanage',
    summary: 'Weekend creative workshops for kids.',
    date: '13 Oct 2025',
  },
  {
    id: 4,
    title: 'Help new arrivals',
    summary: 'Welcome packs for refugee families.',
    date: '15 Oct 2025',
  },
];

const OpportunityCard = ({ title, summary, date }) => (
  <article className="home-card">
    <div className="home-card__icon" aria-hidden="true">
      <span />
    </div>
    <div>
      <h3>{title}</h3>
      <p>{summary}</p>
      <p className="home-card__date">{date}</p>
    </div>
  </article>
);

const Home = () => {
  return (
    <div className="home-shell">
      <header className="home-hero">
        <h1>Find Your Perfect Volunteer Opportunity</h1>
        <p>Connect with organisations looking for your skills and passions.</p>
      </header>

      <div className="home-grid">
        <section className="home-section">
          <header>
            <h2>Volunteering opportunities nearby</h2>
            <button type="button" className="link-button">
              See all
            </button>
          </header>
          <div className="home-list">
            {nearbyOpportunities.map((item) => (
              <OpportunityCard
                key={item.id}
                {...item}
              />
            ))}
          </div>
        </section>

        <section className="home-section">
          <header>
            <h2>Recent opportunities</h2>
            <button type="button" className="link-button">
              See all
            </button>
          </header>
          <div className="home-list">
            {recentOpportunities.map((item) => (
              <OpportunityCard
                key={item.id}
                {...item}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
