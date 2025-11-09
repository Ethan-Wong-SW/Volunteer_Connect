import { useEffect, useMemo, useState } from 'react';
import './Profile.css';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STORY_MAX_LENGTH = 280;

const Profile = ({ profile, onSave, defaultProfile }) => {
  const fallbackProfile = defaultProfile ?? {
    name: 'Guest User',
    interests: ['environment'],
    email: 'volunteer@example.com',
  };
  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [password, setPassword] = useState(profile.password ?? '');
  const [story, setStory] = useState(profile.story ?? '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  useEffect(() => {
    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setPassword(profile.password ?? '');
    setStory(profile.story ?? '');
  }, [profile]);

  const upcomingDate =
    profile.upcomingOpportunity?.date ?? profile.availabilityDate ?? profile.nextOpportunityDate ?? '';
  const upcomingDateObj = upcomingDate ? new Date(upcomingDate) : null;
  const calendarBaseDate = useMemo(
    () => (upcomingDateObj ? new Date(upcomingDateObj) : new Date()),
    [upcomingDateObj],
  );
  const displayMonthDate = useMemo(
    () => new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() + calendarMonthOffset, 1),
    [calendarBaseDate, calendarMonthOffset],
  );

  const formattedAvailability = upcomingDateObj
    ? upcomingDateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        weekday: 'short',
      })
    : '';

  const calendarMonthLabel = displayMonthDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    if (!calendarOpen) {
      setCalendarMonthOffset(0);
    }
  }, [calendarOpen, upcomingDate]);

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(displayMonthDate.getFullYear(), displayMonthDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(displayMonthDate.getFullYear(), displayMonthDate.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(displayMonthDate.getFullYear(), displayMonthDate.getMonth(), day);
      cells.push({
        key: `day-${day}`,
        label: day,
        isSelected:
          upcomingDateObj &&
          cellDate.getFullYear() === upcomingDateObj.getFullYear() &&
          cellDate.getMonth() === upcomingDateObj.getMonth() &&
          cellDate.getDate() === upcomingDateObj.getDate(),
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [displayMonthDate, upcomingDateObj]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const sanitizedName = name.trim() || fallbackProfile.name;
    const sanitizedStory = story.trim();
    onSave({
      name: sanitizedName,
      email: email.trim() || fallbackProfile.email,
      password,
      story: sanitizedStory,
      interests: Array.isArray(profile.interests) ? profile.interests : fallbackProfile.interests,
    });
  };

  return (
    <section className="profile-shell">
      <header className="profile-hero">
        <p className="eyebrow">Profile</p>
        <h1>Keep your volunteering story up to date.</h1>
        <p>Tell organizations who you are, what you care about, and when you are free to help.</p>
      </header>

      <div className="profile-grid">
        <article className="profile-card profile-card--summary">
          <div className="profile-card__header">
            <div className="profile-avatar" aria-hidden="true">
              <span>{(name || fallbackProfile.name).slice(0, 1).toUpperCase()}</span>
            </div>
            <div>
              <p className="profile-card__label">Active volunteer</p>
              <h2>{name || fallbackProfile.name}</h2>
            </div>
            <div className="profile-card__calendar">
              <button
                type="button"
                className="calendar-button"
                aria-pressed={calendarOpen}
                onClick={() => setCalendarOpen((open) => !open)}
              >
                📅
                <span className="sr-only">View upcoming volunteering calendar</span>
              </button>
              {calendarOpen && (
                <div className="calendar-panel" role="dialog" aria-label="Upcoming volunteering calendar">
                  <div className="calendar-panel__header">
                    <button
                      type="button"
                      className="calendar-nav-button"
                      onClick={() => setCalendarMonthOffset((value) => value - 1)}
                      aria-label="Show previous month"
                    >
                      ‹
                    </button>
                    <p>{calendarMonthLabel}</p>
                    <button
                      type="button"
                      className="calendar-nav-button"
                      onClick={() => setCalendarMonthOffset((value) => value + 1)}
                      aria-label="Show next month"
                    >
                      ›
                    </button>
                  </div>
                  {formattedAvailability && <span className="calendar-panel__pill">Next confirmed: {formattedAvailability}</span>}
                  <div className="calendar-grid" role="grid">
                    {dayNames.map((day) => (
                      <span key={day} className="calendar-grid__day" role="columnheader">
                        {day}
                      </span>
                    ))}
                    {calendarCells.map((cell, index) =>
                      cell ? (
                        <span
                          key={cell.key}
                          className={`calendar-cell${cell.isSelected ? ' calendar-cell--active' : ''}`}
                          aria-selected={cell.isSelected}
                          role="gridcell"
                        >
                          {cell.label}
                        </span>
                      ) : (
                        <span key={`empty-${index}`} className="calendar-cell calendar-cell--empty" aria-hidden="true" />
                      ),
                    )}
                  </div>
                  <p className="calendar-panel__note">
                    {formattedAvailability
                      ? `You are booked for ${formattedAvailability}.`
                      : 'Confirmed volunteering dates will appear here.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          <form
            className="profile-story-field"
            onSubmit={(event) => {
              event.preventDefault();
              const sanitizedStory = story.trim();
              onSave({
                ...profile,
                story: sanitizedStory,
              });
            }}
          >
            <div className="profile-story-field__header">
              <div>
                <p>Your story</p>
                <small>Let organizers know what drives you to volunteer.</small>
              </div>
              <span className="profile-story-field__count">
                {story.length}/{STORY_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="story"
              value={story}
              onChange={(event) => setStory(event.target.value)}
              placeholder="Share what motivates you to volunteer..."
              rows={6}
              maxLength={STORY_MAX_LENGTH}
            />
            <div className="profile-story-field__actions">
              <button type="submit" className="profile-save profile-save--story">
                Save story
              </button>
            </div>
          </form>
        </article>

        <form onSubmit={handleSubmit} id="profile-form" className="profile-card profile-card--form">
          <h3>Profile details</h3>

          <label htmlFor="name" className="form-field">
            <span>Name</span>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </label>

          <label htmlFor="email" className="form-field">
            <span>Email</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label htmlFor="password" className="form-field">
            <span>Password</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="profile-save">
            Save profile
          </button>
        </form>

      </div>
    </section>
  );
};

export default Profile;
