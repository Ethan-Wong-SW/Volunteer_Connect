import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/Login';
import OpportunitiesPage from './pages/Opportunities';
import OpportunityDetailPage from './pages/id/OpportunityDetail';
import OpportunityReviewsPage from './pages/id/OpportunityReviews';
import ProfilePage from './pages/Profile';
import FavouritesDetailPage from './pages/favorites/FavouritesDetail';
import FavouriteReviewsPage from './pages/favorites/FavouriteReviews';

const DEFAULT_PROFILE = {
  name: 'Ben',
  email: 'ben@mail.com',
  password: 'test1234',
  interests: [],
  skills: [],
  appliedOpportunities: [],
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
      skills: Array.isArray(parsed?.skills) ? parsed.skills : DEFAULT_PROFILE.skills,
      appliedOpportunities: Array.isArray(parsed?.appliedOpportunities)
        ? parsed.appliedOpportunities
        : DEFAULT_PROFILE.appliedOpportunities,
    };
  } catch (error) {
    console.warn('Unable to read profile from storage, falling back to defaults.', error);
    return DEFAULT_PROFILE;
  }
};

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(readProfileFromStorage);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    navigate('/opportunities', { replace: true });
  }, [navigate]);

  const handleApply = useCallback(
    (opportunity) => {
      const applicant = profile.name || DEFAULT_PROFILE.name;
      const appliedDate =
        opportunity.startDate || opportunity.date || new Date().toISOString().split('T')[0];

      setProfile((currentProfile) => {
        const previousApplications = Array.isArray(currentProfile.appliedOpportunities)
          ? currentProfile.appliedOpportunities
          : [];
        const withoutExisting = previousApplications.filter((item) => item.id !== opportunity.id);
        const nextEntry = {
          id: opportunity.id,
          title: opportunity.title,
          date: appliedDate,
          location: opportunity.location,
          organizer: opportunity.organizer,
        };
        const sortedApplications = [...withoutExisting, nextEntry].sort((a, b) => {
          const aTime = new Date(a.date).getTime();
          const bTime = new Date(b.date).getTime();
          if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
          if (Number.isNaN(aTime)) return 1;
          if (Number.isNaN(bTime)) return -1;
          return aTime - bTime;
        });

        return {
          ...currentProfile,
          upcomingOpportunity: nextEntry,
          appliedOpportunities: sortedApplications,
        };
      });

      window.alert(
        `Thanks, ${applicant}! We'll let ${opportunity.title} organizers know you're interested.`,
      );
    },
    [profile.name],
  );

  const handleProfileSave = useCallback(
    (nextProfile) => {
      setProfile(nextProfile);
      window.alert('Profile saved!');
    },
    [],
  );
  const handleProfileTagsChange = useCallback((nextTags = {}) => {
    setProfile((currentProfile) => {
      const mergedInterests = Array.isArray(nextTags?.interests)
        ? [...new Set(nextTags.interests)]
        : currentProfile.interests || DEFAULT_PROFILE.interests;
      const mergedSkills = Array.isArray(nextTags?.skills)
        ? [...new Set(nextTags.skills)]
        : currentProfile.skills || DEFAULT_PROFILE.skills;

      return {
        ...currentProfile,
        interests: mergedInterests,
        skills: mergedSkills,
      };
    });
  }, []);
  const handleQuizComplete = useCallback(
    (newTags) => {
      setProfile((currentProfile) => {
        // Use Set to avoid duplicate tags
        const combinedInterests = [...new Set([...(currentProfile.interests || []), ...newTags.interests])];
        const combinedSkills = [...new Set([...(currentProfile.skills || []), ...newTags.skills])];
        
        return {
          ...currentProfile,
          interests: combinedInterests,
          skills: combinedSkills,
        };
      });
      // The useEffect for 'profile' will automatically save this to localStorage
      window.alert('Profile updated with your new interests!');
    },
    [] // No dependencies, it uses the setProfile updater function
  );

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Login onComplete={handleLoginSuccess} />}
      />
      <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />}>
        <Route
          path="/home"
          element={
            <OpportunitiesPage
              profile={profile}
              onApply={handleApply}
              defaultProfile={DEFAULT_PROFILE}
              onQuizComplete={handleQuizComplete} // <-- Pass the new handler
            />
          }
        />
        <Route
          path="/opportunities"
          element={
            <OpportunitiesPage
              profile={profile}
              onApply={handleApply}
              defaultProfile={DEFAULT_PROFILE}
              onQuizComplete={handleQuizComplete}
            />
          }
        />
        <Route
          path="/opportunities/:id"
          element={<OpportunityDetailPage onApply={handleApply} />}
        />
        <Route
          path="/opportunities/:id/reviews"
          element={<OpportunityReviewsPage />}
        />
        <Route
          path="/favorites"
          element={<HomePage />}
        />
        <Route
          path="/favorites/:id"
          element={<FavouritesDetailPage onApply={handleApply} />}
        />
        <Route
          path="/favorites/:id/reviews"
          element={<FavouriteReviewsPage />}
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              profile={profile}
              onSave={handleProfileSave}
              onTagsChange={handleProfileTagsChange}
              defaultProfile={DEFAULT_PROFILE}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

}

function ProtectedLayout({ isAuthenticated, onSignOut }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Header onSignOut={onSignOut} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const navItems = [
  { key: 'discover', label: 'Discover', path: '/opportunities' },
  { key: 'favorites', label: 'Favourites', path: '/favorites' },
  { key: 'profile', label: 'Profile', path: '/profile' },
];

function Header({ onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <header>
      <h1>
        <NavLink 
          to="/opportunities" 
          className="logo-link"
          end
        >
          Volunteer Connect
        </NavLink>
      </h1>
      <div className="header-actions" ref={menuRef}>
        <nav className="header-nav">
          <ul className="header-nav-list">
            {navItems.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="sign-out header-sign-out"
            onClick={onSignOut}
          >
            Sign Out
          </button>
        </nav>
        <button
          type="button"
          className="header-burger"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="header-burger-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="sr-only">Open navigation</span>
        </button>
        {menuOpen && (
          <div className="header-menu" role="menu">
            <nav>
              <ul>
                {navItems.map((item) => (
                  <li key={item.key}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                      onClick={handleNavClick}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="sign-out"
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
              >
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
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
