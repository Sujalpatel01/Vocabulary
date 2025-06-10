# Daily Vocabulary Builder

The Daily Vocabulary Builder is a web application designed to enhance your vocabulary by displaying a selection of curated words along with their definitions, examples, and pronunciation. It also offers search functionality and the ability to favorite words.

## Features

- **Vocabulary Display:** Randomly displays a list of vocabulary words sorted by category.
- **Word Details:** Fetches detailed word definitions, meanings, examples, and pronunciations using an external dictionary API.
- **Favorites:** Easily mark words as favorites and view your starred selections.
- **Search:** Search for a specific word and view its details.
- **Theme Toggle:** Switch between Light and Dark modes.
- **Service Worker:** Supports offline capabilities for a better user experience.
- **Share Options:** Quickly share a word using the browser’s native share functionality or fallback options.

## File Structure

- **[vocabulary/index.html](vocabulary/index.html):** Main HTML file for the application.
- **[vocabulary/script.js](vocabulary/script.js):** JavaScript code that manages the vocabulary list, API calls, search functionality, and theme toggling.
- **[vocabulary/style.css](vocabulary/style.css):** CSS styles to layout and design the application.

## How to Run

1. Open the [vocabulary/index.html](vocabulary/index.html) file in your web browser.
2. The application will load and you can start interacting by searching for words, toggling themes, and marking words as favorites.

## Customization

- **Categories:** Vocabulary words are divided into categories like _academic_, _descriptive_, _character_, _abstract_, and _challenging_.
- **API Integration:** Word details are fetched from the Dictionary API using the `fetchWordDetails` function in [script.js](vocabulary/script.js).

## Contributing

Feel free to fork the project and submit pull requests if you have improvements. For any issues or feature suggestions, open an issue in the repository.

