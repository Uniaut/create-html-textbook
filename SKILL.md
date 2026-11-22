---
name: create-html-textbook
license: MIT
description: Build or update offline HTML study textbooks with sidebar navigation, skeleton-first labs, and follow-up subchapters. Use when a learner asks for an HTML study guide or needs a prerequisite or unclear concept added to an existing textbook.
---

# Create HTML Textbook

The link checker requires Python 3. Reading only needs a browser. AI providers require internet access.

## Create a textbook

1. Create `docs/index.html` for the curriculum and `docs/lessons/ch0-<slug>.html`, `ch1-<slug>.html`, and so on. Add `docs/architecture/` if a system contract or diagram needs its own page.
2. Copy [style.css](assets/style.css) and [app.js](assets/app.js) into `docs/assets/`. Load them with relative URLs and a deferred script. Keep reading and navigation usable from `file://` without network dependencies.
3. Use a sidebar with the same links on every page and mark the current link. Wrap each chapter in `<article class="content">` with an `<h1>` and meaningful `<h2>` headings. Use `[data-theme-toggle]` for the theme control, `[data-menu-toggle]` for mobile navigation, and `.pager` for previous and next links.
4. Start from what the learner knows. Explain the concept and design trade-offs, then give a hands-on exercise and a completion check. Provide interfaces, `TODO(user)` markers, build commands, and executable tests. Leave the exercise's core implementation for the learner.
5. Use semantic HTML, `.code-block` for code and `.code-block.cmd` for shell commands. Link to official references for further reading.

The bundled helpers add chapter help on lesson pages and a prompt widget when the learner selects text in the article. Chapter help uses the title and section headings. Selection help includes the selection and nearby context. Learners can copy prompts or open ChatGPT, Claude, or Perplexity. Preserve these controls when rebuilding pages.

## Add a follow-up subchapter

Answer quick questions directly. If the learner asks for an enduring explanation or a prerequisite lesson, add `docs/lessons/ch<X>-<N>-<slug>.html` using the next unused number under chapter X.

- Explain the specific gap using an example tied to the parent chapter. Summarize any topic covered later and link to the deeper lesson.
- Add an indented `.nav-sub` entry under the parent on every page, including the index. Update the neighboring previous and next links to include the new page in reading order.

## Verify changes

From the installed skill directory, run:

```sh
python3 scripts/verify_links.py /path/to/project/docs
```

Fix broken local links. Check the entry page, sidebar order, and adjacent pager links in a browser when available.
