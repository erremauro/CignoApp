const CHORD_LINE_PATTERN: RegExp =
  /\b([A-G])(#|b)?(m|dim|aug)?(maj|min|m|M|sus|add)?\d{0,2}(\/[A-G](#|b)?)?\b/g;
const COLUMN_SEPARATOR_PATTERN: RegExp = /^---/;

////////////////////////////////////////////////

export function renderSong(): void {
  const containerAll: NodeListOf<Element> = document.querySelectorAll(".song");

  if (!containerAll.length) return;

  containerAll.forEach((container) => {
    processChordSection(container as HTMLElement);
    processSongSection(container as HTMLElement);
  });
}

function processChordSection(container: HTMLElement): void {
  const chordDiv = container.querySelector(".chords") as HTMLElement | null;
  if (!chordDiv) return;

  const textContent = chordDiv.textContent;
  if (!textContent) return;

  const textLines: string[] = textContent.trim().split("\n");
  const fragment: DocumentFragment = document.createDocumentFragment();

  const chordList: string[][] = textLines.map((line) => line.split(/\s{2,}/));
  const maxLength: number = chordList.reduce(
    (max, chords) => Math.max(max, chords[0].length),
    0,
  );

  chordList.forEach(([chordName, chordShape]) => {
    const spacesNeeded: number = maxLength - chordName.length + 2;
    const spaces: string = " ".repeat(spacesNeeded);

    fragment.appendChild(createElement("span", "chord-name", chordName));
    fragment.appendChild(
      createElement("span", "chord-shape", spaces + chordShape),
    );
    fragment.appendChild(document.createElement("br"));
  });

  chordDiv.innerHTML = "";
  chordDiv.appendChild(fragment);
}

function processSongSection(container: HTMLElement): void {
  const songContent = container.querySelector(
    ".song-content",
  ) as HTMLElement | null;
  if (!songContent) return;

  const textContent = songContent.textContent;
  if (!textContent) return;

  const textLines: string[] = textContent.split("\n");

  const fragment: DocumentFragment = document.createDocumentFragment();
  let columnElem: HTMLElement = createElement("div", "song-column");

  textLines.forEach((line) => {
    if (COLUMN_SEPARATOR_PATTERN.test(line)) {
      fragment.appendChild(columnElem);
      columnElem = createElement("div", "song-column");
    } else {
      const songLineElem: HTMLElement = createElement(
        "span",
        "song-line",
        line,
      );
      songLineElem.appendChild(createElement("br"));
      if (CHORD_LINE_PATTERN.test(line)) {
        songLineElem.classList.add("highlight");
      }
      columnElem.appendChild(songLineElem);
    }
  });

  fragment.appendChild(columnElem);
  songContent.innerHTML = "";
  songContent.appendChild(fragment);
}

function createElement(
  type: string,
  className: string = "",
  content: string = "",
): HTMLElement {
  const element: HTMLElement = document.createElement(type);
  if (className) element.classList.add(className);
  if (content) element.textContent = content;
  return element;
}
