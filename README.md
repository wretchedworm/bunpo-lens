# Bunpo Lens

**See the structure of Japanese.**

Bunpo Lens is a visual Japanese grammar reader. Paste in a passage, break it into words, and color-code each word by its grammatical role so the structure is easier to study.

## Current prototype

- Segments Japanese text in modern browsers using `Intl.Segmenter`
- Labels nouns, verbs, particles, adjectives, adverbs, auxiliaries, and other words
- Includes a small automatic-labeling demo
- Lets you correct or add labels by clicking any word
- Saves the current passage and labels locally in the browser
- Works without a build step or external dependencies

## Run it

Open `index.html` in a modern browser. For the most consistent behavior, serve the folder locally:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Direction

The first milestone is a trustworthy manual grammar-highlighting workflow. Automatic Japanese morphological analysis can be added later, after the categories and study interaction feel right.
