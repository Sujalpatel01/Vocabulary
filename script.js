const vocabularyGridContainer = document.getElementById('wordsContainer');
const getNewWordsButton = document.getElementById('newWordsBtn');
const themeToggleButton = document.getElementById('themeToggleBtn');
const showStarredButton = document.getElementById('showFavoritesBtn');
const wordSearchInput = document.getElementById('searchInput');
const searchTriggerButton = document.getElementById('searchButton');
const searchResultsDisplay = document.getElementById('searchResults');
const categoryFilterSelect = document.getElementById('categorySelect');

const categorizedVocabulary = {
    "all": [],
    "academic": [
        "serendipity", "ubiquitous", "ephemeral", "mellifluous", "luminous",
        "nefarious", "quixotic", "dichotomy", "eloquence", "juxtaposition",
        "obfuscate", "paradox", "sagacious", "taciturn", "unfathomable",
        "veracity", "aberration", "capricious", "deleterious", "enervate",
        "fastidious", "idiosyncrasy", "paradigm", "ostracize", "ubiquitous",
        "precarious", "elucidate", "propensity", "equivocate", "recalcitrant"
    ],
    "descriptive": [
        "benevolent", "cacophony", "gregarious", "harmonious", "illustrious",
        "incandescent", "kaleidoscope", "labyrinth", "magnanimous", "vexatious",
        "ambiguous", "eccentric", "jocund", "loquacious", "salient", "wistful",
        "zephyr", "scintillating", "ethereal", "resplendent", "dulcet",
        "ebullient", "garrulous", "languid", "myriad", "rancid"
    ],
    "character": [
        "sycophant", "gregarious", "taciturn", "histrionic", "maverick",
        "raconteur", "juggernaut", "charlatan", "stoic", "altruistic",
        "gullible", "disingenuous", "intransigent", "philanthropic"
    ],
    "abstract": [
        "kismet", "nadir", "oblivion", "panacea", "trepidation", "yore",
        "epiphany", "anathema", "diaspora", "quintessence", "catharsis",
        "vicarious", "apathy", "dogma", "proclivity"
    ],
    "challenging": [
        "flummox", "impecunious", "querulous", "xenophobia", "kudos", "clandestine",
        "dogmatic", "surreptitious", "obstreperous", "perfunctory", "ignominious",
        "mercurial", "plethora", "sardonic", "parsimonious"
    ]
};

Object.keys(categorizedVocabulary).forEach(category => {
    if (category !== "all") {
        categorizedVocabulary.all = categorizedVocabulary.all.concat(categorizedVocabulary[category]);
    }
});
categorizedVocabulary.all = [...new Set(categorizedVocabulary.all)];

const FAVORITE_WORDS_STORAGE_KEY = 'favoriteWords';
const getStoredFavoriteWords = () => {
    try {
        const stored = localStorage.getItem(FAVORITE_WORDS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error retrieving favorite words:", error);
        return [];
    }
};
const saveCurrentFavoriteWords = (words) => {
    try {
        localStorage.setItem(FAVORITE_WORDS_STORAGE_KEY, JSON.stringify(words));
    } catch (error) {
        console.error("Error saving favorite words:", error);
    }
};
let currentFavoriteWords = getStoredFavoriteWords();

async function fetchWordDetails(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Word not found in dictionary: "${word}"`);
            } else {
                console.error(`HTTP error fetching "${word}"! Status: ${response.status}`);
            }
            return null;
        }
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error(`Network or API error while fetching "${word}":`, error);
        return null;
    }
}

function createWordCard(wordData) {
    const wordCard = document.createElement('div');
    wordCard.classList.add('word-card');
    wordCard.dataset.word = wordData.word;
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('word-card-header');
    const wordHeading = document.createElement('h2');
    wordHeading.textContent = wordData.word;
    cardHeader.appendChild(wordHeading);
    const favoriteIcon = document.createElement('i');
    favoriteIcon.classList.add('fas', 'fa-star', 'card-icon', 'favorite-icon');
    if (currentFavoriteWords.includes(wordData.word)) {
        favoriteIcon.classList.add('active');
    }
    favoriteIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleWordFavoriteStatus(wordData.word, favoriteIcon);
    });
    cardHeader.appendChild(favoriteIcon);
    let audioPronunciationSource = null;
    if (wordData.phonetics && wordData.phonetics.length > 0) {
        const usAudio = wordData.phonetics.find(p => p.audio && p.audio.includes('-us.mp3'));
        audioPronunciationSource = usAudio ? usAudio.audio : wordData.phonetics[0].audio;
    }
    if (audioPronunciationSource) {
        const audioIcon = document.createElement('i');
        audioIcon.classList.add('fas', 'fa-volume-up', 'card-icon', 'audio-icon');
        audioIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            const audio = new Audio(audioPronunciationSource);
            audio.play().catch(e => console.error("Error playing audio:", e));
        });
        cardHeader.appendChild(audioIcon);
    }
    const shareIcon = document.createElement('i');
    shareIcon.classList.add('fas', 'fa-share-alt', 'card-icon', 'share-icon');
    shareIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        const firstDefinition = wordData.meanings[0]?.definitions[0]?.definition || "No definition available.";
        shareVocabularyWord(wordData.word, firstDefinition);
    });
    cardHeader.appendChild(shareIcon);
    wordCard.appendChild(cardHeader);
    const wordDetailsSection = document.createElement('div');
    if (wordData.meanings && wordData.meanings.length > 0) {
        wordData.meanings.forEach(meaning => {
            const meaningBlock = document.createElement('div');
            meaningBlock.classList.add('meaning-section');
            const partOfSpeechElement = document.createElement('p');
            partOfSpeechElement.classList.add('part-of-speech');
            partOfSpeechElement.textContent = meaning.partOfSpeech || 'N/A';
            meaningBlock.appendChild(partOfSpeechElement);
            if (meaning.definitions && meaning.definitions.length > 0) {
                meaning.definitions.slice(0, 2).forEach(def => {
                    const definitionParagraph = document.createElement('p');
                    definitionParagraph.classList.add('definition');
                    definitionParagraph.textContent = `- ${def.definition}`;
                    meaningBlock.appendChild(definitionParagraph);
                    if (def.example) {
                        const exampleParagraph = document.createElement('p');
                        exampleParagraph.classList.add('example');
                        exampleParagraph.textContent = `"${def.example}"`;
                        meaningBlock.appendChild(exampleParagraph);
                    }
                });
            } else {
                const noDefinitionMessage = document.createElement('p');
                noDefinitionMessage.classList.add('definition');
                noDefinitionMessage.textContent = "No definition found for this part of speech.";
                meaningBlock.appendChild(noDefinitionMessage);
            }
            wordDetailsSection.appendChild(meaningBlock);
        });
    } else {
        const noMeaningMessage = document.createElement('p');
        noMeaningMessage.textContent = "No meaning data found for this word.";
        wordDetailsSection.appendChild(noMeaningMessage);
    }
    wordCard.appendChild(wordDetailsSection);
    return wordCard;
}

async function displayVocabularyList(numWords = 10, filterToFavorites = false, category = 'all') {
    vocabularyGridContainer.innerHTML = '<p class="status-message">Loading words...</p>';
    searchResultsDisplay.innerHTML = '';
    let wordsToChooseFrom = [];
    if (filterToFavorites) {
        wordsToChooseFrom = currentFavoriteWords;
        if (wordsToChooseFrom.length === 0) {
            vocabularyGridContainer.innerHTML = '<p class="status-message">No starred vocabulary found. Star some words first!</p>';
            return;
        }
        numWords = wordsToChooseFrom.length;
    } else {
        wordsToChooseFrom = categorizedVocabulary[category] || categorizedVocabulary.all;
        if (wordsToChooseFrom.length === 0) {
            vocabularyGridContainer.innerHTML = `<p class="status-message">No words found for the "${category}" category.</p>`;
            return;
        }
    }
    const selectedWordsForDisplay = new Set();
    const wordsToFetchDetails = [];
    if (!filterToFavorites) {
        let randomizedFavorites = [...currentFavoriteWords];
        for (let i = randomizedFavorites.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [randomizedFavorites[i], randomizedFavorites[j]] = [randomizedFavorites[j], randomizedFavorites[i]];
        }
        const maxFavoritesInNewList = Math.min(Math.floor(numWords * 0.5), randomizedFavorites.length);
        for (let i = 0; i < maxFavoritesInNewList; i++) {
            const favWord = randomizedFavorites[i];
            if (wordsToChooseFrom.includes(favWord) && !selectedWordsForDisplay.has(favWord)) {
                selectedWordsForDisplay.add(favWord);
                wordsToFetchDetails.push(favWord);
            }
        }
    }
    while (selectedWordsForDisplay.size < numWords && selectedWordsForDisplay.size < wordsToChooseFrom.length) {
        const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
        const word = wordsToChooseFrom[randomIndex];
        if (!selectedWordsForDisplay.has(word)) {
            selectedWordsForDisplay.add(word);
            wordsToFetchDetails.push(word);
        }
    }
    if (!filterToFavorites) {
        for (let i = wordsToFetchDetails.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordsToFetchDetails[i], wordsToFetchDetails[j]] = [wordsToFetchDetails[j], wordsToFetchDetails[i]];
        }
    }
    if (wordsToFetchDetails.length === 0 && selectedWordsForDisplay.size === 0) {
        vocabularyGridContainer.innerHTML = `<p class="status-message">No new words available in this selection. Try another category or get a new list.</p>`;
        return;
    }
    const fetchPromises = wordsToFetchDetails.map(word => fetchWordDetails(word));
    const wordDataResults = await Promise.all(fetchPromises);
    vocabularyGridContainer.innerHTML = '';
    let wordsSuccessfullyDisplayedCount = 0;
    for (const wordData of wordDataResults) {
        if (wordData && wordData.word) {
            vocabularyGridContainer.appendChild(createWordCard(wordData));
            wordsSuccessfullyDisplayedCount++;
        }
    }
    if (wordsSuccessfullyDisplayedCount === 0) {
        vocabularyGridContainer.innerHTML = '<p class="status-message">Failed to load any words for this selection. Please try again or check your internet connection.</p>';
    }
}

function setAppTheme(enableDarkTheme) {
    const iconSpan = themeToggleButton.querySelector('.icon');
    const textSpan = themeToggleButton.querySelector('.text');
    if (enableDarkTheme) {
        document.body.classList.add('dark-theme');
        iconSpan.textContent = '🌙';
        textSpan.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        iconSpan.textContent = '💡';
        textSpan.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    }
}

function toggleWordFavoriteStatus(word, iconElement) {
    const index = currentFavoriteWords.indexOf(word);
    if (index > -1) {
        currentFavoriteWords.splice(index, 1);
        iconElement.classList.remove('active');
        console.log(`Unfavorited: "${word}"`);
    } else {
        currentFavoriteWords.push(word);
        iconElement.classList.add('active');
        console.log(`Favorited: "${word}"`);
    }
    saveCurrentFavoriteWords(currentFavoriteWords);
    if (showStarredButton.classList.contains('active-filter')) {
        displayVocabularyList(10, true);
    }
}

async function handleWordSearch() {
    const searchTerm = wordSearchInput.value.trim();
    searchResultsDisplay.innerHTML = '';
    vocabularyGridContainer.innerHTML = '';
    if (searchTerm === '') {
        searchResultsDisplay.innerHTML = '<p class="status-message">Please enter a word to search.</p>';
        return;
    }
    searchResultsDisplay.innerHTML = '<p class="status-message">Searching for "' + searchTerm + '"...</p>';
    const wordDetails = await fetchWordDetails(searchTerm);
    searchResultsDisplay.innerHTML = '';
    if (wordDetails) {
        const card = createWordCard(wordDetails);
        searchResultsDisplay.appendChild(card);
    } else {
        searchResultsDisplay.innerHTML = '<p class="status-message">No definition found for "' + searchTerm + '".</p>';
    }
}

function populateCategoryOptions() {
    for (const category in categorizedVocabulary) {
        if (categorizedVocabulary.hasOwnProperty(category) && category !== 'all') {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilterSelect.appendChild(option);
        }
    }
}

function shareVocabularyWord(word, definition) {
    const appBaseUrl = window.location.href.split('?')[0];
    const shareText = `Check out this word: "${word}" - ${definition} Learn more: ${appBaseUrl}`;
    if (navigator.share) {
        navigator.share({
            title: `Vocabulary Word: ${word}`,
            text: shareText,
            url: appBaseUrl,
        })
        .then(() => console.log('Word shared successfully!'))
        .catch((error) => console.error('Error sharing word:', error));
    } else {
        console.log("Web Share API not supported, opening fallback share options.");
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}&u=${encodeURIComponent(appBaseUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        setTimeout(() => {
            window.open(facebookUrl, '_blank', 'width=600,height=400');
        }, 500);
    }
}

function registerAppServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered successfully with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    registerAppServiceWorker();
    const savedThemePreference = localStorage.getItem('theme');
    setAppTheme(savedThemePreference === 'dark');
    populateCategoryOptions();
    displayVocabularyList(10);
    getNewWordsButton.addEventListener('click', () => {
        categoryFilterSelect.value = 'all';
        displayVocabularyList(10);
        showStarredButton.classList.remove('active-filter');
    });
    showStarredButton.addEventListener('click', () => {
        displayVocabularyList(10, true);
        showStarredButton.classList.add('active-filter');
        categoryFilterSelect.value = 'all';
    });
    categoryFilterSelect.addEventListener('change', (event) => {
        const selectedCategory = event.target.value;
        displayVocabularyList(10, false, selectedCategory);
        showStarredButton.classList.remove('active-filter');
    });
    searchTriggerButton.addEventListener('click', handleWordSearch);
    wordSearchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleWordSearch();
        }
    });
    themeToggleButton.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('dark-theme');
        setAppTheme(!isCurrentlyDark);
    });
});