import { useEffect, useMemo, useState } from 'react';
import './Profile.css';
import { allOpportunities } from '../data/opportunities';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STORY_MAX_LENGTH = 280;

const formatDateKey = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const parseDateValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const normalized = value.split('T')[0];
    const parts = normalized.split('-').map((part) => Number(part));
    if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
      const [year, month, day] = parts;
      const parsed = new Date(year, month - 1, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// <-- NEW: A re-usable component for the tag
const Tag = ({ label, onRemove }) => (
  <button type="button" className="tag" onClick={onRemove}>
    {label}
    <span className="tag-remove">&times;</span>
  </button>
);

const Profile = ({ profile, onSave, defaultProfile, onTagsChange }) => {
  const fallbackProfile = defaultProfile ?? {
    name: 'Ben',
    email: 'ben@mail.com',
    password: 'test1234',
    interests: [],
    skills: [],
  };
  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [password, setPassword] = useState(profile.password ?? '');
  const [story, setStory] = useState(profile.story ?? '');
  // <-- NEW: Add local state for interests and skills
  const [interests, setInterests] = useState(profile.interests ?? []);
  const [skills, setSkills] = useState(profile.skills ?? []);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const { availableInterests, availableSkills } = useMemo(() => {
    const interestMap = new Map();
    const skillMap = new Map();

    allOpportunities.forEach((item) => {
      (item.interests || []).forEach((interest) => {
        const normalized = interest.toLowerCase();
        if (!interestMap.has(normalized)) {
          interestMap.set(normalized, interest);
        }
      });
      (item.skills || []).forEach((skill) => {
        const normalized = skill.toLowerCase();
        if (!skillMap.has(normalized)) {
          skillMap.set(normalized, skill);
        }
      });
    });

    const localeSort = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
    return {
      availableInterests: Array.from(interestMap.values()).sort(localeSort),
      availableSkills: Array.from(skillMap.values()).sort(localeSort),
    };
  }, []);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  useEffect(() => {
    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setPassword(profile.password ?? '');
    setStory(profile.story ?? '');
    // <-- NEW: Update tag state when profile prop changes
    setInterests(profile.interests ?? []);
    setSkills(profile.skills ?? []);
    setSelectedInterest('');
    setSelectedSkill('');
  }, [profile]);

  const appliedEvents = useMemo(() => {
    const entries = Array.isArray(profile.appliedOpportunities) ? profile.appliedOpportunities : [];
    return entries
      .map((entry) => {
        if (!entry?.date) return null;
        const dateObj = parseDateValue(entry.date);
        if (!dateObj) return null;
        return {
          ...entry,
          dateObj,
          dateKey: formatDateKey(dateObj),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [profile.appliedOpportunities]);

  const nextAppliedEvent = useMemo(() => {
    if (!appliedEvents.length) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appliedEvents.find((event) => event.dateObj >= today) ?? appliedEvents[0];
  }, [appliedEvents]);

  const fallbackDateValue =
    profile.upcomingOpportunity?.date ?? profile.availabilityDate ?? profile.nextOpportunityDate ?? '';
  const fallbackTitle = profile.upcomingOpportunity?.title ?? '';
  const upcomingDateValue = nextAppliedEvent?.date ?? fallbackDateValue ?? '';
  const upcomingTitle = nextAppliedEvent?.title ?? fallbackTitle;
  const upcomingDateObj = useMemo(() => {
    if (!upcomingDateValue) return null;
    return parseDateValue(upcomingDateValue);
  }, [upcomingDateValue]);
  const upcomingDateKey = upcomingDateObj ? formatDateKey(upcomingDateObj) : '';

  const eventsByDate = useMemo(() => {
    const map = new Map();
    appliedEvents.forEach((event) => {
      if (!map.has(event.dateKey)) {
        map.set(event.dateKey, []);
      }
      map.get(event.dateKey).push(event);
    });
    return map;
  }, [appliedEvents]);
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
  }, [calendarOpen, upcomingDateKey]);

  const eventsThisMonth = useMemo(
    () =>
      appliedEvents.filter(
        (event) =>
          event.dateObj.getFullYear() === displayMonthDate.getFullYear() &&
          event.dateObj.getMonth() === displayMonthDate.getMonth(),
      ),
    [appliedEvents, displayMonthDate],
  );

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(displayMonthDate.getFullYear(), displayMonthDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(displayMonthDate.getFullYear(), displayMonthDate.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(displayMonthDate.getFullYear(), displayMonthDate.getMonth(), day);
      const dateKey = formatDateKey(cellDate);
      const eventsOnDate = eventsByDate.get(dateKey) ?? [];
      const isSelected = Boolean(upcomingDateKey && dateKey === upcomingDateKey);
      cells.push({
        key: `day-${day}`,
        label: day,
        isSelected,
        hasEvents: eventsOnDate.length > 0,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [displayMonthDate, upcomingDateKey, eventsByDate]);
  // <-- NEW: Handlers to update local tag state
  const notifyTagChange = (nextInterests, nextSkills) => {
    // Keep the live profile in sync so opportunity filters update instantly.
    if (typeof onTagsChange === 'function') {
      onTagsChange({
        interests: nextInterests,
        skills: nextSkills,
      });
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    const nextInterests = interests.filter((interest) => interest !== interestToRemove);
    setInterests(nextInterests);
    notifyTagChange(nextInterests, skills);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const nextSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(nextSkills);
    notifyTagChange(interests, nextSkills);
  };

  const handleAddInterest = () => {
    const trimmed = selectedInterest.trim();
    if (!trimmed) return;
    if (interests.includes(trimmed)) {
      setSelectedInterest('');
      return;
    }
    const nextInterests = [...interests, trimmed];
    setInterests(nextInterests);
    notifyTagChange(nextInterests, skills);
    setSelectedInterest('');
  };

  const handleAddSkill = () => {
    const trimmed = selectedSkill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSelectedSkill('');
      return;
    }
    const nextSkills = [...skills, trimmed];
    setSkills(nextSkills);
    notifyTagChange(interests, nextSkills);
    setSelectedSkill('');
  };

  // Handler to clear all skills and interests
  const handleClearAllTags = () => {
    // Optional: Confirm with user to prevent accidental clicks
    if (window.confirm('Are you sure you want to remove all interests and skills?')) {
      setInterests([]);
      setSkills([]);
      notifyTagChange([], []); // Update App.jsx immediately
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();

    const sanitizedName = name.trim() || fallbackProfile.name;
    const sanitizedStory = story.trim();
    onSave({
      ...profile,
      name: sanitizedName,
      email: email.trim() || fallbackProfile.email,
      password,
      story: sanitizedStory,
      // <-- UPDATED: Save the local tag state
      interests,
      skills,
    });
  };

  return (
    <section className="profile-shell">
      <header className="profile-hero">
        <p className="eyebrow">Profile</p>
        <h1>Keep your volunteering story up to date.</h1>
        <p>Tell organisations who you are, what you care about, and when you are free to help.</p>
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
                          className={`calendar-cell${cell.hasEvents ? ' calendar-cell--applied' : ''}${
                            cell.isSelected ? ' calendar-cell--active' : ''
                          }`}
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
                      ? `You are booked for ${upcomingTitle || 'your next volunteer shift'} on ${formattedAvailability}.`
                      : 'Confirmed volunteering dates will appear here.'}
                  </p>
                  {eventsThisMonth.length > 0 && (
                    <ul className="calendar-panel__list">
                      {eventsThisMonth.map((event) => (
                        <li key={`${event.id}-${event.date}`}>
                          <span className="calendar-panel__list-date">
                            {event.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="calendar-panel__list-title">{event.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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
          {/* --- NEW: Add the Interest Management Section --- */}
          <div className="tag-management-section">
            <span className="form-field-label">Your Interests</span>
            <p className="form-field-description">
              Tags from the AI quiz appear here. Click a tag to remove it, or pick more causes below.
            </p>
            <div className="tag-input-row">
              <select
                value={selectedInterest}
                onChange={(event) => setSelectedInterest(event.target.value)}
              >
                <option value="">Select an interest</option>
                {availableInterests.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
              <button type="button" className="tag-add-button" onClick={handleAddInterest} disabled={!selectedInterest}>
                Add
              </button>
            </div>
            <div className="tag-container">
              {interests.length > 0 ? (
                interests.map((interest) => (
                  <Tag
                    key={interest}
                    label={interest}
                    onRemove={() => handleRemoveInterest(interest)}
                  />
                ))
              ) : (
                <p className="empty-message">No interests saved. Try the AI quiz on the Discover page!</p>
              )}
            </div>
          </div>

          {/* --- NEW: Add the Skill Management Section --- */}
          <div className="tag-management-section">
            <span className="form-field-label">Your Skills</span>
            <p className="form-field-description">Click a tag to remove it, or choose more skills below.</p>
            <div className="tag-input-row">
              <select
                value={selectedSkill}
                onChange={(event) => setSelectedSkill(event.target.value)}
              >
                <option value="">Select a skill</option>
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              <button type="button" className="tag-add-button" onClick={handleAddSkill} disabled={!selectedSkill}>
                Add
              </button>
            </div>
            <div className="tag-container">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <Tag
                    key={skill}
                    label={skill}
                    onRemove={() => handleRemoveSkill(skill)}
                  />
                ))
              ) : (
                <p className="empty-message">No skills saved. Try the AI quiz on the Discover page!</p>
              )}
            </div>
          </div>
          {/* <-- NEW: Button Group for Actions */}
          <div className="form-actions">
            {/* <button type="submit" className="profile-save">
              Save profile
            </button> */}
            
            {/* Only show Clear button if there are actually tags to clear */}
            {(interests.length > 0 || skills.length > 0) && (
              <button 
                type="button" 
                className="profile-clear-all" 
                onClick={handleClearAllTags}
              >
                Clear all tags
              </button>
            )}
          </div>

          <button type="submit" className="profile-save">
            Save profile
          </button>
        </form>

      </div>
    </section>
  );
};

export default Profile;
