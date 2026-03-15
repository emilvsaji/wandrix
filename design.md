# Wandrix UI/UX Design Documentation

_Last updated: March 15, 2026_

## 1) Product Experience Summary

Wandrix is a dark-themed AI travel planning web app focused on three primary user jobs:
- Discover destinations
- Compare two destinations with preference-based AI scoring
- Generate and review day-by-day itinerary plans

Secondary journeys include authentication, wishlist management, user profile/dashboard management, and admin controls.

The overall visual direction is **modern, minimal, and data-card oriented**, using compact typography, soft borders, rounded corners, and subtle motion.

---

## 2) Information Architecture & Navigation

## Top-level routes
- `/` and `/home` → Home (hero landing)
- `/compare` → destination comparison form + result
- `/itinerary` → alias route to compare flow
- `/explore` → destination discovery + detail modal
- `/wishlist` → saved destinations
- `/profile` → user dashboard
- `/login`, `/register` → auth
- `/admin` → admin dashboard (admin users only)

## Global shell
- Sticky top header (64px height)
- Main content area
- Multi-column footer with quick links
- Startup loading overlay at app launch

## Header behavior
- Brand click returns to Home
- Primary nav buttons: Home, Compare, Journey Schedule, Explore, Wishlist, and Admin (admin only)
- Active nav item has filled dark state
- Auth-aware right action:
  - Signed out: `Sign In`
  - Signed in: `Profile` + hover dropdown (`Logout`)
- Mobile (<768px):
  - hamburger toggle
  - nav collapses into slide-down stacked menu
  - right-side auth actions hidden in header row

---

## 3) Visual Design System

## Typography
- Font family: `Inter` (Google Fonts), with system sans fallbacks
- Style: medium-weight headings, compact uppercase labels for metadata
- Body typography favors 0.8125rem–1rem ranges for dense UI cards

## Color palette (dark-first)
- Background hierarchy:
  - Base: `#0a0a0b`
  - Elevated: `#111113`
  - Card: `#18181b`
- Borders:
  - Base: `#27272a`
  - Light: `#3f3f46`
- Text:
  - Primary: `#fafafa`
  - Secondary: `#a1a1aa`
  - Muted: `#71717a`
- Accent:
  - Primary blue: `#3b82f6`
  - Hover blue: `#2563eb`
  - Muted accent wash: `rgba(59,130,246,0.1)`
- Status:
  - Success `#22c55e`, warning `#eab308`, error `#ef4444`

## Spacing / radius tokens
- Spacing scale from `--space-xs (0.25rem)` to `--space-3xl (4rem)`
- Radius scale from `6px` to `16px`
- Components consistently use `md/lg/xl` radius for cards and controls

## Surfaces and depth
- Depth is subtle:
  - 1px borders for structure
  - light shadows on hover/cards
  - glass-like overlays in specific areas (wishlist button overlays, modal controls)

---

## 4) Motion, Transitions, and Perceived Performance

## Startup loading
- Fullscreen black/white startup overlay with centered `WANDRIX`
- Pill-style progress text (`Loading X%`), blinking cursor effect, thin progress track
- Progress is currently time-driven from 0 to 100 over ~3 seconds
- After reaching 100%, loader unmounts and main app is revealed

## Micro-interactions
- Button hover color shifts (accent or border emphasis)
- Card hover elevation/translate on destination tiles and dashboard cards
- Progress bars animate width on comparison cards
- Spinner animations for loading states (explore modal, compare submission/generation)
- Dropdown reveal and mobile nav slide transitions

## Background effects
- Home: lazily loaded `LightPillar` WebGL visual, blended into hero backdrop
- Compare page: `LightRays` animated lighting effect behind content
- Both are non-blocking visual layers under content

---

## 5) Core Page UX Breakdown

## 5.1 Home (`/`)
Purpose: fast value proposition and first action.

UI structure:
- Eyebrow text (`AI-Powered Travel Planning`)
- Large centered headline + supporting paragraph
- 3 feature chips with icon
- 2 CTAs:
  - Primary: `Start Comparing`
  - Secondary: `Explore Destinations`

UX notes:
- Hero is center-aligned and concise
- CTA hierarchy is clear and action-first
- Background effect adds premium feel without adding input complexity

## 5.2 Compare (`/compare`)
Purpose: preference-based decision support between two destinations.

Form phase:
- Two destination inputs with suggestion dropdown + quick chips
- `VS` middle badge
- Preferences form sections:
  - budget cards
  - trip duration stepper
  - multi-select interest chips
  - season cards
  - travel type cards
- Single submit CTA: `Get AI Recommendation`

Result phase:
- Side-by-side destination cards with image, total score (/60), category score bars
- Pros/cons, cost/time metadata, highlights chips
- Winner marked with `Recommended` badge
- Recommendation section includes reasoning + key deciding factors
- Winner card shows `Generate Itinerary`

Itinerary generation state:
- Fullscreen dim overlay with spinner and progress message while generating

UX notes:
- Flow is clear and linear: form → compare → itinerary
- Error handling shown inline on result view when API fails
- Requires user auth for compare calls (explicit message shown)

## 5.3 Explore (`/explore`)
Purpose: browse and inspect destinations deeply.

Top area:
- Search field with leading icon + conditional submit arrow
- Search hints for no direct match
- Database-backed popular destinations with fallback local list

Discovery area:
- Search result card for custom queries
- Popular/matching destination grid
- Card hover scaling + heart wishlist action

Details modal:
- Large modal with image hero + close button
- Sectioned long-form details:
  - description, category/location chips
  - map embed (OpenStreetMap) when coordinates exist
  - gallery grid
  - highlights / attractions / things to do
  - best season/weather
  - transport and accommodation cards
  - food tags, travel tips, nearby places
  - 1-day and 2-day itinerary blocks
- Footer actions:
  - wishlist toggle button
  - compare selected destination

UX notes:
- Strong content depth with progressive disclosure via modal
- Supports unknown destinations via custom search path
- Modal click-outside closes; body content remains scannable through section chunks

## 5.4 Wishlist (`/wishlist`)
Purpose: saved destination management.

States:
- Signed out state prompt
- Loading state text
- Empty state card with icon + guidance
- Filled grid of cards with image, metadata, actions

Actions per card:
- `Compare` shortcut action
- Remove icon button
- Added date when available

UX notes:
- Practical utility page with clear state handling
- Consistent card language with Explore page

## 5.5 Auth (`/login`, `/register`)
Purpose: account access and creation.

Design:
- Centered single card layout
- Clear title/subtitle
- Labeled input fields
- Inline error alert block
- Submit button with loading text
- Footer text action to switch login/register

Validation/behavior:
- Register validates password confirmation and minimum length
- Login/register redirects to home on success

UX notes:
- Conventional, low-friction forms
- Minimal distractions and strong readability

## 5.6 Profile (`/profile`)
Purpose: personal dashboard and account management.

Top card:
- Avatar with pulse effect
- Name/email/member-since badge
- `Edit Profile` and `Log Out` actions

Dashboard grid:
- Account info card
- Travel stats card (with skeleton loaders while fetching)
- Quick actions card linking to key workflows

Edit profile modal:
- Name + avatar URL + image upload input (size/type validation)
- Live avatar preview
- Success/error feedback and save/cancel actions

UX notes:
- More “SaaS dashboard” style than other pages
- Good use of card segmentation and quick actions

## 5.7 Admin (`/admin`)
Purpose: user and platform administration.

Access states:
- Signed-out and non-admin blocked views
- Loading dashboard state

Dashboard:
- Metrics cards (users/admins/comparisons/itineraries)
- Two-column panel:
  - user list panel with search and badge-rich rows
  - selected user activity panel

User row actions:
- View activity
- Toggle admin role
- Delete user
- Block/unblock with optional reason
- Reset password

UX notes:
- Dense but practical control surface
- Action granularity is high, mostly command-style buttons

---

## 6) Footer UX

- Structured into brand + 3 navigation columns
- Includes legal links and copyright row
- Footer links for internal routes are click-handled in app shell
- Responsive collapse to centered stacked layout on mobile

---

## 7) Responsive Behavior

Common responsive pattern:
- Desktop-first with breakpoint overrides at ~768px and nearby sizes
- Grids collapse to one column on mobile
- CTA groups stack vertically on smaller viewports
- Header shifts from horizontal nav to toggle menu
- Modal/detail sub-grids become single-column for readability

Overall outcome:
- Mobile readability is generally strong
- Interactions remain touch-friendly due to preserved control sizes

---

## 8) Feedback, States, and Error UX

Implemented feedback patterns:
- Spinners for async load/analysis/generation
- Empty-state cards with iconography and helper text
- Error banners/inline error blocks in auth/profile/admin/compare/explore
- Disabled button styles while loading
- Success messaging in profile edit flow

Design consistency:
- Most states use same dark card + border + muted text language
- Critical actions and errors are red-tinted

---

## 9) Accessibility Snapshot (Current)

Strengths:
- Semantic buttons and form labels in most places
- Inputs have visible focus-border states
- Loading overlay uses `role="status"` and `aria-live="polite"`
- Large enough contrast in primary dark scheme for most text

Known gaps/opportunities:
- Some interactions rely on `alert/confirm/prompt` browser dialogs (admin/explore auth prompt)
- Dropdown/profile hover behavior may be harder on touch-only devices
- Keyboard focus and skip-navigation patterns are limited
- Some color tokens in CSS reference undefined vars (`--color-primary`, `--color-bg-hover`, `--color-border-hover`) and rely on fallback or default rendering

---

## 10) UX Cohesion & Brand Character

Current brand character:
- Dark, technical, travel-tech aesthetic
- High signal-to-noise layout with utility-first cards
- Accent blue as interaction color, occasional gradient/effect moments for premium feel

Cohesion assessment:
- Strong consistency across compare/explore/auth/wishlist
- Profile page style is intentionally richer and slightly different (dashboard polish)
- Startup loader now aligns with the monochrome premium opening style and transitions into the app experience

---

## 11) End-to-End User Journeys (Current)

## Primary journey A: Discover → Compare
1. Open app (startup loader)
2. Use Home CTA or header to navigate to Explore/Compare
3. Find destination in Explore (or custom search)
4. Open details, then `Compare This Destination`
5. Fill preferences and run AI compare
6. Review winner and optionally generate itinerary

## Primary journey B: Save and revisit
1. Sign in/register
2. Add destinations to wishlist from Explore cards/modal
3. Visit Wishlist for quick compare relaunch
4. View profile stats and quick actions

## Admin journey
1. Sign in as admin
2. Open Admin dashboard
3. Filter users, inspect activity, and run moderation/account actions

---

## 12) File Sources for This Documentation

This document is based on the current implementation in:
- `frontend/src/index.css`
- `frontend/src/App.jsx`, `frontend/src/App.css`
- `frontend/src/components/*` (Header, LoadingScreen, DestinationInput, PreferencesForm, ComparisonResult, ItineraryView, LightPillar, LightRays)
- `frontend/src/pages/*` (Home, Explore, Compare, Wishlist, Login, Register, Profile, Admin)
- `frontend/src/context/StartupLoadingContext.jsx`

It describes the **current shipped UI/UX behavior** rather than proposed redesign ideas.
