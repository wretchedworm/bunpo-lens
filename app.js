const categories = [
  { id: "noun", label: "Noun", color: "#ffd7d2" },
  { id: "verb", label: "Verb", color: "#ffb5a7" },
  { id: "particle", label: "Particle", color: "#b9dcff" },
  { id: "adjective", label: "Adjective", color: "#dac5ff" },
  { id: "adverb", label: "Adverb", color: "#c8efcf" },
  { id: "auxiliary", label: "Auxiliary", color: "#ffe5a3" },
  { id: "other", label: "Other", color: "#e2e5e8" }
];

const demoText = "昨日、静かな図書館で面白い本を読みました。";
const knownParticles = new Set(["は", "が", "を", "に", "へ", "で", "と", "も", "の", "から", "まで", "より", "や", "ね", "よ", "か"]);
const starterLabels = { "昨日": "noun", "静かな": "adjective", "図書館": "noun", "で": "particle", "面白い": "adjective", "本": "noun", "を": "particle", "読み": "verb", "ました": "auxiliary" };

const sourceText = document.querySelector("#sourceText");
const readingView = document.querySelector("#readingView");
const picker = document.querySelector("#categoryPicker");
const selectedWord = document.querySelector("#selectedWord");
const saveStatus = document.querySelector("#saveStatus");
let tokens = [];
let selectedIndex = null;

function segment(text) {
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
    return [...segmenter.segment(text)].map(({ segment, isWordLike }) => ({ text: segment, isWord: Boolean(isWordLike), category: null }));
  }
  return [...text].map(character => ({ text: character, isWord: /[\p{L}\p{N}]/u.test(character), category: null }));
}

function guessCategory(token) {
  if (knownParticles.has(token)) return "particle";
  if (/^(です|でした|ます|ました|ません|ない|たい)$/.test(token)) return "auxiliary";
  if (/[い]$/.test(token) && token.length > 1) return "adjective";
  return starterLabels[token] || null;
}

function analyze(text, useDemoLabels = false) {
  tokens = segment(text).map(token => ({ ...token, category: token.isWord ? (useDemoLabels ? guessCategory(token.text) : null) : null }));
  selectedIndex = null;
  picker.hidden = true;
  render();
  persist();
}

function render() {
  readingView.replaceChildren();
  tokens.forEach((token, index) => {
    if (!token.isWord) {
      const span = document.createElement("span");
      span.className = "punctuation";
      span.textContent = token.text;
      readingView.append(span);
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = `token${index === selectedIndex ? " selected" : ""}`;
    button.textContent = token.text;
    button.setAttribute("aria-label", `${token.text}${token.category ? `, ${token.category}` : ", unlabeled"}`);
    if (token.category) button.style.background = categories.find(category => category.id === token.category)?.color;
    button.addEventListener("click", () => selectToken(index));
    readingView.append(button);
  });
}

function selectToken(index) {
  selectedIndex = index;
  selectedWord.textContent = `「${tokens[index].text}」`;
  picker.hidden = false;
  render();
}

function applyCategory(category) {
  if (selectedIndex === null) return;
  tokens[selectedIndex].category = category;
  persist();
  render();
}

function persist() {
  localStorage.setItem("bunpoLens", JSON.stringify({ text: sourceText.value, tokens }));
  saveStatus.textContent = "Saved on this device";
}

function buildControls() {
  const categoryButtons = document.querySelector("#categoryButtons");
  const legendItems = document.querySelector("#legendItems");
  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.textContent = category.label;
    button.style.background = category.color;
    button.addEventListener("click", () => applyCategory(category.id));
    categoryButtons.append(button);

    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<span class="swatch" style="background:${category.color}"></span>${category.label}`;
    legendItems.append(item);
  });
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "category-button";
  remove.textContent = "Unlabel";
  remove.addEventListener("click", () => applyCategory(null));
  categoryButtons.append(remove);
}

document.querySelector("#analyzeButton").addEventListener("click", () => analyze(sourceText.value.trim()));
document.querySelector("#clearButton").addEventListener("click", () => { tokens.forEach(token => token.category = null); persist(); render(); });
document.querySelector("#resetButton").addEventListener("click", () => { sourceText.value = demoText; analyze(demoText, true); });
sourceText.addEventListener("input", () => { saveStatus.textContent = "Analyze to save changes"; });

buildControls();
const saved = JSON.parse(localStorage.getItem("bunpoLens") || "null");
if (saved?.text && Array.isArray(saved.tokens)) {
  sourceText.value = saved.text;
  tokens = saved.tokens;
  render();
} else {
  analyze(demoText, true);
}
