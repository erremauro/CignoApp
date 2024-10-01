const CHORD_LINE_PATTERN =
  /\b([A-G])(#|b)?(m|dim|aug)?(maj|min|m|M|sus|add)?\d{0,2}(\/[A-G](#|b)?)?\b/g;
const COLUMN_SEPARATOR_PATTERN = /^---/;

module.exports = main;

////////////////////////////////////////////////

function main() {
  const containerAll = document.querySelectorAll(".song");

  if (!containerAll.length) return;

  containerAll.forEach((container) => {
    processChordSection(container);
    processSongSection(container);
  });
}

function processChordSection(container) {
  const chordDiv = container.querySelector(".chords");
  if (!chordDiv) return;

  const textLines = chordDiv.textContent.trim().split("\n");
  const fragment = document.createDocumentFragment();

  const chordList = textLines.map((line) => line.split(/\s{2,}/));
  const maxLength = chordList.reduce(
    (max, chords) => Math.max(max, chords[0].length),
    0,
  );

  chordList.forEach(([chordName, chordShape]) => {
    const spacesNeeded = maxLength - chordName.length + 2;
    const spaces = " ".repeat(spacesNeeded);

    fragment.appendChild(createElement("span", "chord-name", chordName));
    fragment.appendChild(
      createElement("span", "chord-shape", spaces + chordShape),
    );
    fragment.appendChild(document.createElement("br"));
  });

  chordDiv.innerHTML = "";
  chordDiv.appendChild(fragment);
}

function processSongSection(container) {
  const songContent = container.querySelector(".song-content");
  if (!songContent) return;

  const textLines = songContent.textContent.split("\n");

  const fragment = document.createDocumentFragment();
  let columnElem = createElement("div", "song-column");

  textLines.forEach((line) => {
    if (COLUMN_SEPARATOR_PATTERN.test(line)) {
      fragment.appendChild(columnElem);
      columnElem = createElement("div", "song-column");
    } else {
      const songLineElem = createElement("span", "song-line", line);
      songLineElem.appendChild(createElement("br"));
      if (CHORD_LINE_PATTERN.test(line))
        songLineElem.classList.add("highlight");
      columnElem.appendChild(songLineElem);
    }
  });

  fragment.appendChild(columnElem);
  songContent.innerHTML = "";
  songContent.appendChild(fragment);
}

function createElement(type, className = "", content = "") {
  const element = document.createElement(type);
  if (className) element.classList.add(className);
  if (content) element.textContent = content;
  return element;
}
