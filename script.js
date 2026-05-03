const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzb2faYWyyBZD_hrQ633gL-q5oNs19k9eDfODHzMWWOBWFkjpWiR4KhFplDtMNqK9js/exec";

  let dictionaryData = [];

  const statusEl = document.getElementById("status");
  const wordInput = document.getElementById("wordInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultEl = document.getElementById("result");

  const englishEl = document.getElementById("english");
  const meaningEl = document.getElementById("meaning");
  const tamilEl = document.getElementById("tamil");
  const kannadaEl = document.getElementById("kannada");
  const hindiEl = document.getElementById("hindi");
  const imageWrapEl = document.getElementById("imageWrap");
  const dictionaryBodyEl = document.getElementById("dictionaryBody");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

  let activeSortKey = "English";

  function countNonEmpty(rows, key) {
    return rows.filter((row) => String(row[key] || "").trim() !== "").length;
  }

  function renderLoadSummary(rows) {
    const englishCount = countNonEmpty(rows, "English");
    const tamilCount = countNonEmpty(rows, "Tamil");
    const kannadaCount = countNonEmpty(rows, "Kannada");
    const hindiCount = countNonEmpty(rows, "Hindi");
    const imageUrlCount = countNonEmpty(rows, "Image_URL");

    statusEl.innerHTML = [
      `English - ${englishCount} words`,
      `Image URL - ${imageUrlCount}`,
      `Tamil - ${tamilCount} words`,
      `Kannada - ${kannadaCount} words`,
      `Hindi - ${hindiCount} words`
    ].join("<br>");
  }

  function getLocaleForKey(key) {
    if (key === "Tamil") return "ta";
    if (key === "Kannada") return "kn";
    if (key === "Hindi") return "hi";
    return "en";
  }

  function getSortedRows(rows, key) {
    const collator = new Intl.Collator(getLocaleForKey(key), {
      sensitivity: "base",
      numeric: true
    });

    return [...rows].sort((a, b) => {
      const aVal = String(a[key] || "").trim();
      const bVal = String(b[key] || "").trim();

      if (!aVal && !bVal) return 0;
      if (!aVal) return 1;
      if (!bVal) return -1;
      return collator.compare(aVal, bVal);
    });
  }

  function renderDictionaryList(rows, key) {
    const sortedRows = getSortedRows(rows, key);
    dictionaryBodyEl.innerHTML = "";

    const fragment = document.createDocumentFragment();
    sortedRows.forEach((row) => {
      const tr = document.createElement("tr");
      ["English", "Meaning", "Tamil", "Kannada", "Hindi"].forEach((col) => {
        const td = document.createElement("td");
        td.textContent = row[col] || "-";
        tr.appendChild(td);
      });
      fragment.appendChild(tr);
    });

    dictionaryBodyEl.appendChild(fragment);
  }

  function setActiveFilterButton(key) {
    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.sortKey === key);
    });
  }

  async function loadDictionary() {
    try {
      const res = await fetch(WEB_APP_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dictionaryData = await res.json();

      renderLoadSummary(dictionaryData);
      renderDictionaryList(dictionaryData, activeSortKey);
    } catch (err) {
      statusEl.textContent = "Failed to load dictionary data.";
      console.error(err);
    }
  }

  function normalize(v) {
    return String(v || "").trim().toLowerCase();
  }

  function renderWord(row) {
    englishEl.textContent = row["English"] || "-";
    meaningEl.textContent = row["Meaning"] || "-";
    tamilEl.textContent = row["Tamil"] || "-";
    kannadaEl.textContent = row["Kannada"] || "-";
    hindiEl.textContent = row["Hindi"] || "-";

    const imageUrl = row["Image_URL"] || "";
    imageWrapEl.innerHTML = "";
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = row["English"] || "word image";
      imageWrapEl.appendChild(img);
    }

    resultEl.classList.remove("hidden");
  }

  function searchWord() {
    const query = normalize(wordInput.value);
    if (!query) {
      statusEl.textContent = "Please type a word.";
      resultEl.classList.add("hidden");
      return;
    }

    const exact = dictionaryData.find(
      (row) => normalize(row["English"]) === query
    );

    if (exact) {
      statusEl.textContent = "Word found.";
      renderWord(exact);
      return;
    }

    const startsWith = dictionaryData.find(
      (row) => normalize(row["English"]).startsWith(query)
    );

    if (startsWith) {
      statusEl.textContent = `Exact match not found. Showing "${startsWith["English"]}".`;
      renderWord(startsWith);
    } else {
      statusEl.textContent = "No matching word found.";
      resultEl.classList.add("hidden");
    }
  }

  searchBtn.addEventListener("click", searchWord);
  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchWord();
  });
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSortKey = btn.dataset.sortKey || "English";
      setActiveFilterButton(activeSortKey);
      renderDictionaryList(dictionaryData, activeSortKey);
    });
  });

  loadDictionary();
