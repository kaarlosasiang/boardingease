# Lecture (4MAT): Week‑5 review → `View.js` + `ResultsView.js`

> Instructor notes. **Don't commit this to a branch students pull.** It has the answers.
>
> - Diagram to project: `docs/mvc-diagram.html` (double-click it, or open it with Live Server). Key `0` shows the Overview (textbook MVC picture), keys `1` `2` `3` show the steps, and `←` `→` also switch.
> - Starting point: the code in `js/` as it is now. `View.js` and `ResultsView.js` are empty, ready for live-coding.
> - Finished code: `reference.js` in the repo root (gitignored), with one section per file (`View.js`, `ResultsView.js`, `app.js`, `model.js`).

## How this lesson follows 4MAT

4MAT moves through four questions. Each quadrant has two steps: one that engages feeling and intuition, and one that engages analysis and skill.

| Quadrant | Question | Step | What happens in class | Min |
|---|---|---|---|---|
| **1** | **Why?** | 1. Connect | **Bug hunt:** students use the week‑5 app and list what's broken | 10 |
| | | 2. Attend | Sort the bugs onto the MVC diagram and fix them live. *"Why do bugs pile up in `app.js`?"* | 20 |
| **2** | **What?** | 3. Image | Boarding-house analogy + Diagram Step 2 | 5 |
| | | 4. Inform | **You live-code** `View.js` and `ResultsView.js`: inheritance, overriding, publisher–subscriber | 30 |
| **3** | **How?** | 5. Practice | **Students** refactor `app.js` from a TODO skeleton, in pairs | 15 |
| | | 6. Extend | Students add amenity tags to the card on their own | 10 |
| **4** | **What if?** | 7. Refine | Run the test checklist, swap with another pair, and debug using the mistakes table | 7 |
| | | 8. Perform | Show one working app, preview the homework (Diagram Step 3), exit ticket | 8 |
| | | | **Total** | **~105** |

If you're short on time, cut **6. Extend** and assign it as homework instead.

---

# Quadrant 1: WHY? (Meaning)

**Goal:** students *feel* the problem before they hear the solution. Don't mention `View.js` yet.

## 1. Connect: Bug hunt (10 min)

Students open the week‑5 app with Live Server in pairs, keeping DevTools open. Put this on the board or screen and have them write down **anything that seems wrong**:

1. Search for `zzz`. What does the list show?
2. Search for the barangay `dahican`.
3. Look at **Marundan Student Residence**. Read its tag. Now check `utilitiesIncluded` in `data.js`.
4. Read the "up to …" text on several different cards.
5. Click a card. Can you tell which one is selected?
6. With a card selected, tick **Include daily fare**. Watch the **Per person** total.
7. Clear the **Sharing with** field, or type `9`. Check the console.
8. Select Casa Amihan, then search `seaview`, then change **Sharing with**.

Expect them to find most of the 8. Collect their answers on the board **by symptom** (not by line number yet).

## 2. Attend: Where do the bugs live? (20 min)

**Project Diagram Step 1.** For each symptom, ask *"Which lane is this code in? Which file?"* Put a mark next to each box as they answer. Nearly every mark lands on the **red boxes inside `app.js`**, which is view code sitting in the controller.

Then **fix them live, quickly**. This is the review part of the class:

| # | Symptom | Where | Fix |
|---|---|---|---|
| A1 | `zzz` shows a blank list | `app.js` `results()` | add `return;` inside the `if (… length === 0)`. The next line overwrote the message |
| A10 | `dahican` finds nothing | `model.js` `applyFilters` | also check `listing.barangay.toLowerCase().includes(query)`, and filter `state.listings` |
| A2 | Tag says "Utilities extra" when utilities *are* included | `app.js` `markupGenerator` | swap the ternary: `included ? "Utilities included" : "Utilities extra"` (the extra case gets class `tag--utilities`) |
| A5 | Every card says "up to 4" | `app.js` `markupGenerator` | `up to ${maxOccupants}` (the variable was already destructured) |
| A6 | Selected card never highlights | `app.js` markup + click handler | CSS styles `[aria-pressed="true"]`, but we always write `"false"`. **Leave it for step 4** (`markSelected`). For now, delete the pointless `results()` call in the click handler |
| A3 | Fare doesn't change the total | `app.js` `calculateCostPerHead` | `totalPerHead: rentPerHead + utilitiesPerHead + transportPerHead` and remove the **duplicate `transportPerHead` key** (the last one silently wins) |
| A9 | Empty occupants field → uncaught error, breakdown freezes | `app.js` `breakdownContent` | wrap it in `try { … } catch (err) { return \`<p class="error">${err.message}</p>\`; }`. Also fix the typo "Number **od**" → "of" (A4) |
| A8 | Breakdown freezes after the selected listing is filtered out | `app.js` `selectedListing` | search `model.state.listings`, not `filtered`. Looking something up by id needs the full list |
| A7 | *(found by reading)* unused selectors at the top | `app.js` lines 6–10 | delete `searchCount`, `fieldInput`, `maxRentInput`, `searchForm`, and `sharingWithInput` (`#sharing-with` doesn't exist, so it's `null`) |

**Close Quadrant 1 with the "why" question:**

> *"8 of these 9 bugs were in `app.js`, and most of them in HTML-building or DOM code. `app.js` is supposed to be the controller. Why do bugs pile up there?"*

Aim for: *it does too many jobs. Every job makes it longer, and a longer file makes bugs easier to hide.* Then remind them: `SearchView` already solved this for the search box. **Today we do the same for the results list.**

---

# Quadrant 2: WHAT? (Concepts)

**Goal:** give them a mental picture first, then the formal concepts, delivered through your live-coding.

## 3. Image: The boarding-house analogy (5 min)

Tell it before showing any code:

> Every boarding house in Mati uses the **same standard lease template**. It always has a *"clear the room"* clause, a *"hand over the keys"* clause, and a *"what to do if something goes wrong"* clause. But each house **fills in its own details**: the address, the room description, the house rules.
>
> - The template is **`View`** (the parent class).
> - Each house's filled-in lease is **`ResultsView`**, **`DetailView`**, and so on (child classes that `extends View`).
> - If a house needs a different "problem" clause, it **writes its own**. That's **overriding**.
>
> And the **caretaker** at the gate (the view) doesn't decide what happens when a tenant knocks. The caretaker just **calls the number the landlord left on move-in day** (`init()`). The landlord (the controller) decides. That's **publisher–subscriber**.

**Then project Diagram Step 2.** Point to `View.js`, the "extends" arrow, and `ResultsView.js`, and re-read **the 3 rules** at the bottom:
- The Model never touches the DOM.
- The View never imports the model.
- The Controller connects them.

## 4. Inform: Live-code `View.js` and `ResultsView.js` (30 min)

Type these in front of the class. Say each concept out loud when you reach the line that introduces it.

### 4a. `js/views/View.js`: the template (concept: shared behaviour in a parent class)

```js
// Parent class sa tanan views.
// Ang child class (e.g. ResultsView) mao ang mag-provide sa:
//   _parentElement, _errorMessage, ug _generateMarkup()
export default class View {
  _data;

  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _clear() {
    this._parentElement.innerHTML = "";
  }

  renderError(message = this._errorMessage) {
    const markup = `<p class="error">${message}</p>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}
```

Say out loud:
- **`export default class View`**: we export the *class* because we'll `extends` it, and we never `new View()`.
- **`this._parentElement` / `this._generateMarkup()` aren't defined here.** The template trusts each house to fill them in. Ask: *"What happens if a child forgets `_generateMarkup`?"* → `TypeError: this._generateMarkup is not a function`
- **`_underscore`** means private by convention.
- **The empty check in `render()` is bug A1, fixed once for every future view.** Connect it back to Quadrant 1.

### 4b. `js/views/ResultsView.js`: filling in the template (concept: `extends`, one instance)

Cut `markupGenerator` out of `app.js` and paste it in as a method, with the Quadrant 1 fixes already in:

```js
import View from "./View.js";

class ResultsView extends View {
  _parentElement = document.querySelector(".results__list");
  _errorMessage = "No listings match that search. Try a barangay name.";

  _generateMarkup() {
    return this._data
      .map((listing) => this._generateMarkupCard(listing))
      .join("");
  }

  _generateMarkupCard(listing) {
    const { id, name, barangay, monthlyRent, maxOccupants,
            utilitiesIncluded, distanceToCampusKm } = listing;

    const utilitiesTag = utilitiesIncluded
      ? `<span class="tag">Utilities included</span>`
      : `<span class="tag tag--utilities">Utilities extra</span>`;

    return `<li>
              <button class="card" type="button" data-id="${id}" aria-pressed="false">
                <img class="card__image" ... />
                <span>
                  <span class="card__name">${name}</span>
                  <span class="card__meta">${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span>
                  <span class="card__rent">&#8369;${monthlyRent} / month</span>
                  <span class="tags">${utilitiesTag}</span>
                </span>
              </button>
            </li>`;
  }
}

export default new ResultsView();
```

Say out loud:
- **`export default new ResultsView()`**: one instance, the same as `SearchView`.
- **The arrow in `.map((listing) => this._generateMarkupCard(listing))`** keeps `this`.

**Quick demo:** temporarily make `results()` in `app.js` call `resultsView.render(model.state.filtered);` and search `zzz`. A red `<p>` appears *inside the `<ul>`*, which is wrong. That sets up 4c.

### 4c. Overriding `renderError()` (concept: the child replaces a parent method)

"This house writes its own problem clause":

```js
  // Override: sa sulod sa <ul>, <li> dapat, dili <p>
  renderError(message = this._errorMessage) {
    const markup = `<li class="empty">${message}</li>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
```

Explain the lookup order: JavaScript checks **`ResultsView` first**, then `View`. The parent's `render()` calls `this.renderError()`, and `this` is the ResultsView instance, so the override wins. (Optional: `Object.getPrototypeOf(resultsView)` in the console.)

### 4d. The caretaker: `addSelectHandler` + `markSelected` (concept: publisher–subscriber, event delegation)

```js
  addSelectHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;

      handler(card.dataset.id);
    });
  }

  markSelected(id) {
    this._parentElement.querySelectorAll(".card").forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.id === id));
    });
  }
```

Say out loud:
- **The view knows *when*, the controller knows *what*.** The view never imports `app.js`.
- **Event delegation:** one listener on the `<ul>` still works after re-rendering.
- **`closest(".card")`**, because the click may land on the `<img>` or a `<span>`.
- **Pass only the id** (data), not the DOM element.
- **`markSelected` is bug A6, fixed.**
- **Compare it with `SearchView.addSearchHandler`.** It's the same shape.

**Stop typing here.** The `app.js` wiring is theirs to do next.

---

# Quadrant 3: HOW? (Practice)

**Goal:** students do the work. You walk around the room.

## 5. Practice: Refactor `app.js` in pairs (15 min)

Put this skeleton on screen. Pairs apply it to their own `app.js`:

```js
import * as model from "./model.js";
import searchView from "./views/SearchView.js";
// TODO 1: import resultsView

// TODO 2: DELETE resultsList, markupGenerator, results(),
//         the resultsList click listener, and unused selectors.
//         Keep: detailsContainer, state, detail-panel code.

// CONTROLLERS

const resultsController = () => {
  // TODO 3: update the count, render the filtered listings,
  //         then re-mark the selected card
};

const selectController = (id) => {
  // TODO 4: save selectedId, find the listing (guard!),
  //         set occupants, mark the card, render the detail
};

const searchController = (term) => {
  model.setSearchTerm(term);
  // TODO 5: call the right controller
};

const maxRentController = (value) => {
  model.setMaxRent(value);
  // TODO 5
};

const init = () => {
  // TODO 6: subscribe every handler, then do the first render
};

init();
```

<details><summary>Answer (reveal after ~12 min)</summary>

```js
import resultsView from "./views/ResultsView.js";

const resultsController = () => {
  searchView.renderCount(model.state.filtered.length);
  resultsView.render(model.state.filtered);
  resultsView.markSelected(selectedId);
};

const selectController = (id) => {
  selectedId = id;

  const listing = selectedListing();
  if (!listing) return;

  occupants = listing.maxOccupants;

  resultsView.markSelected(selectedId);
  renderDetail();
};

const searchController = (term) => {
  model.setSearchTerm(term);
  resultsController();
};

const maxRentController = (value) => {
  model.setMaxRent(value);
  resultsController();
};

const init = () => {
  searchView.addSearchHandler(searchController);
  searchView.addMaxRentHandler(maxRentController);
  searchView.addFormHandler();
  resultsView.addSelectHandler(selectController);
  resultsController();
};

init();
```
</details>

Questions to ask while you walk around:
- *"Why does `resultsController` call `markSelected` after `render`?"* Because `render` rebuilds every card with `aria-pressed="false"`.
- *"Where do you see `querySelector` in `app.js` now?"* Only `detailsContainer` is left, and that one is next week's.

## 6. Extend: Amenity tags, on their own (10 min)

Every listing has `amenities: ["Wi-Fi ready", "Kitchen", ...]`, but the cards don't show them. **Task:** add one tag per amenity next to the utilities tag. **Rule:** only `ResultsView.js` may change. If a student touches `app.js` or `model.js`, ask them *why* they felt they had to.

<details><summary>One solution</summary>

```js
  _generateMarkupTags(amenities) {
    return amenities
      .map((amenity) => `<span class="tag">${amenity}</span>`)
      .join("");
  }

  // in _generateMarkupCard: add `amenities` to the destructuring, then
  // <span class="tags">${utilitiesTag}${this._generateMarkupTags(amenities)}</span>
```
</details>

This is the moment the lesson pays off: *a new feature in the results list touched **one file**, and the controller didn't change.*

---

# Quadrant 4: WHAT IF? (Application)

**Goal:** students check their own work, then look ahead.

## 7. Refine: Test, swap, debug (7 min)

Each pair runs the checklist on **another pair's** laptop:

- [ ] Page loads and shows "12 listings" with all 12 cards
- [ ] `casa` filters the list, and the count updates
- [ ] `dahican` (barangay) shows 2 listings
- [ ] Max rent `5000` shows 4 listings
- [ ] `zzz` shows the grey dashed "No listings match…" box, **not** red
- [ ] Clicking a card highlights it (green border) and shows the detail
- [ ] Casa Amihan, 4 people: ₱2,363. With the daily fare ticked: ₱3,023
- [ ] Clearing **Sharing with** shows a message, and the console stays clean
- [ ] Select a card, search it away, clear the search: it's still highlighted
- [ ] The console has no errors

If something fails, check this table first:

| Symptom | Cause |
|---|---|
| `Failed to load module script` / 404 on import | Missing `.js` in the import path |
| Works locally, breaks on GitHub Pages | Filename case: `searchView.js` vs `SearchView.js` |
| `Cannot use import statement outside a module` / CORS | Opened with `file://`. Use Live Server |
| `resultsView.render is not a function` | Exported the class instead of `new ResultsView()` |
| `does not provide an export named 'default'` | Missing `export default` in `View.js` |
| `Cannot read properties of undefined (reading '_generateMarkupCard')` | `function (listing) { this… }` inside `.map`. Use an arrow function |
| `ReferenceError: View is not defined` | Missing `import View from "./View.js"` |
| Nothing renders, no error | Forgot to call `init()` |

## 8. Perform: Show, look ahead, exit ticket (8 min)

1. **Show (3 min):** one pair projects their working app and walks through **one click** using the 4-step flow on the diagram (user → view → controller → model → view).
2. **Look ahead:** project **Diagram Step 3**. *"What if the detail panel followed the same template?"* That's the homework:
   - `js/views/DetailView.js extends View`: `_parentElement = .detail`, `_generateMarkup()` built from `detailMarkUpGenerator` + `breakdownContent`, `updateBreakdown(data)`, `addOccupantsHandler(handler)`, `addTransportHandler(handler)`
   - Move `selectedId`, `occupants`, `includeTransport`, and `calculateCostPerHead` into `model.js` (`setSelected`, `setOccupants`, `setTransport`)
   - Done when `app.js` has **no** `querySelector`, **no** HTML strings, and **no** `addEventListener`
3. **Exit ticket** (on paper, one sentence each):
   - *Why* did we make a parent `View`?
   - *What* does `extends` give `ResultsView` for free?
   - *What if* `calculateCostPerHead` throws: who should catch it, and who shows the message? *(The controller catches it and calls `detailView.renderError(err.message)`.)*

---

## Files after this lecture

```
js/
├── app.js              controllers + init()   (detail panel still here → next week)
├── data.js             listings
├── model.js            state + applyFilters, setSearchTerm, setMaxRent
└── views/
    ├── View.js         NEW: parent: render, _clear, renderError
    ├── ResultsView.js  NEW: extends View: list, empty state, card click, highlight
    └── SearchView.js   unchanged
```
