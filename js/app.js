import * as model from "./model.js";
import searchView from "./searchView.js";

const resultsList = document.querySelector("#results-list");
const detailsContainer = document.querySelector("#detail-panel");

let selectedId = null;
let occupants = 1;
let includeTransport = false;

const SCHOOL_DAYS_PER_MONTH = 22;

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
  electricity + water + internet;

const calculateCostPerHead = (listing, people, withTransport) => {
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

const markupGenerator = (listing) => {
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    distanceToCampusKm,
  } = listing;

  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag">Utilities included</span>`
    : `<span class="tag tag--utilities">Utilities extra</span>`;

  return `<li>
              <button
                class="card"
                type="button"
                data-id="${id}"
                aria-pressed="${id === selectedId}"
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
                  <span class="card__meta">${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span>
                  <span class="card__rent">${peso.format(monthlyRent)} / month</span>
                  <span class="tags">${utilitiesTag}</span>
                </span>
              </button>
            </li>`;
};

const results = () => {
  searchView.updateCount(model.state.filtered.length);

  if (model.state.filtered.length === 0) {
    resultsList.innerHTML = `<li class="empty">No listings match that search.</li>`;
    return;
  }

  resultsList.innerHTML = model.state.filtered.map(markupGenerator).join("");
};

const breakdownContent = (listing) => {
  try {
    const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
      calculateCostPerHead(listing, occupants, includeTransport);

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
            </p>`;
  } catch (err) {
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
                value="${occupants}"
              />
            </div>

            <div class="splitter__row">
              <label for="transport-demo">Include daily fare</label>
              <input type="checkbox" id="transport-demo" ${
                includeTransport ? "checked" : ""
              } />
            </div>
          </fieldset>

          <div class="breakdown">${breakdownContent(listing)}</div>
  `;
};

const selectedListing = () =>
  model.state.listings.find((item) => item.id === selectedId);

const renderDetail = () => {
  if (!selectedId) {
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

  const listing = selectedListing();
  if (!listing) return;

  breakdown.innerHTML = breakdownContent(listing);
};

resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;

  selectedId = card.dataset.id;

  const listing = selectedListing();
  if (!listing) return;

  occupants = listing.maxOccupants;

  results();
  renderDetail();
});

detailsContainer.addEventListener("input", (event) => {
  if (event.target.id === "occupants-demo") {
    occupants = Number(event.target.value);
    updateBreakdown();
  }

  if (event.target.id === "transport-demo") {
    includeTransport = event.target.checked;
    updateBreakdown();
  }
});

/* ---------------------------------------------------------------
   SEARCH -- this is the part that's new.
   No more fieldInput.addEventListener down here. searchView reports
   what the user typed; these two functions tell the model to refilter,
   then tell the page to redraw. Same two-step shape you'll see again
   in every controller function from now on: change the model, then
   render from it.
   --------------------------------------------------------------- */

const controlSearch = (term) => {
  model.setSearchTerm(term);
  results();
};

const controlMaxRent = (value) => {
  model.setMaxRent(value);
  results();
};

searchView.addSearchHandler(controlSearch);
searchView.addMaxRentHandler(controlMaxRent);
searchView.addHandlerSubmit();

/* ---------------------------------------------------------------
   START
   --------------------------------------------------------------- */

results();
renderDetail();
