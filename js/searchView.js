class SearchView {
  _searchInput = document.querySelector("#search-input");
  _maxRentInput = document.querySelector("#max-rent");
  _form = document.querySelector(".search");
  _countElement = document.querySelector("#result-count");

  addSearchHandler(handler) {
    this._searchInput.addEventListener("input", (e) => {
      handler(this._searchInput.value);
    });
  }

  addMaxRentHandler(handler) {
    this._maxRentInput.addEventListener("input", (e) => {
      handler(this._maxRentInput.value);
    });
  }

  updateCount(count) {
    this._countElement.textContent = `${count} listings found`;
  }

  addHandlerSubmit() {
    this._form.addEventListener("submit", (e) => e.preventDefault());
  }
}

export default new SearchView();
