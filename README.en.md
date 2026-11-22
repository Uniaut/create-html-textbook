# Create HTML Textbook

[한국어](README.md) · English

An Agent Skill that turns technical learning requests into offline HTML textbooks. It builds on what the learner already knows, gives them code skeletons and runnable checks, and adds a linked subchapter when a specific prerequisite needs more explanation.

## Example · Python to C++ for coding tests

The Korean sample assumes Python experience through BOJ Platinum V and targets implementation practice through Gold V in C++17. Start at [the curriculum](examples/python-to-cpp/docs/index.html), try the [grid BFS lab](examples/python-to-cpp/docs/lessons/ch1-grid-bfs.html), and follow the [const reference subchapter](examples/python-to-cpp/docs/lessons/ch1-1-const-reference.html).

![Light-theme grid BFS lesson showing the sidebar, indented reference lesson, chapter help, and exercise](examples/python-to-cpp/preview.png)

Clone the repository and open the example’s `docs/index.html` directly in a browser. The example includes a C++17 skeleton and a Python 3 test runner. The starter intentionally fails cases that require a path.

## Install and use

From the root of a project that uses Codex:

```sh
mkdir -p .agents/skills
git clone https://github.com/Uniaut/create-html-textbook.git .agents/skills/create-html-textbook
```

Then invoke the skill with a request like this:

> $create-html-textbook I solve BOJ problems up to Platinum V in Python. Build an offline HTML textbook to help me prepare for coding tests in C++17, targeting Gold V. Give me starter code and tests for the exercises.

A follow-up that exercises the branching workflow:

> $create-html-textbook I’m stuck on const T& in the grid BFS chapter. Add a follow-up chapter that explains references and copies.

Reading and navigation work offline. Opening an AI provider requires a connection and sends the chapter topics or selected text and nearby context to the chosen provider.

## Repository layout

| Path | Purpose |
| --- | --- |
| [SKILL.md](SKILL.md) | Skill discovery metadata and the creation, branching, and verification workflows |
| [assets/](assets/) | CSS and JavaScript copied into generated textbooks |
| [scripts/](scripts/) | Python 3 local-link checker |
| [examples/python-to-cpp/](examples/python-to-cpp/) | Sample textbook, exercise, and screenshot |

The directory and frontmatter follow the [Agent Skills specification](https://agentskills.io/specification). The root README provides installation and examples for readers, while the skill instructions are kept in SKILL.md.

## Verify the example

```sh
python3 scripts/verify_links.py examples/python-to-cpp/docs
```
