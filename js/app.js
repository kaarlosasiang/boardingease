// BoardingEase — Week 5 end state
//
// Same DOM code the class already has -- including its existing
// rough edges (see the Week 5 walkthrough doc for the full list).
// What changed: every piece of state and every business-logic
// function moved to model.js. app.js now only reads state.* and
// calls model.js's functions -- it never computes a cost or decides
// what "filtered" means anymore.

import {
  state,
  selectedListing,
  getCostBreakdown,
  setSearchTerm,
  setMaxRent,
  selectListing,
  setOccupants,
  toggleTransport,
} from "./model.js";

// ELEMENTS
const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");
const fieldInput = document.querySelector(".field__input");
const maxRentInput = document.querySelector("#max-rent");
const searchForm = document.querySelector("#search-form");
// NOT TOUCHED THIS WEEK: index.html has no #sharing-with element, so
// this is null and unused, same as before the extraction. View-layer
// cleanup is weeks 6-7's job, not this one.
const sharingWithInput = document.querySelector("#sharing-with");

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const markupGenerator = (listing) => {
  // Gi destructure nato dire ang object
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    estimatedUtilities,
    distanceToCampusKm,
    fareOneWay,
    amenities,
  } = listing;

  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag tag--utilities"
                      >Utilities extra</span
                    >`
    : `<span class="tag tag--utilities"
                      >No Utilities extra</span
                    >`;

  return `<li>
              <button
                class="card"
                type="button"
                data-id="${id}"
                aria-pressed="false"
              >
                <img
                  class="card__image"
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%23e8f2ee'/><path d='M20 62l18-20 14 16 10-10 14 14v10H20z' fill='%231e7a5f' opacity='.45'/><circle cx='64' cy='32' r='7' fill='%231e7a5f' opacity='.45'/></svg>"
                />
                <span>
                  <span class="card__name">${name}</span>
                  <span class="card__meta"
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to 4</span
                  >
                  <span class="card__rent">&#8369;${monthlyRent} / month</span>
                  <span class="tags"
                    >
                    ${utilitiesTag}</span
                  >
                </span>
              </button>
            </li>`;
};

const results = () => {
  if (state.filtered.length === 0) {
    resultsList.innerHTML = `<li class="empty">
              No listings match that search. Try a barangay name.
            </li>`;

    searchCount.textContent = "0 listings found";
  }

  resultsList.innerHTML = state.filtered.map(markupGenerator).join("");
};

const breakdownContent = () => {
  try {
    const breakdown = getCostBreakdown();
    if (!breakdown) return "";

    const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
      breakdown;

    return `
    <p class="breakdown__line">
      <span>Rent</span><span>${peso.format(rentPerHead)}</span>
    </p>
    <p class="breakdown__line">
      <span>Utilities</span><span>${peso.format(utilitiesPerHead)}</span>
    </p>
    <p class="breakdown__line">
      <span>Transport</span><span>${peso.format(transportPerHead)}</span>
    </p>
    <p class="breakdown__total">
      <span>Per person</span><span>${peso.format(totalPerHead)}</span>
    </p>
    `;
  } catch (err) {
    // model.js threw -- deciding what to show is our job at the call
    // site. app.js didn't have this catch before; adding it is the
    // natural side effect of routing this call through getCostBreakdown().
    return `<p class="error">${err.message}</p>`;
  }
};

const detailMarkUpGenerator = (listing) => {
  const { name, barangay, monthlyRent, maxOccupants } = listing;

  return `
   <h2 class="detail__name">${name}</h2>
          <p class="detail__where">${barangay} &middot; ${peso.format(monthlyRent)} / month</p>
  <fieldset class="splitter">
            <legend class="splitter__legend">Split the cost</legend>

            <div class="splitter__row">
              <label for="occupants-demo">Sharing with</label>
              <input
                class="field__input"
                type="number"
                id="occupants-demo"
                min="1"
                max="${maxOccupants}"
                value="${state.occupants}"
              />
            </div>

            <div class="splitter__row">
              <label for="transport-demo">Include daily fare</label>
              <input type="checkbox" id="transport-demo" ${state.includeTransport ? "checked" : ""} />
            </div>
          </fieldset>

          <div class="breakdown">
            ${breakdownContent()}
          </div>        
  `;
};

const renderDetail = () => {
  if (!state.selectedId) {
    detailsContainer.innerHTML = `<p class="detail__empty">Select a listing to see the cost breakdown.</p>`;
    return;
  }

  const listing = selectedListing();

  if (!listing) {
    detailsContainer.innerHTML = `<p class="error">That listing could not be found.</p>`;
    return;
  }

  detailsContainer.innerHTML = detailMarkUpGenerator(listing);
};

const updateBreakdown = () => {
  const breakdown = detailsContainer.querySelector(".breakdown");
  if (!breakdown) return;
  if (!selectedListing()) return;

  breakdown.innerHTML = breakdownContent();
};

// EVENT LISTENERS

resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  selectListing(card.dataset.id);
  if (!selectedListing()) return;

  results();
  renderDetail();
});

detailsContainer.addEventListener("input", (e) => {
  if (e.target.id === "occupants-demo") {
    setOccupants(e.target.value);
    updateBreakdown();
  }

  if (e.target.id === "transport-demo") {
    toggleTransport(e.target.checked);
    updateBreakdown();
  }
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

fieldInput.addEventListener("input", () => {
  setSearchTerm(fieldInput.value);
  results();
});

maxRentInput.addEventListener("input", () => {
  setMaxRent(maxRentInput.value);
  results();
});

results();
