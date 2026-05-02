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

  async function loadDictionary() {
    try {
      const res = await fetch(WEB_APP_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dictionaryData = await res.json();

      statusEl.textContent = `Loaded ${dictionaryData.length} words.`;
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

  loadDictionary();