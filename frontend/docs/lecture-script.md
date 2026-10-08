# Sample session: how I'd deliver it

> A worked example of the 4MAT lesson in `lecture-views.md`, written as a run-sheet: what to **say**, what to **do**, what students will probably **answer**, and **every piece of code you type**, in the order you type it.
> Treat the lines under **SAY** as a model, not something to read word for word. Switch to Bisaya wherever it feels natural for your class.
>
> **Key:** **SAY**: your words · **DO**: your action · **TYPE**: code to type · **S:** likely student answers · **⚠** contingency · **⏱** time check
>
> Line numbers refer to the **week‑5 starting** `app.js`. They'll shift as you edit, so search by function name.
> The complete finished files are in the [Appendix](#appendix-final-files-check-your-screen-against-these).

---

## Before class (15 min before)

**DO:**
1. `git status`: the working tree should show `View.js` and `ResultsView.js` **empty** and `app.js` with the week‑5 bugs still in place.
2. Open three things, one per window or tab:
   - **VS Code** with `js/app.js` open, font zoomed to about 150% (`Cmd +` two or three times)
   - **Browser**: the app via Live Server, DevTools open on the **Console** tab
   - **Browser**: `docs/mvc-diagram.html` on the **Overview** tab
3. Keep this script and `reference.js` open on **your own laptop screen only** (not the projector).
4. Write this on the board, and leave it up the whole class:

```
TODAY
  WHY?      Why does app.js keep breaking?
  WHAT?     View.js + ResultsView.js
  HOW?      You refactor app.js
  WHAT IF?  The detail panel next
```

---

# Quadrant 1: WHY? (0:00–0:30)

## 1. Connect: Bug hunt (0:00–0:10)

**SAY:**
> "Good morning. Before I teach you anything today, I need your help. I got a message from a 'client'. They say BoardingEase is *broken*, but they didn't say where. You're QA testers today. Pair up with the person beside you. One of you drives the keyboard and the other one writes."

**DO:** Put the 8 prompts on screen:

1. Search for `zzz`. What does the list show?
2. Search for the barangay `dahican`.
3. Look at **Marundan Student Residence**. Read its tag. Now check `utilitiesIncluded` in `data.js`.
4. Read the "up to …" text on several different cards.
5. Click a card. Can you tell which one is selected?
6. With a card selected, tick **Include daily fare**. Watch the **Per person** total.
7. Clear the **Sharing with** field, or type `9`. Check the console.
8. Select Casa Amihan, then search `seaview`, then change **Sharing with**.

**SAY:**
> "Eight minutes. Go through all eight, and write down **what you expected** and **what actually happened**. Keep the console open. Red text in the console counts as a bug too. Don't fix anything yet. Just find them."

**DO:** Start a visible 8-minute timer. Walk around the room. **Don't give hints.** If a pair is stuck on the first prompt, point at the next one.

⚠ **If a pair finishes early:** *"Open `app.js` and find a bug that isn't on the list."* (They'll usually find the unused selectors at the top, or the duplicate `transportPerHead` key.)

**At 0:08, SAY:**
> "Pens down. Let's collect them. I'll write, you talk. Just the *symptom*, not the line number."

**DO:** Write the symptoms on the board as they call them out. You'll typically get:

- S: "`zzz` just shows nothing. It doesn't say 'no results'."
- S: "Dahican shows zero, but there are houses in Dahican."
- S: "Marundan says 'Utilities extra', but in `data.js` it's `utilitiesIncluded: true`."
- S: "Every card says 'up to 4'."
- S: "When I click a card, nothing highlights."
- S: "The fare changes, but the total doesn't."
- S: "When I delete the number of people, there's a red error in the console."

⚠ **If nobody found #8** (the frozen breakdown after filtering), demo it yourself: select Casa Amihan, search `seaview`, then change **Sharing with**. *"See? It just stopped working. There's no error. That's the worst kind of bug."*

## 2. Attend: Where do the bugs live? (0:10–0:30)

**DO:** Switch to the diagram, **Overview** tab (key `0`).

**SAY:**
> "You've probably seen this picture online. It's MVC, the way most tutorials draw it. The **Model** handles the data and rules, and it talks to the database. For us, the 'database' is just `data.js`. The **View** handles what you see. The **Controller** sits in the middle and handles the flow. Notice what it *never* does: no data logic, and no HTML."
>
> "One catch." **DO:** Point at the yellow note under the diagram. "This picture is drawn for a server. In our app everything runs in the browser, so when you click, the click lands on a **View** first, and the view calls the controller. Keep that in mind, because it's exactly what `addSearchHandler` does."

**DO:** Switch to **Step 1** (key `1`).

**SAY:**
> "Now here's *our* app on the same map, file by file. Three lanes: View, Controller, Model. Let's play a game. For each bug on the board, tell me which *box* it's in."

**DO:** Point at the first symptom, *"`zzz` shows nothing"*, and ask: *"What code draws the list?"*

- S: "`results()`?"

**SAY:**
> "Which file is `results()` in?"
- S: "`app.js`."
> "And which lane is `app.js`?"
- S: "…Controller."
> "But drawing a list. Is that a controller's job?"
- S: "No, that's View."

**DO:** Put a tally mark next to the red **"View code: results list"** box. Repeat quickly for the rest, and let the class answer:

| Symptom | Box they should point to |
|---|---|
| `zzz`, the tag, "up to 4", no highlight | View code: results list |
| Total ignores the fare, error when field is empty | Model code: state + logic (`calculateCostPerHead`) |
| Breakdown freezes after filtering | View code: detail panel (`selectedListing`) |
| Dahican finds nothing | `model.js` |

**SAY** (pause and let it land):
> "Look at the tally marks. **Eight of nine** bugs are in `app.js`, and `app.js` is supposed to be *just* the controller. So why do bugs pile up there?"

**DO:** Wait. Count to five in your head. Don't answer it for them.

- S: "Because it's long?"
- S: "Because it does everything?"

**SAY:**
> "Exactly. `app.js` has too many jobs. Every job makes it longer, and the longer it gets, the easier it is for a bug to hide. Remember last week? We already fixed this problem for *one* part of the page. Which part?"
- S: "The search, `SearchView`."
> "Right. Today we do the same for the results list. But first, let's fix these bugs so we start clean."

### Live fixes (≈15 min)

**DO:** Switch to VS Code. For each fix: **show the bug in the browser → go to the line → ask the class for the fix → type it → show that it's fixed.** Keep it moving, about 90 seconds each.

#### Fix 1 (A1): the empty message gets overwritten, in `app.js` `results()` (around line 108)

**SAY:** *"Read these two lines out loud with me: if it's empty, set the empty message… and then the next line sets `innerHTML` again. What happened to our message?"*
S: *"It got replaced."*

**TYPE:** add the `return;` (a single line):
```js
const results = () => {
  searchView.renderCount(model.state.filtered.length);

  if (model.state.filtered.length === 0) {
    resultsList.innerHTML = `<li class="empty">
              No listings match that search. Try a barangay name.
            </li>`;
    return; // ← TYPE THIS
  }

  resultsList.innerHTML = model.state.filtered.map(markupGenerator).join("");
};
```
**DO:** Search `zzz` to show the message appears.
**SAY:** *"This is called a guard clause. Remember it, because in 30 minutes we'll write it once so it works for **every** view."*

#### Fix 2 (A10): search ignores barangay, in `model.js` `applyFilters`

**TYPE:** change `listings.filter` to `state.listings.filter`, and add the barangay line:
```js
export const applyFilters = () => {
  const query = state.searchTerm.toLowerCase().trim();
  const maxRent = state.maxRent;

  state.filtered = state.listings.filter((listing) => {
    const matchesQuery =
      query === "" ||
      listing.name.toLowerCase().includes(query) ||
      listing.barangay.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });
};
```
**DO:** Search `dahican` and you get 2 results.
**SAY:** *"And `state.listings` instead of the imported `listings`: the model should read its own state."*

#### Fix 3 (A2): the utilities tag is backwards, in `app.js` `markupGenerator` (around line 70)

**SAY:** *"Quick quiz: in `a ? b : c`, when does `b` run?"*
S: *"When `a` is true."*
**SAY:** *"So when `utilitiesIncluded` is true, we show…?"*
S: *"'Utilities extra'. Oh, it's backwards."*

**TYPE:** replace the whole `utilitiesTag`:
```js
  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag">Utilities included</span>`
    : `<span class="tag tag--utilities">Utilities extra</span>`;
```

#### Fix 4 (A5): "up to 4", in `app.js` `markupGenerator` (around line 96)

**SAY:** *"`maxOccupants` is already destructured on line 62. We just never used it."*

**TYPE:** replace the `4`:
```js
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span
```

#### Fix 5 (A6): no highlight, in the `resultsList` click listener (around line 204)

**DO:** Open `main.css` and show `.card[aria-pressed="true"]`.
**SAY:** *"The CSS is ready. We just never set `aria-pressed` to true. **Hold that thought.** We'll fix it properly later today, inside the new view. For now, look at this line: it re-draws all 12 cards on every click, for nothing."*

**TYPE:** delete `results();`:
```js
resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  selectedId = card.dataset.id;

  const listing = selectedListing();
  if (!listing) return;

  occupants = listing.maxOccupants;

  // results();   ← DELETE THIS LINE
  renderDetail();
});
```

#### Fix 6 (A3): the total ignores the fare, in `app.js` `calculateCostPerHead` (around line 46)

**SAY:** *"Count the keys in this object."*
S: *"`transportPerHead` is there twice."*
**SAY:** *"Does JavaScript complain?"* **DO:** Show that it doesn't. **SAY:** *"No. The last one silently wins. And look at `totalPerHead`: what's missing?"*

**TYPE:** the fixed `return`:
```js
  return {
    rentPerHead,
    utilitiesPerHead,
    transportPerHead,
    totalPerHead: rentPerHead + utilitiesPerHead + transportPerHead,
  };
```
**DO:** Tick the fare checkbox. The total changes now (Casa Amihan, 4 people: ₱2,363 → ₱3,023).

#### Fix 7 (A9 + A4): error when the field is empty, in `app.js` `breakdownContent` (around line 120), plus the typo on line 30

**TYPE:** the typo on line 30:
```js
    throw new Error("Number of occupants must be a whole number, at least 1.");
```
**TYPE:** wrap `breakdownContent` in `try/catch`:
```js
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
    </p>
    `;
  } catch (err) {
    return `<p class="error">${err.message}</p>`;
  }
};
```
**DO:** Clear **Sharing with**. The message shows in the panel, and the console stays clean.
**SAY:** *"Throwing an error is fine. But **someone** has to catch it, and then show the user a message instead of a red console."*

#### Fix 8 (A8): frozen breakdown after filtering, in `app.js` `selectedListing` (around line 173)

**TYPE:**
```js
const selectedListing = () =>
  model.state.listings.find((listing) => listing.id === selectedId);
```
**SAY:** *"`filtered` is what's **visible**. When you look up a listing by its id, you want **all** of them."*

#### Fix 9 (A7): dead selectors, at the top of `app.js` (lines 4–10)

**TYPE:** delete five lines, so the top becomes:
```js
import * as model from "./model.js";
import searchView from "./views/SearchView.js";
// ELEMENTS
const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
```
**SAY:** *"`SearchView` owns the search elements now. Once a view owns an element, nobody else should grab it with `querySelector`. And `#sharing-with` doesn't even exist in the HTML. That variable was `null` the whole time."*

**DO (recommended checkpoint):**
```bash
git add js && git commit -m "Week 5 review fixes" && git push
```
Use `git add js` rather than `commit -am`: `-a` skips the untracked `js/views/SearchView.js`, and the pushed code would break.
**SAY:** *"If you fell behind, pull now. Everyone starts Part 2 from the same code."*

⏱ **0:30.** If you're behind, skip Fixes 7–9 live: show them, then say *"these are in the notes."*

---

# Quadrant 2: WHAT? (0:30–1:05)

## 3. Image: The boarding-house analogy (0:30–0:35)

**DO:** Close VS Code. **No code on screen** for this part.

**SAY:**
> "Question. How many of you are boarding right now? *(hands)* When you moved in, did you sign something?"
- S: "A contract. A lease."
> "Does every boarding house in Mati write its contract from scratch?"
- S: "No, they use a template."
> "Right. There's a standard lease. It always has the same clauses: *clear out the room*, *hand over the keys*, *what to do if something goes wrong*. But each house **fills in its own details**: the address, the room, the rules. And if one house has a different 'something goes wrong' rule, it writes **its own** clause instead."

**DO:** Draw this on the board:

```
        Standard lease  (View)
        - clear the room
        - hand over keys
        - if something goes wrong
              ▲ extends
     ┌────────┴────────┐
 Casa Amihan       Seaview Dorm
 (ResultsView)     (DetailView, next week)
 - address         - address
 - room details    - room details
 - own "wrong" rule
```

**SAY:**
> "One more person: the **caretaker** at the gate. When a tenant knocks at 11 PM, does the caretaker decide what to do?"
- S: "No, they call the landlord."
> "Using what number?"
- S: "The one the landlord left."
> "When did the landlord leave that number?"
- S: "On move-in day."
> "That's **exactly** how our views talk to the controller. The view is the caretaker. The controller is the landlord. And move-in day is a function called `init()`."

**DO:** Switch to the diagram, **Step 2**. Point at `View.js` → the "extends" arrow → `ResultsView.js`.

**SAY:**
> "Same picture, in code. And these three rules at the bottom are the whole contract. Read them with me."

**DO:** Have the class read the 3 rules aloud.

## 4. Inform: Live-code (0:35–1:05)

**SAY:**
> "I'm going to type. You watch **first**. Don't type along yet, because your turn comes in 30 minutes. Ask me anything, anytime."

### 4a. `js/views/View.js` (0:35–0:45)

**DO:** Open the empty `js/views/View.js`. Type it **slowly**, in these six steps, narrating as you go.

**TYPE, step 1:** the empty class.
```js
export default class View {}
```
**SAY:** *"We export the **class** itself, not `new View()`. We'll never use a plain View. It's the template. We only **extend** it."*

> 💬 **If someone asks why SearchView exports `new` but this doesn't:**
> *"A class is a blueprint, and `new` builds the actual thing. If another file will **extend** it, export the class. If another file will just **use** it, export `new`. You can build many houses from a blueprint, but you can't build a house from a house."*

**TYPE, step 2:** the data field, inside the class.
```js
export default class View {
  _data;
}
```
**SAY:** *"The underscore means 'private, don't touch this from outside'. It's a convention, not a rule."*

**TYPE, step 3:** "clear the room".
```js
  _clear() {
    this._parentElement.innerHTML = "";
  }
```

**TYPE, step 4:** `render`. Type **only these lines first**:
```js
  render(data) {
    this._data = data;
    const markup = this._generateMarkup();

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
```
**SAY:** *"Wait. `this._parentElement`. Where is it defined?"*
S: *"…It isn't?"*
**SAY:** *"Correct. And `_generateMarkup`?"*
S: *"Not there either."*
**SAY:** *"The template **trusts** each house to fill those in. That's the deal: every child must provide `_parentElement` and `_generateMarkup`. Let's write that down so nobody forgets."*

**TYPE:** the comment at the very top of the file.
```js
// Parent class sa tanan views.
// Ang child class (e.g. ResultsView) mao ang mag-provide sa:
//   _parentElement, _errorMessage, ug _generateMarkup()
```

**TYPE, step 5:** the guard, as the **first lines inside `render`**.
```js
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
```
**SAY:** *"Look familiar? It's the bug from 20 minutes ago, Fix 1. We fixed it **once**, here, for every view we'll ever write."*

**TYPE, step 6:** `renderError`, after `render`.
```js
  renderError(message = this._errorMessage) {
    const markup = `<p class="error">${message}</p>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
```
**SAY:** *"A default parameter. If you don't pass a message, it uses the house's own message."*

**✔ `View.js` should now look exactly like this:**
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
⚠ **Typos to watch for on screen:** `insertAdjacentHTML` (easy to type `insertAdajacentHTML`), and `_clear()` left empty.

✅ **Check for understanding:** *"Without looking: name the two things every child **must** give the View."* (`_parentElement`, `_generateMarkup`.) Call on someone who hasn't spoken yet.

### 4b. `js/views/ResultsView.js` (0:45–0:55)

**DO:** Open the empty `js/views/ResultsView.js`.

**TYPE, step 1:** the import, **leaving off `.js` on purpose** (it's the planned mistake).
```js
import View from "./View";
```

**TYPE, step 2:** the class shell.
```js
class ResultsView extends View {
  _parentElement = document.querySelector(".results__list");
  _errorMessage = "No listings match that search. Try a barangay name.";
}

export default new ResultsView();
```
**SAY:** *"This time we export **`new`**, meaning one ready-made object, exactly like `SearchView`. There's only one results list on the page, so there's only one ResultsView. `app.js` never has to write `new`."*

**TYPE, step 3:** move the card markup in. **Cut** `markupGenerator` out of `app.js` (Cmd‑X, so the class sees it disappear). Paste it inside the class and turn it into a method: remove `const markupGenerator = (listing) =>`, rename it `_generateMarkupCard(listing)`, and remove the unused `estimatedUtilities`, `fareOneWay`, and `amenities` from the destructuring. It should end up as:
```js
  _generateMarkupCard(listing) {
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
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span
                  >
                  <span class="card__rent">&#8369;${monthlyRent} / month</span>
                  <span class="tags">${utilitiesTag}</span>
                </span>
              </button>
            </li>`;
  }
```
**SAY:** *"It moved house. It doesn't live in `app.js` anymore. And notice it already has this morning's fixes: the tag and `maxOccupants`."*

**TYPE, step 4:** `_generateMarkup`, above `_generateMarkupCard`.
```js
  _generateMarkup() {
    return this._data
      .map((listing) => this._generateMarkupCard(listing))
      .join("");
  }
```
**SAY:** *"Two things. First, `return`: without it, `render` gets `undefined`. Second, the arrow function keeps `this`. Hold on to that, because it's going to bite someone today."*
⚠ **Watch for:** calling `this._generateMarkup(listing)` inside the map instead of `this._generateMarkupCard(listing)`. The method then calls itself forever, and you get `Maximum call stack size exceeded`. If it happens by accident, that's a good teaching moment too.

**TYPE, step 5:** hook it into `app.js` temporarily, just to test. Add the import at the top of `app.js`:
```js
import resultsView from "./views/ResultsView.js";
```
Then replace the whole `results` function with this (the old one used `markupGenerator`, which is gone):
```js
const results = () => {
  searchView.renderCount(model.state.filtered.length);
  resultsView.render(model.state.filtered);
};
```
**DO:** Save and switch to the browser. The page is blank, and the console shows a **404 for `/js/views/View`**.

**SAY:**
> "It broke! Good. Read the error with me. What file couldn't it find?"
- S: "`View`… without `.js`."
> "In the browser, **imports need the full filename**. This is the number one mistake you'll make this semester, and you just saw what it looks like."

**TYPE:** fix the import in `ResultsView.js`:
```js
import View from "./View.js";
```
**DO:** It works. Now search `zzz`.

**SAY:**
> "We get our empty message, and we didn't write any `if`. `View` did that. But look closely. What color is it?"
- S: "Red."
> "Inspect it." **DO:** Right-click → Inspect. "It's a `<p>` inside a `<ul>`. That's invalid HTML, and it's the wrong style. Our list has its own grey 'empty' box."

### 4c. Overriding `renderError` (0:55–0:58)

**SAY:**
> "Remember the house that writes **its own** 'something goes wrong' clause? This is that house."

**TYPE:** in `ResultsView.js`, right after `_errorMessage`:
```js
  // Override: sa sulod sa <ul>, <li> dapat, dili <p>
  renderError(message = this._errorMessage) {
    const markup = `<li class="empty">${message}</li>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
```
**DO:** Save and search `zzz`. It's grey and dashed now.

**SAY:**
> "Both classes have a `renderError`. `View.render()` calls `this.renderError()`. Which one runs?"
- S: "…The ResultsView one?"
> "Why?"
- S: "Because `this` is the ResultsView."
> "Yes. JavaScript looks in the **child first**, then the parent. That's called **overriding**."

⚠ **If they look lost:** show the two levels in the console:
```js
Object.getPrototypeOf(resultsView)                         // ResultsView's methods
Object.getPrototypeOf(Object.getPrototypeOf(resultsView))  // View's methods
```
(This only works if `resultsView` is reachable from the console. Otherwise, add `window.resultsView = resultsView;` in `app.js` just for the demo, then delete it.)

### 4d. The caretaker (0:58–1:05)

**SAY:**
> "Last piece: the click. Right now, who's listening for clicks on the cards?"
- S: "`app.js`."
> "Should the landlord be standing at the gate?"
- S: "No, the caretaker should."

**TYPE, step 1:** in `ResultsView.js`, after `renderError`, **stop before the `handler` line**:
```js
  addSelectHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;

    });
  }
```
**SAY:**
> "What should happen when a card is clicked?"
- S: "Show the detail?"
> "Does the **view** know how to do that?"
- S: "No…"
> "So it just calls the number it was given."

**TYPE, step 2:** the missing line, inside the listener after the guard.
```js
      handler(card.dataset.id);
```
**SAY:** *"Notice we pass **only the id**. That's plain data, not the whole HTML element."*

**TYPE, step 3:** `markSelected`, after `addSelectHandler`.
```js
  markSelected(id) {
    this._parentElement.querySelectorAll(".card").forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.id === id));
    });
  }
```
**SAY:** *"And here's the highlight bug, Fix 5. The CSS was ready all along. Now we finally set `aria-pressed` to true."*

**DO:** Put `SearchView.addSearchHandler` next to it on screen.
**SAY:** *"Same shape. Every view works like this: `addSomethingHandler(handler)`."*

**✔ `ResultsView.js` should now look like this** (the full file, including the card markup, is in the Appendix):
```js
import View from "./View.js";

class ResultsView extends View {
  _parentElement = document.querySelector(".results__list");
  _errorMessage = "No listings match that search. Try a barangay name.";

  // Override: sa sulod sa <ul>, <li> dapat, dili <p>
  renderError(message = this._errorMessage) { ... }

  addSelectHandler(handler) { ... }

  markSelected(id) { ... }

  _generateMarkup() { ... }

  _generateMarkupCard(listing) { ... }
}

export default new ResultsView();
```

**SAY:**
> "I'm stopping here. The part left is connecting the landlord's phone numbers in `app.js`, and **you're** doing that."

⏱ **1:05.**

---

# Quadrant 3: HOW? (1:05–1:30)

## 5. Practice: Students refactor `app.js` (1:05–1:20)

**DO:** Push, or tell them to copy, `View.js` and `ResultsView.js`:
```bash
git add js && git commit -m "Add View and ResultsView" && git push
```
Then project this **TODO skeleton**:

```js
import * as model from "./model.js";
import searchView from "./views/SearchView.js";
import resultsView from "./views/ResultsView.js";

// TODO 1: DELETE resultsList, results(), and the resultsList click listener.
//         Keep: detailsContainer, state, and all the detail-panel code.

// CONTROLLERS

const resultsController = () => {
  // TODO 2: update the count, render the filtered listings,
  //         then re-mark the selected card
};

const selectController = (id) => {
  // TODO 3: save selectedId, find the listing (guard!),
  //         set occupants, mark the card, render the detail
};

const searchController = (term) => {
  model.setSearchTerm(term);
  // TODO 4: call the right controller
};

const maxRentController = (value) => {
  model.setMaxRent(value);
  // TODO 4
};

const init = () => {
  // TODO 5: subscribe every handler, then do the first render
};

init();
```

**SAY:**
> "Same pairs, but **swap drivers**. Whoever typed during the bug hunt writes this time. Five TODOs. When you're done, the page should work exactly like before, and highlighting should work too. Twelve minutes."

**DO:** Walk around the room. Use these prompts, and **don't give the answer**:

| When you see… | Ask… |
|---|---|
| They're stuck on TODO 2 | "What 3 things need to update after a search? The count, the list, and…?" |
| `resultsView.render(model.state.listings)` | "Which list is the *visible* one?" |
| The highlight disappears after searching | "What does `render` set `aria-pressed` to? So what do you need to do after rendering?" |
| They still call `results()` somewhere | "Does `results()` still exist?" |
| Nothing renders, no error | "Is anyone calling `init()`?" |

⚠ **If more than half the class is stuck at 1:14:** stop everyone and do TODO 2 together on screen, then let them finish the rest.

**At 1:17, TYPE (or reveal) the answer.**

**Delete** these three pieces from `app.js`:
```js
const resultsList = document.querySelector(".results__list");   // ← delete

const results = () => { ... };                                   // ← delete the whole function

resultsList.addEventListener("click", (event) => { ... });       // ← delete the whole listener
```

**Replace** the old `searchController` / `maxRentController` / subscriptions at the bottom with:
```js
// CONTROLLERS

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

**SAY:** *"Compare it with yours. Different but working? That's fine. Tell me if you did something different."*

Ask: *"Why does `resultsController` call `markSelected` after `render`?"* (Because `render` rebuilds every card with `aria-pressed="false"`.)

**SAY** (the payoff):
> "Look at `app.js` now. Search it for `querySelector`." **DO:** Cmd‑F. "Just **one** is left, `detailsContainer`, and that's next week's. The results list is gone from `app.js` completely."

## 6. Extend: Amenity tags (1:20–1:30)

**SAY:**
> "New feature request from the client: *'Show the amenities on each card.'* One rule: you may **only** edit `ResultsView.js`. Ten minutes. Solo this time."

**DO:** Walk around the room. If someone opens `app.js`, ask: *"Why do you need the controller for this?"* Usually they don't, and realizing that is the lesson.

**At 1:27, TYPE (or reveal) one solution** in `ResultsView.js`.

A new method, after `_generateMarkupCard`:
```js
  _generateMarkupTags(amenities) {
    return amenities
      .map((amenity) => `<span class="tag">${amenity}</span>`)
      .join("");
  }
```
In `_generateMarkupCard`, add `amenities` to the destructuring:
```js
    const {
      id,
      name,
      barangay,
      monthlyRent,
      maxOccupants,
      utilitiesIncluded,
      distanceToCampusKm,
      amenities,
    } = listing;
```
And change the tags line:
```js
                  <span class="tags">${utilitiesTag}${this._generateMarkupTags(amenities)}</span>
```

**SAY:**
> "Hands up if you only changed **one file**." *(most hands)* "**That's** why we made views. A new feature in the list touches the list's file, and nothing else."

⚠ **Out of time?** Skip this step and assign it as homework.

---

# Quadrant 4: WHAT IF? (1:30–1:45)

## 7. Refine: Swap and test (1:30–1:37)

**SAY:**
> "Stand up and swap laptops with the pair behind you. You're QA again, this time on **their** code. Here's the checklist. If something fails, don't fix it for them. Find the cause in this table and tell them."

**DO:** Project both.

**Checklist:**
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

**Common mistakes:**

| Symptom | Cause |
|---|---|
| `Failed to load module script` / 404 on import | Missing `.js` in the import path |
| Works locally, breaks on GitHub Pages | Filename case: `searchView.js` vs `SearchView.js` |
| `Cannot use import statement outside a module` / CORS | Opened with `file://`. Use Live Server |
| `resultsView.render is not a function` | Exported the class instead of `new ResultsView()` |
| `does not provide an export named 'default'` | Missing `export default` in `View.js` |
| `…insertAdajacentHTML is not a function` | Typo: `insertAdjacentHTML` |
| `Maximum call stack size exceeded` | `_generateMarkup` calls itself instead of `_generateMarkupCard` |
| List is blank, no error | Missing `return` in `_generateMarkup`, or forgot to call `init()` |
| Old cards never disappear | `_clear()` is empty |
| `Cannot read properties of undefined (reading '_generateMarkupCard')` | `function (listing) { this… }` inside `.map`. Use an arrow function |
| `ReferenceError: View is not defined` | Missing `import View from "./View.js"` |

## 8. Perform: Show, look ahead, exit ticket (1:37–1:45)

**SAY:**
> "I need one pair to project theirs. Walk us through **one click**, from the moment the finger touches the card to the moment the highlight appears. Use the diagram."

**DO:** Put the diagram on **Step 2**, the click flow. Let them narrate it. Correct gently: *"And which function is the caretaker calling?"*

**DO:** Switch to **Step 3**.

**SAY:**
> "What if the detail panel followed the same template? Right now it's still sitting in `app.js`. That's your homework: build `DetailView.js`, move the state into the model, and when you're done, `app.js` should have **no** `querySelector`, **no** HTML, and **no** `addEventListener`."

**DO:** Hand out the exit ticket, or project it. Collect it at the door:

1. *Why* did we make a parent `View`?
2. *What* does `extends` give `ResultsView` for free?
3. *What if* `calculateCostPerHead` throws: who should catch it, and who shows the message?

**SAY** (closing):
> "Today started with nine bugs. Most of them were hiding in `app.js` because it had too many jobs. Now the results list has its own house. Next week, the detail panel moves out too. See you then."

---

## After class (5 min)

- Skim the exit tickets. If **Q3** answers mostly say "the view", open next lecture by asking it again. (Answer: the controller catches it and calls `detailView.renderError(err.message)`.)
- Note which TODO most pairs got stuck on in step 5. Next time, spend more of step 4 on that concept.
- If you made the checkpoint commits, push the end-of-class state too, so absent students can catch up.

---

# Appendix: final files (check your screen against these)

These are the files as they should be at **1:20**, after step 5 and before the amenity-tags extension. They're identical to `reference.js`.

### `js/views/View.js`

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

### `js/views/ResultsView.js`

```js
import View from "./View.js";

class ResultsView extends View {
  _parentElement = document.querySelector(".results__list");
  _errorMessage = "No listings match that search. Try a barangay name.";

  // Override: sa sulod sa <ul>, <li> dapat, dili <p>
  renderError(message = this._errorMessage) {
    const markup = `<li class="empty">${message}</li>`;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

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

  _generateMarkup() {
    return this._data
      .map((listing) => this._generateMarkupCard(listing))
      .join("");
  }

  _generateMarkupCard(listing) {
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
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span
                  >
                  <span class="card__rent">&#8369;${monthlyRent} / month</span>
                  <span class="tags">${utilitiesTag}</span>
                </span>
              </button>
            </li>`;
  }
}

export default new ResultsView();
```

### `js/app.js`

```js
import * as model from "./model.js";
import searchView from "./views/SearchView.js";
import resultsView from "./views/ResultsView.js";

// ELEMENTS
// (DetailView.js na ni sa sunod nga lecture)
const detailsContainer = document.querySelector(".detail");

// STATE
// (Ibalhin ni sa model.state sa sunod nga lecture)
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
  if (!Number.isInteger(people) || people < 1)
    throw new Error("Number of occupants must be a whole number, at least 1.");
  if (people > listing.maxOccupants)
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants`,
    );

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
    </p>
    `;
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
              <input type="checkbox" id="transport-demo" ${includeTransport ? "checked" : ""} />
            </div>
          </fieldset>

          <div class="breakdown">
            ${breakdownContent(listing)}
          </div>        
  `;
};

// Pangitaon sa TANAN listings, dili lang sa filtered
const selectedListing = () =>
  model.state.listings.find((listing) => listing.id === selectedId);

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

detailsContainer.addEventListener("input", (e) => {
  if (e.target.id === "occupants-demo") {
    occupants = Number(e.target.value);
    updateBreakdown();
  }

  if (e.target.id === "transport-demo") {
    includeTransport = e.target.checked;
    updateBreakdown();
  }
});

// CONTROLLERS

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

### `js/model.js`

```js
import { listings } from "./data.js";

export const state = {
  listings: listings,
  filtered: listings,
  searchTerm: "",
  maxRent: "",
};

export const applyFilters = () => {
  const query = state.searchTerm.toLowerCase().trim();
  const maxRent = state.maxRent;

  state.filtered = state.listings.filter((listing) => {
    const matchesQuery =
      query === "" ||
      listing.name.toLowerCase().includes(query) ||
      listing.barangay.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });
};

export const setSearchTerm = (term) => {
  state.searchTerm = term;
  applyFilters();
};

export const setMaxRent = (value) => {
  state.maxRent = value;
  applyFilters();
};
```
