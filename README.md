# Create HTML Textbook

한국어 · [English](README.en.md)

> 우리보다 그들이 현명하고 노련해질 수 있다는 사실을 받아들이고 나면
> 우리가 얼마나 큰 힘을 가지고 있는지 알게된다.
>
> 우리는 우리의 스승을 만들 수있는 유일한 종이 되었다는 것을.
>
> — [반-바지., 《둘이서 추는 춤》](https://x.com/bahnbazi/status/953307342921060352)

학습자의 배경에 맞춰 오프라인 HTML 교과서를 만들고, 막히는 개념을 보충 장으로 추가하는 에이전트 스킬입니다. 이미 아는 내용은 건너뛰고, 실습에는 코드 뼈대와 실행 가능한 테스트를 제공합니다.

## 예제 · Python에서 C++ 코딩 테스트로

Python으로 백준 플래티넘 V까지 풀어 본 학습자가 C++17로 골드 V 수준의 문제를 풀 수 있도록 구성한 예제입니다. [학습 안내](examples/python-to-cpp/docs/index.html)에서 시작해 [격자 BFS 실습](examples/python-to-cpp/docs/lessons/ch1-grid-bfs.html)을 해보고, `const T&`가 낯설다면 [참조와 복사 보충 장](examples/python-to-cpp/docs/lessons/ch1-1-const-reference.html)으로 이어서 읽을 수 있습니다.

![밝은 테마의 격자 BFS 실습 화면. 왼쪽 목차에 참조와 복사 보충 장이 있고 본문에 챕터 도움말과 실습 명령어가 보인다.](examples/python-to-cpp/preview.png)

저장소를 내려받은 뒤 `examples/python-to-cpp/docs/index.html`을 브라우저에서 열면 됩니다. C++17 코드 뼈대와 Python 3 테스트 실행기가 포함되어 있습니다. 경로가 있는 입력은 BFS를 구현해야 테스트를 통과합니다.

## 설치와 사용

Codex나 Claude Code에 아래 요청을 붙여 넣으세요.

> https://github.com/Uniaut/create-html-textbook 저장소의 `create-html-textbook` 스킬을 설치해줘.

교과서를 처음 만들 때는 현재 수준과 목표를 알려주세요.

> $create-html-textbook Python으로 백준 플래티넘 V까지 풀어 봤어. C++17로 골드 V 수준의 코딩 테스트를 준비할 수 있게 오프라인 HTML 교과서를 만들어 줘. 실습은 코드 뼈대와 테스트로 구성해 줘.

읽다가 막히면 어느 장의 어떤 개념인지 알려주세요.

> $create-html-textbook 격자 BFS 장에서 const T&가 왜 필요한지 모르겠어. 참조와 복사를 비교하는 보충 장을 추가해 줘.

본문과 목차는 오프라인에서 사용할 수 있습니다. AI 도움말로 외부 서비스를 열 때는 인터넷 연결이 필요하며, 장 제목과 절 제목 또는 선택한 문장과 주변 문맥이 해당 서비스로 전달됩니다.

## 저장소 구조

| 경로 | 역할 |
| --- | --- |
| [SKILL.md](SKILL.md) | 스킬 검색용 메타데이터와 교과서 작성·보충·검증 절차 |
| [assets/](assets/) | 교과서에 복사할 CSS와 JavaScript |
| [scripts/](scripts/) | Python 3 로컬 링크 검사기 |
| [examples/python-to-cpp/](examples/python-to-cpp/) | 예제 교과서, 실습 코드, 스크린샷 |

스킬 폴더와 `SKILL.md`의 메타데이터는 [Agent Skills 공식 명세](https://agentskills.io/specification)를 따릅니다.

## 예제 검증

```sh
python3 scripts/verify_links.py examples/python-to-cpp/docs
```
