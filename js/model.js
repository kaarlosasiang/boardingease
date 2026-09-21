// BoardingEase — Model layer (Week 5)
//
// Extracted from app.js. State and every business-logic function move
// here; app.js keeps everything that touches `document`.
//
// The rule for this file: nothing in here may reference `document` or
// `window`. If a function needs the DOM, it doesn't belong here.

import { listings } from "./data.js";

/* ---------------------------------------------------------------
   STATE
   One object instead of six loose variables. Every mutator below is
   the only code allowed to reassign these fields -- app.js reads
   state.*, it never writes to it directly.
   --------------------------------------------------------------- */

export const state = {
  listings,
  filtered: listings,
  selectedId: null,
  occupants: 1,
  includeTransport: false,
  searchTerm: "",
  maxRent: "",
};

const SCHOOL_DAYS_PER_MONTH = 22;

/* ---------------------------------------------------------------
   THE RULE
   Pure: numbers in, numbers out. No DOM, no globals. Throws rather
   than returning an error, because it does not know whether its
   caller should render a message or send a 400.
   --------------------------------------------------------------- */

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
  electricity + water + internet;

// FOUND WHILE MOVING THIS: the version in app.js had a typo
// ("Number od occupants"), and totalPerHead was silently dropping
// transportPerHead -- the returned object even had a duplicate
// transportPerHead key. Fixed here. See the Week 5 walkthrough for
// how pulling this out is what made the bug visible.
export const calculateCostPerHead = (listing, people, withTransport) => {
  if (!Number.isInteger(people) || people < 1) {
    throw new Error("Number of occupants must be a whole number, at least 1.");
  }

  if (people > listing.maxOccupants) {
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants.`,
    );
  }

  const rentPerHead = listing.monthlyRent / people;

  const utilitiesPerHead = listing.utilitiesIncluded
    ? 0
    : sumUtilities(listing.estimatedUtilities) / people;

  const transportPerHead = withTransport
    ? listing.fareOneWay * 2 * SCHOOL_DAYS_PER_MONTH
    : 0;

  return {
    rentPerHead,
    utilitiesPerHead,
    transportPerHead,
    totalPerHead: rentPerHead + utilitiesPerHead + transportPerHead,
  };
};

/* ---------------------------------------------------------------
   DERIVED DATA
   --------------------------------------------------------------- */

export const selectedListing = () =>
  state.listings.find((item) => item.id === state.selectedId);

export const getCostBreakdown = () => {
  const listing = selectedListing();
  if (!listing) return null;

  return calculateCostPerHead(listing, state.occupants, state.includeTransport);
};

/* ---------------------------------------------------------------
   FILTERING
   app.js used to have one applyFilters() doing both jobs: reading
   two inputs AND recomputing the list. Split here: applyFilters()
   only recomputes, from whatever state already holds; the two
   mutators below are what change state, one per user action.
   --------------------------------------------------------------- */

const applyFilters = () => {
  const query = state.searchTerm.toLowerCase().trim();
  const maxRent = state.maxRent;

  state.filtered = state.listings.filter((listing) => {
    const matchesQuery =
      query === "" || listing.name.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });
};

/* ---------------------------------------------------------------
   MUTATORS
   Every state change in the app goes through one of these. None of
   them touch the DOM.
   --------------------------------------------------------------- */

export const setSearchTerm = (term) => {
  state.searchTerm = term;
  applyFilters();
};

export const setMaxRent = (value) => {
  state.maxRent = value;
  applyFilters();
};

export const selectListing = (id) => {
  state.selectedId = id;

  const listing = selectedListing();
  if (listing) state.occupants = listing.maxOccupants;
};

export const setOccupants = (value) => {
  state.occupants = Number(value);
};

export const toggleTransport = (checked) => {
  state.includeTransport = checked;
};
