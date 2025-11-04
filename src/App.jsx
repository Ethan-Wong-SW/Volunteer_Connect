import { useCallback, useEffect, useMemo, useState } from 'react';
import { allOpportunities, opportunitiesList } from './data/opportunities';

const DEFAULT_PROFILE = {
  name: 'Guest User',
  interests: ['environment'],
};

const API_URL = 'https://volunteery.cryck.workers.dev/';

const NAV_ITEMS = [
  { route: 'home', label: 'Home' },
  { route: 'opportunities', label: 'Opportunities' },
  { route: 'profile', label: 'Profile' },
];

const parseHashRoute = () => {
  if (typeof window === 'undefined') return 'home';
  const raw = window.location.hash.replace(/^#/, '');
  const normalized = raw.replace(/^\//, '').toLowerCase();

  if (!normalized || normalized === 'home') return 'home';
  if (normalized === 'opportunities') return 'opportunities';
  if (normalized === 'profile') return 'profile';
  return 'home';
};

const readProfileFromStorage = () => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  try {
    const stored = localStorage.getItem('userProfile');
    if (!stored) return DEFAULT_PROFILE;

    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      interests: Array.isArray(parsed?.interests) ? parsed.interests : DEFAULT_PROFILE.interests,
    };
  } catch (error) {
    console.warn('Unable to read profile from storage, falling back to defaults.', error);
    return DEFAULT_PROFILE;
  }
};

const simpleRecommendations = (interests) => {
  if (!interests?.length) return allOpportunities;

  const normalized = interests.map((interest) => interest.toLowerCase());

  return allOpportunities
    .map((opportunity) => {
      const score =
        opportunity.interests?.reduce(
          (acc, interest) => (normalized.includes(interest.toLowerCase()) ? acc + 1 : acc),
          0,
        ) ?? 0;

      return {
        score,
        opportunity,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ opportunity }) => opportunity);
};

const getAIRecommendations = async (interests) => {
  const systemPrompt = `You are an AI assistant that ranks volunteer opportunities.
Given the user interests and a list of opportunities, return ONLY the JSON array
of indices (starting at 1) in order of relevance.
Example: [1,3,2,4]`;

  const userPrompt = `Interests: ${interests.join(', ')}

Opportunities: ${opportunitiesList}
Rank them from most to least relevant and reply with the JSON array only.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length) {
      const raw = data.choices[0].message.content?.trim();
      if (!raw) throw new Error('Empty AI response');

      const ranking = JSON.parse(raw);
      return allOpportunities
        .map((opportunity, index) => ({
          ...opportunity,
          rank: ranking.indexOf(index + 1),
        }))
        .filter((item) => item.rank >= 0)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 3);
    }
  } catch (error) {
    console.error('AI recommendation failed, falling back to simple matching', error);
  }

  return simpleRecommendations(interests);
};

const recommendOpportunities = async (interests) => {
  if (!interests?.length) return allOpportunities;

  const recommended = await getAIRecommendations(interests);
  return recommended.length ? recommended : allOpportunities;
};

const hashForRoute = (route) => {
  if (route === 'home') return '#/';
  return `#/${route}`;
};

function App() {
  const [profile, setProfile] = useState(readProfileFromStorage);
  const [route, setRoute] = useState(() => parseHashRoute());

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };

    window.addEventListener('hashchange', handleHashChange);
    // Sync any existing hash on first load
    setRoute(parseHashRoute());

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((nextRoute) => {
    setRoute(nextRoute);
    window.location.hash = hashForRoute(nextRoute);
  }, []);

  const handleApply = useCallback(
    (opportunity) => {
      const applicant = profile.name || DEFAULT_PROFILE.name;
      window.alert(`Thanks, ${applicant}! We'll let ${opportunity.title} organizers know you're interested.`);
    },
    [profile.name],
  );

  const handleProfileSave = useCallback(
    (nextProfile) => {
      setProfile(nextProfile);
      window.alert('Profile saved!');
      navigate('opportunities');
    },
    [navigate],
  );

  const page = useMemo(() => route, [route]);

  return (
    <div className="app">
      <Header activeRoute={page} onNavigate={navigate} />
      <main>
        {page === 'home' && <HomePage />}
        {page === 'opportunities' && <OpportunitiesPage profile={profile} onApply={handleApply} />}
        {page === 'profile' && <ProfilePage profile={profile} onSave={handleProfileSave} />}
      </main>
      <Footer />
    </div>
  );
}

function Header({ activeRoute, onNavigate }) {
  return (
    <header>
      <h1>Volunteer Connect</h1>
      <nav>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.route}>
              <a
                href={hashForRoute(item.route)}
                className={activeRoute === item.route ? 'active' : ''}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.route);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <div>
      <section className="hero">
        <h2>Find Your Perfect Volunteer Opportunity</h2>
        <p>Connect with organizations looking for your skills and passions.</p>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Discover Opportunities</h3>
          <p>Browse through a variety of volunteer positions that match your interests.</p>
        </div>
        <div className="feature">
          <h3>AI Recommendations</h3>
          <p>Get personalized recommendations based on your profile and preferences.</p>
        </div>
      </section>
    </div>
  );
}

function OpportunitiesPage({ profile, onApply }) {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadRecommendations = async () => {
      setLoading(true);
      setError('');

      const interests = profile.interests?.filter(Boolean) ?? [];

      try {
        const results = await recommendOpportunities(interests);
        if (!ignore) {
          setRecommended(results);
        }
      } catch (err) {
        console.error('Unable to load recommendations', err);
        if (!ignore) {
          setRecommended(allOpportunities);
          setError('We had trouble loading AI recommendations, so we are showing everything instead.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [profile]);

  const profileName = profile.name || DEFAULT_PROFILE.name;

  return (
    <section className="opportunities-page">
      <h1>Volunteer Opportunities for {profileName}</h1>

      <div className="recommendations">
        <h2>Recommended for You</h2>
        {loading ? (
          <div className="loading">
            <p>Loading opportunities…</p>
            <div className="spinner" />
          </div>
        ) : (
          <OpportunityList opportunities={recommended} onApply={onApply} />
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="all-opportunities">
        <h2>All Opportunities</h2>
        <OpportunityList opportunities={allOpportunities} onApply={onApply} />
      </div>
    </section>
  );
}

function OpportunityList({ opportunities, onApply }) {
  if (!opportunities.length) {
    return <p>No opportunities found matching your interests.</p>;
  }

  return (
    <div className="opportunities-list">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} onApply={onApply} />
      ))}
    </div>
  );
}

function OpportunityCard({ opportunity, onApply }) {
  return (
    <div className="opportunity">
      <h3>{opportunity.title}</h3>
      <p>{opportunity.description}</p>
      <p>
        <strong>Location:</strong> {opportunity.location}
      </p>
      <p>
        <strong>Required Skills:</strong> {opportunity.skills.join(', ')}
      </p>
      <button type="button" onClick={() => onApply(opportunity)}>
        Apply
      </button>
    </div>
  );
}

function ProfilePage({ profile, onSave }) {
  const [name, setName] = useState(profile.name ?? '');
  const [interests, setInterests] = useState(profile.interests?.join(', ') ?? '');

  useEffect(() => {
    setName(profile.name ?? '');
    setInterests(profile.interests?.join(', ') ?? '');
  }, [profile]);

  const interestList = useMemo(
    () =>
      interests
        .split(',')
        .map((interest) => interest.trim())
        .filter(Boolean),
    [interests],
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const sanitizedName = name.trim() || DEFAULT_PROFILE.name;
    onSave({
      name: sanitizedName,
      interests: interestList,
    });
  };

  return (
    <section>
      <form onSubmit={handleSubmit} id="profile-form">
        <h2>Edit Your Profile</h2>

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="interests">Interests (comma-separated):</label>
          <input
            id="interests"
            type="text"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="environment, education, community"
          />
        </div>

        <button type="submit">Save Profile</button>
      </form>

      <div className="profile-preview" id="profile-preview">
        <h2>Your Profile</h2>
        <p>
          <strong>Name:</strong> <span id="preview-name">{name || DEFAULT_PROFILE.name}</span>
        </p>
        <p>
          <strong>Interests:</strong>{' '}
          <span id="preview-interests">{interestList.length ? interestList.join(', ') : 'Add some interests above.'}</span>
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <p>© 2025 Volunteer Connect</p>
    </footer>
  );
}

export default App;
