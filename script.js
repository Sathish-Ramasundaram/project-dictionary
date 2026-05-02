const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');
const resultArea = document.getElementById('resultArea');

function showEnteredText() {
    resultArea.textContent = searchBox.value;
}

searchBtn.addEventListener('click', showEnteredText);

searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        showEnteredText();
    }
});
