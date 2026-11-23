---
name: create-html-textbook
license: MIT
description: Build or update offline HTML textbooks for subjects such as coding, economics, and languages, with sidebar navigation, practice exercises, and follow-up subchapters. Use when a learner asks for an HTML study guide or needs a prerequisite or unclear concept added to an existing textbook.
---

# Create HTML Textbook

The link checker requires Python 3. Reading only needs a browser. AI providers require internet access.

## Create a textbook

1. Create `docs/index.html` for the curriculum and `docs/lessons/ch0-<slug>.html`, `ch1-<slug>.html`, and so on. Add `docs/architecture/` if a system contract or diagram needs its own page.
2. Copy [style.css](assets/style.css) and [app.js](assets/app.js) into `docs/assets/`. Load them with relative URLs and a deferred script. Keep reading and navigation usable from `file://` without network dependencies.
3. Use a sidebar with the same links on every page and mark the current link. Wrap each chapter in `<article class="content">` with an `<h1>` and meaningful `<h2>` headings. Use `[data-theme-toggle]` for the theme control, `[data-menu-toggle]` for mobile navigation, and `.pager` for previous and next links.
4. Start from what the learner knows. Explain the concept, then give an exercise and a way to check it. For coding, give starter code, `TODO(user)` markers, build commands, and executable tests. For other subjects, use a task suited to the material, such as a valuation calculation or a dialogue, and provide a check or a collapsible sample answer. Leave the exercise for the learner to attempt first.
5. Use semantic HTML, `.code-block` for code and `.code-block.cmd` for shell commands. Link to official references for further reading.

The bundled helpers add chapter help on lesson pages and a prompt widget when the learner selects text in the article. Chapter help uses the title and section headings. Selection help includes the selection and nearby context. Learners can copy prompts or open ChatGPT, Claude, or Perplexity. Preserve these controls when rebuilding pages.

### Narrative transitions

Across the article, use short transitions that tell the learner what to do, why it matters, and what to check next. Before a table or exercise, pose the question it will help answer or tell the learner what to look for. Afterwards, interpret the result and connect it to the next step. Use these transitions where the reasoning changes, and vary the phrasing to fit the subject.

> “먼저 순이익과 영업활동 현금흐름을 비교해 봐요. 외상으로 판 물건은 이익에 반영돼도 대금이 아직 들어오지 않았을 수 있어요. 아래 표에서 두 숫자의 차이를 확인한 뒤, 매출채권이 얼마나 늘었는지 살펴봐요.”

### Production process

1. Draft or revise the textbook using the writing rules above and the learner's stated goal.
2. Review the draft against both criteria:
   - **Goal coverage:** Does the textbook explain all the concepts and prerequisites the learner needs to reach the goal, given their starting knowledge? Check that exercises and verification cover the skills the learner is expected to demonstrate.
   - **Narrative continuity:** Read the chapters in order. Do the transitions explain what to do, why it matters, and what to check next? Check that tables and exercises follow from the surrounding explanation and lead into the next step.
3. If either check fails, return to step 1. Add missing explanations or strengthen the transitions, then repeat both checks. Once both pass, run the verification at the end of this skill.

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
