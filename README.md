<div align="center">

# hompage

**Personal homepage / homelab portal** — dark dashboard with portfolio + homelab-console aesthetic.

[![CI](https://github.com/yule-studio/hompage/actions/workflows/ci.yml/badge.svg)](https://github.com/yule-studio/hompage/actions/workflows/ci.yml)
[![Deploy](https://github.com/yule-studio/hompage/actions/workflows/deploy.yml/badge.svg)](https://github.com/yule-studio/hompage/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%E2%89%A520.x-339933?logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-5.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-18.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)

</div>

---

## Overview

`hompage` 는 개인 홈페이지 + 홈서버 포털을 한 사이트로 묶은 정적 웹 앱이다.
9 개의 페이지로 구성되며, 각 페이지는 데이터 파일 (`src/data/*.ts`) 을 읽어
재사용 컴포넌트로 렌더링된다.

- **다크 테마 기본** · 도트 그리드 배경 · 초록색 accent
- **얇은 border / 작은 mono 라벨 / muted text** — 포트폴리오 + 홈랩 콘솔 조합
- **dense grid + per-card span** 으로 카드 사이 빈 공간 제거
- **밀착된 pill nav** — 항목 간격 2px / padding 6·12px / active 동일 높이 유지
- **다크 ↔ 라이트** 토글 (localStorage 기억, flash 방지)
- **외부 CDN 의존 0** — 폰트 / 아이콘 모두 system stack + inline SVG

## Pages

| route | summary |
| --- | --- |
| `/`         | Home — 전체 페이지의 요약 dashboard |
| `/projects` | Projects — active / shipped / paused / archived 카드 |
| `/skills`   | Skills — 그룹별 기술 + 자기평가 막대 |
| `/awards`   | Awards |
| `/certs`    | Certs — 자격증 (active / in-progress / expired) |
| `/homelab`  | Homelab — Proxmox / k3s 호스트 + 서비스 status |
| `/calendar` | Calendar — ship / talk / stream / 점검 |
| `/blog`     | Blog — 글 카드 (현재 데이터 파일) |
| `/contact`  | Contact — email / github / 협업 가능 항목 |

각 데이터는 `src/data/` 의 TypeScript 파일에서 export 된다. 외부 API / CMS 없이도 그대로 빌드된다.

## Quick start

```bash
git clone https://github.com/yule-studio/hompage.git
cd hompage
npm install
npm run dev        # http://localhost:5173
```

다른 스크립트:

```bash
npm run build      # 정적 빌드 → dist/
npm run preview    # 빌드 결과 로컬 서빙 (http://localhost:4173)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

요구 사항: **Node 20+**, npm 10+.

## Directory layout

```
.
├── public/                    정적 자산 (favicon 등)
├── src/
│   ├── components/            재사용 UI
│   │   ├── Layout/            전체 layout (topbar + nav + main + footer)
│   │   ├── Topbar/            브랜드 + 테마 토글 + 외부 링크
│   │   ├── Navigation/        pill nav (NavLink 기반 active 표시)
│   │   ├── Card/              카드 (data-span 으로 12-col grid 위치 제어)
│   │   ├── SectionHeader/     페이지 내부 sub-section header
│   │   ├── StatusBadge/       상태 뱃지 (ok / warn / err / info / muted)
│   │   └── TerminalCard/      터미널 풍 카드 (Home / Contact 에서 사용)
│   ├── pages/                 9 개 페이지
│   │   ├── Home/  Projects/  Skills/  Awards/  Certs/
│   │   └── Homelab/  Calendar/  Blog/  Contact/  NotFound.tsx
│   ├── data/                  임시 데이터 (TypeScript export)
│   │   ├── profile.ts
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   ├── awards.ts
│   │   ├── certs.ts
│   │   ├── homelab.ts
│   │   ├── posts.ts
│   │   └── events.ts
│   ├── styles/                전역 스타일 (CSS 만 — no Tailwind)
│   │   ├── tokens.css         디자인 토큰 (CSS variables)
│   │   ├── globals.css        reset + 기본 typography
│   │   └── layout.css         topbar / nav / grid / card / badge / terminal
│   ├── App.tsx                라우팅
│   └── main.tsx               엔트리
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             lint + typecheck + build (PR + main push)
│   │   └── deploy.yml         GitHub Pages 배포 (main push)
│   ├── ISSUE_TEMPLATE/        bug / feature
│   └── PULL_REQUEST_TEMPLATE.md
├── index.html                 인라인 theme bootstrap 포함 (flash 방지)
├── vite.config.ts
├── tsconfig.json (+ app / node)
├── .eslintrc.cjs
├── .gitignore
├── LICENSE                    MIT
└── README.md
```

## Design tokens

`src/styles/tokens.css` 가 단일 진실의 원천 (SSoT).

```css
/* core */
--bg / --bg-elevated / --bg-card / --bg-pill        /* surface */
--text / --text-muted / --text-faint / --text-inverse
--border / --border-strong / --border-accent
--accent (#4ade80) / --accent-soft / --accent-strong

/* status */
--ok / --warn / --err / --info

/* spacing */
--space-1 .. --space-10
--radius-sm/md/lg/pill

/* type */
--font-sans / --font-mono / --text-xs..3xl / --tracking-mono / --tracking-label

/* layout */
--container-max (1180px) / --container-pad / --topbar-h / --nav-h
--dot-color / --dot-size / --dot-spacing            /* dot grid bg */
```

테마 전환은 `<html data-theme="light">` 또는 `"dark"`. `Topbar` 컴포넌트가 `localStorage["yule.theme"]` 에 보존한다.

## Design / layout decisions

원본 디자인의 자잘한 문제를 다음과 같이 정정했다.

| 원래 문제 | 본 구현의 해결 |
| --- | --- |
| 카드 배치에 큰 빈 공간 (특히 오른쪽 / 중간) | **12-col CSS grid + `grid-auto-flow: dense`** + 카드 별 `data-span` (sm/md/lg/xl/wide/tall) — 빈 칸이 생기면 다음 카드가 back-fill |
| nav 항목 간격 / active pill 크기 어색 | `nav-pill` 안 2px gap + `6px / 12px` padding. active 도 동일 effective 높이 (border 1px 보상 padding `5px / 11px`) |
| 카드 폭·높이 제각각 → 어색한 빈 칸 | 모든 span 이 96px row 단위로 정렬. mobile 에서는 4-col / 88px row 로 자동 조정 |
| Home 첫 viewport 정보 밀도 부족 | KPI row + terminal preview + status + 4 카드 (active / posts / events / now stack) 가 1 viewport 안에 들어오게 span 설계 |
| 모바일에서 nav / 카드 겹침 | nav 가로 스크롤 + breakpoint 별 grid columns 축소 (12 → 8 → 4) |
| 카드 안 텍스트 답답 | line-clamp 대신 `overflow: ellipsis` + `min-width: 0` flex item 처리 |

## Accessibility

- semantic HTML — `<header>` `<nav aria-label="Primary">` `<main>` `<footer>` `<article>`
- skip link — Tab 첫 입력 시 "본문으로 건너뛰기"
- focus state — 전역 `:focus-visible { outline: 2px solid var(--accent) }`
- aria-label — 아이콘 버튼 / nav / card
- color-only 의존 X — status 는 dot + label 동시
- theme 토글 라벨이 동작 결과를 진술

## CI / CD

- **`.github/workflows/ci.yml`** — `npm ci` → `npm run lint` → `npm run typecheck` → `npm run build`. PR 과 main push 모두 실행. main push 시 `dist/` artifact 업로드 (7 day).
- **`.github/workflows/deploy.yml`** — main push 시 GitHub Pages 로 자동 배포. 첫 배포 전 repo Settings → Pages → "Build and deployment" Source 를 **GitHub Actions** 로 변경 필요.

## Adding content

1. `src/data/<category>.ts` 의 export 배열에 한 항목 추가.
2. 컴포넌트 / 페이지 코드 변경 0 — 자동 반영.
3. `npm run dev` 로 확인 후 PR.

신규 카테고리 / 페이지가 필요하면:
1. `src/data/<new>.ts` 작성.
2. `src/pages/<New>/<New>.tsx` 작성.
3. `src/App.tsx` 에 라우트 1 줄 추가.
4. `src/components/Navigation/Navigation.tsx` 의 `ITEMS` 에 1 줄 추가.

## Contributing

이 레포는 1 인 개인 사이트지만 PR 환영. 다음을 지켜주세요.

- 한국어 commit 메시지 + gitmoji + `변경 이유 / 주요 변경 사항 / 비고` 3 섹션
- PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 의 섹션을 따라
- `npm run lint && npm run typecheck && npm run build` 모두 통과해야 review

## License

MIT — [LICENSE](LICENSE).
