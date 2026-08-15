/** Long-form content shown when an activity is opened — laid out as an article. */
export type ActivityDetail = {
  /** e.g. "광주소프트웨어마이스터고등학교" */
  org?: string;
  /** short key/value facts printed under the title */
  facts?: { label: string; value: string }[];
  /** lead paragraph */
  summary: string;
  /** opening photograph */
  hero?: { src: string; alt: string; caption?: string };
  /** body, in order — a section may open with its own figure */
  sections?: {
    heading: string;
    figure?: { src: string; alt: string; caption?: string };
    body: string[];
    /** bulleted items rendered after the paragraphs */
    list?: string[];
  }[];
  /**
   * A deck read page by page — presentation slides, a scanned report, anything
   * that only makes sense in order. Rendered as a swipeable strip rather than a
   * stack of figures, so a 20-slide deck costs one screen instead of twenty.
   *
   * Slides go in as images. Embedding a PDF means an <iframe> the phone will
   * not scroll and a few megabytes before the first pixel; exported pages are
   * just pictures, and the popup already knows how to size those.
   */
  deck?: {
    heading?: string;
    /** one line above the strip — what this deck is and where it came from */
    note?: string;
    slides: { src: string; alt: string; caption?: string }[];
  };
  /**
   * Original files offered for download — the deck as authored, a report, a
   * document. Served straight from `public/docs/`, so adding one is a file
   * copy plus a line here.
   */
  downloads?: {
    heading?: string;
    note?: string;
    items: { label: string; url: string; meta?: string }[];
  };
  /** embedded YouTube clip */
  video?: { id: string; title: string; heading?: string; caption?: string };
  /**
   * A clip served from `public/` rather than YouTube — for recordings that
   * were never published anywhere, and shouldn't be just to embed them.
   */
  clip?: { src: string; poster?: string; heading?: string; caption?: string };
  /** heading above the link block */
  linksHeading?: string;
  links?: { label: string; url: string; note?: string }[];
};

export type Activity = {
  /** display period, exactly as written on the record (single date or range) */
  period: string;
  title: string;
  /** sort key — YYYYMMDD of the start date */
  at: number;
  /**
   * Highlighted on the source record (the yellow rows) — those are the entries
   * kept with a detail link. Add `url` as those links become available; until
   * then they just read in accent.
   */
  highlight?: boolean;
  url?: string;
  /** present → the row is clickable and opens a detail popup */
  detail?: ActivityDetail;
};

/**
 * 주요 활동 이력 — 교육·캠프·컨퍼런스·스터디 기록. Sorted oldest first; the
 * About section flows them into two dense columns.
 */
export const activities: Activity[] = [
  {
    at: 20210301,
    period: "2021.03 – 2023.02",
    title: "모바일 로보틱스",
    highlight: true,
    detail: {
      org: "광주소프트웨어마이스터고등학교 · 전공 동아리",
      facts: [
        { label: "종목", value: "자율주행 로봇 · 2인 1팀" },
        { label: "기간", value: "2021.03 – 2023.02 (2년)" },
        { label: "제어", value: "C언어" },
        { label: "성과", value: "지방기능경기대회 장려상" },
      ],
      // emphasis lives in the lead only — the sections below read plain
      summary:
        "모바일 로보틱스는 정해진 자리에 고정된 산업용 로봇과 달리, ==스스로 자기 위치를 " +
        "파악하고 움직이며== 주어진 일을 끝내는 로봇을 다루는 종목이다. ==2인 1팀==으로 로봇을 " +
        "조립하고, ==C언어==로 제어 프로그램을 짜고, 경기장에서 터지는 문제까지 직접 " +
        "잡아내야 한다. 2년간 이 종목을 훈련해 ==지방기능경기대회에서 장려상==을 받았다.",
      hero: {
        src: `${import.meta.env.BASE_URL}assets/mobile-robotics.png`,
        alt: "그리퍼로 노란 공을 집은 모바일 로보틱스 경기용 로봇",
        caption: "경기용 로봇. 옴니휠 구동부 위에 제어 보드와 그리퍼가 올라간다.",
      },
      sections: [
        {
          heading: "모바일 로봇은 무엇이 다른가",
          body: [
            "공장의 로봇 팔은 바닥에 고정되어 있다. 좌표를 주면 그 자리에서 팔만 움직인다. " +
              "반면 모바일 로봇은 몸 전체가 움직여야 하고, 그래서 '지금 내가 어디에 있는가' 를 " +
              "스스로 알아야 한다.",
            "이 질문 하나가 종목 전체를 만든다. 센서로 주변을 읽고(인식), 읽은 값으로 현재 " +
              "위치와 다음 행동을 정하고(판단), 모터를 굴려 움직이고(구동), 그리퍼로 " +
              "목표물을 다룬다(조작). 네 가지가 동시에 맞아야 과제가 끝난다.",
            "로봇이 몇 밀리미터만 잘못 서 있어도 집기에 실패하고, 바퀴 하나의 출력만 " +
              "어긋나도 로봇 전체가 틀어진다. 조명이 바뀌면 같은 물체도 다른 센서 값으로 " +
              "들어온다. 그래서 센서 값을 그대로 믿지 않고 보정해서 쓴다.",
          ],
        },
        {
          heading: "과제는 이렇게 주어진다",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/mr-field.png`,
            alt: "모바일 로보틱스 경기장 도면",
            caption: "경기장 도면. 구역과 벽, 블록 위치가 좌표처럼 주어진다.",
          },
          body: [
            "선수가 받는 건 로봇 한 대와 종이 세 장이다. 경기장 도면, 동작 조건, 그리고 " +
              "채점표. 이 세 장을 어떻게 읽느냐가 그날의 설계를 결정한다.",
            "도면은 지도이자 제약이다. 구역이 어디서 나뉘고 벽이 어디에 서 있는지, 블록이 " +
              "어느 자리에 놓이는지가 여기서 정해진다. 다만 도면이 알려주는 건 '무엇이 " +
              "어디 있는가' 까지고, 그 사이를 어떻게 지나갈지는 알려주지 않는다.",
            "이 종목은 정확과 신속이 생명이다. 제한 시간 안에 조건을 정확히 수행하고 " +
              "출발점으로 돌아와야 한 과제가 끝난다. 시간이 남아도 조건 하나를 놓치면 " +
              "점수가 빠지고, 조건을 다 채워도 복귀하지 못하면 마찬가지다.",
          ],
        },
        {
          heading: "조건 — 로봇이 지켜야 할 규칙",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/mr-conditions.png`,
            alt: "과제의 동작 조건 문서",
            caption: "동작 조건. 통과 방향, 블록 색과 경로의 대응, 처리 방식이 규정된다.",
          },
          body: [
            "동작 조건은 '이렇게 하면 인정한다' 와 '이렇게 하면 인정하지 않는다' 의 목록이다. " +
              "예를 들어 구역을 통과할 때 어느 색 블록이 어느 통로를 뜻하는지, 블록을 " +
              "센서로 찔러 처리해야 하는지 회전으로 밀면 안 되는지가 여기서 갈린다.",
            "이 목록이 곧 알고리즘의 분기다. 색을 읽어 통로를 고르는 판단, 통과 방향을 " +
              "지키는 순서, 처리 방식이 인정되는 동작 — 조건 하나가 코드의 조건문 하나로 " +
              "그대로 내려온다. 그래서 조건을 다 읽기 전에는 코드를 시작하지 않는다.",
            "조건에 적히지 않은 것은 선수가 유리한 방식으로 정해도 된다. 규정된 부분과 " +
              "열려 있는 부분을 갈라내는 것이 설계의 첫 단추다.",
          ],
        },
        {
          heading: "채점표 — 어디에 시간을 쓸지 정하는 표",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/mr-scoring.png`,
            alt: "과제의 채점표",
            caption: "채점표. 과제수행점수와 시간점수로 나뉘고, 감점 항목이 따로 있다.",
          },
          body: [
            "채점표는 총점이 과제수행점수와 시간점수로 나뉘고, 각 동작에 몇 점이 붙는지, " +
              "무엇을 하면 감점인지를 항목별로 적어둔다. 시간점수는 과제수행점수가 일정 " +
              "기준을 넘긴 팀에게만 주어진다.",
            "여기서 전략이 갈린다. 배점이 큰 동작과 배점이 작은 동작을 같은 비중으로 " +
              "다루면 시간을 잃는다. 감점 항목은 더 중요하다 — 잘못 건드리면 얻은 점수를 " +
              "도로 뱉는 동작이 있어서, 위험한 동작은 아예 시도하지 않는 편이 나은 경우도 " +
              "있다.",
            "그래서 설계는 도면에서 경로를 뽑고, 조건에서 분기를 뽑고, 채점표에서 " +
              "우선순위를 뽑는 순서로 간다. 세 장이 모여야 '무엇을 먼저, 어디까지 할지' 가 " +
              "정해진다.",
          ],
        },
        {
          heading: "과제를 푸는 순서",
          body: [
            "① 과제 분석 — 무엇을 어디로 옮겨야 하는지, 어떤 항목이 몇 점인지 먼저 나눈다. " +
              "배점이 큰 동작과 실패 위험이 큰 동작을 갈라두면 시간을 어디에 쓸지가 정해진다.",
            "② 경로 설계 — 최단 경로가 아니라 실패하지 않는 경로를 고른다. 회전이 많을수록 " +
              "오차가 쌓이므로 회전 횟수를 줄이고, 라인이나 벽처럼 위치를 다시 맞출 수 있는 " +
              "기준점을 중간중간 지나가도록 짠다.",
            "③ 기본 코드 위에 얹기 — 이동 · 정지 · 회전 · 그리퍼 같은 기본 동작은 공통 코드로 " +
              "두고, 과제마다 그 위에 필요한 로직만 변형해서 확장한다. 매번 처음부터 짜지 " +
              "않으니 남은 시간을 그 과제에만 쓸 수 있다.",
            "④ 반복 주행 — 같은 코드도 바닥 상태 · 조명 · 배터리 잔량에 따라 결과가 달라진다. " +
              "수십 번 돌리면서 어긋나는 지점을 찾아 파라미터를 잡는다. 한 번 성공한 코드는 " +
              "성공이 아니라, 열 번 중 열 번 성공해야 성공이다.",
            "⑤ 현장 대응 — 경기장에서는 훈련장과 다른 조건이 반드시 하나는 나온다. 이때는 " +
              "코드를 새로 짜는 게 아니라 원인을 빠르게 좁히는 게 전부다. 센서인지, 구동인지, " +
              "위치 추정인지부터 가른다.",
          ],
        },
        {
          heading: "훈련일지 — 남은 건 기록이었다",
          body: [
            "훈련한 날은 그날 무엇을 했는지 반드시 기록해야 했다. 평일에는 아침 7시 30분부터 " +
              "9시까지, 주말에는 9시 30분부터 오후 3시까지 훈련하고 그 내용을 남겼다. " +
              "2021년 10월부터 쌓인 기록이 지금도 그대로 있다.",
            "이때 생긴 기록하는 습관이 2년의 훈련에서 가장 오래 남았다. 지금 쓰는 노션 " +
              "블로그도 여기서 이어진 것이고, 무엇을 했는지 눈에 보이는 형태로 남기는 방식은 " +
              "이후 작업에도 그대로 쓰고 있다.",
          ],
        },
        {
          heading: "2년이 남긴 것",
          body: [
            "2년간 훈련은 힘들었고 그만두고 싶은 순간도 여러 번 있었다. 그 순간들을 넘기면서 " +
              "얻은 건 결과보다 과정 쪽이었다. 2인 1팀으로 뛰는 종목이라 협업과 책임감이 " +
              "곧 점수였고, 그 감각이 지금 일하는 방식에도 남아 있다.",
          ],
        },
      ],
      video: {
        id: "qCW-3tiC4H0",
        title: "2021 충북 2과제",
        heading: "과제 영상",
        caption: "실제 과제 수행 주행. 로봇이 목표물을 찾아 집고 지정 위치로 옮긴 뒤 출발점으로 돌아온다.",
      },
      linksHeading: "노션 링크",
      links: [
        {
          label: "Club Robotics — 활동 정리",
          url: "https://yuchan-log.notion.site/Club-Robotics-1f9e393caf8a80659d88c2f7204c631b",
          note: "종목 소개, 지역별 과제 정리, 대회 후기까지 모아둔 문서.",
        },
        {
          label: "훈련일지 (Notion)",
          url: "https://yuchan-log.notion.site/8b8e393caf8a829a8a0d01799afbd011?v=22ee393caf8a82dd9b3708dd64036abb",
          note: "훈련한 날마다 남긴 기록. 2021년 10월부터의 2년치가 그대로 남아 있다.",
        },
      ],
    },
  },
  { at: 20210401, period: "2021.04 – 2021.06", title: "전자응용하드웨어개발(자동화설비공업고등학교 교환학습)" },
  { at: 20210501, period: "2021.05", title: "Ai 전공 캠프" },
  { at: 20210701, period: "2021.07", title: "Sweet 2021 신재생 에너지 전시회" },
  { at: 20210702, period: "2021.07", title: "여름방학 전공캠프(HTML+CSS+JS)" },
  { at: 20210901, period: "2021.09", title: "교내 취업역량 강화 캠프(인공지능, 스마트IOT)" },

  { at: 20220301, period: "2022.03", title: "학교간 공동교육과정 광주공고 공동실습소(전자공고 교환학습)" },
  { at: 20220601, period: "2022.06", title: "학기 중 전공캠프(딥러닝)" },
  { at: 20220801, period: "2022.08", title: "여름방학 전공캠프(React)" },
  { at: 20220901, period: "2022.09", title: "SW 마이스터고 4개교 연합 토크 콘서트" },
  { at: 20221101, period: "2022.11", title: "파이썬 드론 교육" },
  { at: 20221102, period: "2022.11", title: "2022 디지털미디어테크쇼 & 컨퍼런스" },
  { at: 20221205, period: "2022.12.05", title: "광주은행(금융 IT) 특강" },
  { at: 20221206, period: "2022.12.06", title: "솔트웨어 AWS 특강" },

  { at: 20230314, period: "2023.03.14", title: "여보야 기업 탐방" },
  { at: 20230410, period: "2023.04.10", title: "두잇 강연 및 채용설명회" },
  { at: 20230427, period: "2023.04.27", title: "지역인재 합동 채용 설명회" },
  {
    at: 20231101,
    period: "2023.11 – 2023.12",
    title: "에티포스 현장 실습",
    highlight: true,
    detail: {
      org: "㈜에티포스 (ETTIFOS) · SW 2팀",
      facts: [
        { label: "형태", value: "학교 MOU 현장실습 → 인턴형 일경험" },
        { label: "기간", value: "2023.11.01 – 2023.12.29" },
        { label: "소속", value: "SW 2팀" },
        { label: "분야", value: "5G 기반 V2X 통신" },
        { label: "과제", value: "소켓 프로그래밍 랭킹 시스템" },
        { label: "멘토 평가", value: "종합 32 / 35" },
      ],
      summary:
        "학교가 MOU를 맺은 기업에서 ==두 달간 현장실습==을 했다. 5G 기반 ==V2X 통신== " +
        "솔루션을 만드는 회사의 ==SW 2팀==에 소속되어, 회사가 파는 기술을 배우는 한편 " +
        "==C와 소켓으로 직접 만드는 과제==를 받아 최종 발표까지 마쳤다.",
      hero: {
        src: `${import.meta.env.BASE_URL}assets/ettifos-welcome.jpg`,
        alt: "에티포스 사무실 입구에 붙은 현장실습 환영 안내문 앞에 선 모습",
        caption: "첫 출근일, 사무실 입구에 붙어 있던 환영 안내문. 2023년 11월 1일.",
      },
      sections: [
        {
          heading: "에티포스는 어떤 회사인가",
          body: [
            "2018년에 설립된 회사로, 5G 기술을 바탕으로 V2X 통신 솔루션을 만든다. " +
              "'Connected in Motion' 이라는 문장 그대로, 도로 위에서 움직이는 모든 것을 " +
              "연결하는 것을 목표로 한다.",
            "회사가 말하는 지향점은 교통사고와 불필요한 탄소배출이 없는 도로, 그리고 완전한 " +
              "자율주행이 가능한 환경이다. 본사는 경기 성남에 있고 북미 법인은 미국 " +
              "새너제이에 있다.",
          ],
        },
        {
          heading: "V2X — 도로 위의 모든 것을 연결한다",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ettifos-v2x-map.png`,
            alt: "운전자를 중심으로 차량 · 인프라 · 보행자 · 기지국이 연결된 V2X 구성도",
            caption: "내가 운전자인 상황에서 무엇과 무엇이 이어지는지. 이 그림 하나가 약어 전부를 설명한다.",
          },
          body: [
            "V2X(Vehicle-to-Everything)는 차량과 보행자, 신호등 같은 도로 인프라를 서로 " +
              "잇는 무선 통신 기술이다. 원래는 교통사고 예방을 목적으로 출발했지만, 지금은 " +
              "자율주행과 맞물린 여러 서비스로 넓어지고 있다.",
            "차가 스스로 보는 범위에는 한계가 있다. 앞차에 가려진 상황, 커브 너머의 사고, " +
              "아직 보이지 않는 작업 구간은 센서만으로는 알 수 없다. V2X 는 그 정보를 " +
              "'보기 전에 전달받는' 방식으로 메운다. 그래서 자율주행 시대의 기반 인프라로 " +
              "이야기된다.",
            "약어가 많아 보이지만 기준은 하나다. **내 차를 가운데 두고, 상대가 누구냐**로 " +
              "이름이 갈릴 뿐이다.",
          ],
          list: [
            "V2V — 차량과 차량",
            "V2I — 차량과 도로 인프라(신호등 · 노변 기지국)",
            "V2P — 차량과 보행자",
            "V2N — 차량과 네트워크(기지국)",
            "V2D · V2H · V2G — 차량과 장치 · 집 · 전력망",
          ],
        },
        {
          heading: "다섯 주가 어떻게 짜여 있었나",
          body: [
            "실습은 즉흥이 아니었다. 주차별로 무엇을 배우고 무엇을 만들지가 미리 정해져 " +
              "있었고, 담당 부서까지 표에 적혀 있었다. 학교에서 받던 과제와 가장 크게 " +
              "달랐던 점이 이것이다 — **배우는 것과 만드는 것이 한 줄로 이어져 있었다.**",
            "2주차에 남의 코드를 읽고, 3주차에 회사가 파는 기술을 배우고, 4주차에 그 둘을 " +
              "합쳐 직접 만들었다. 순서가 곧 설계였다.",
          ],
          list: [
            "1주차 (11.01–11.04) — 기업 · 업무 소개, 4대 보험 교육 · 지원관리팀",
            "2주차 (11.06–11.10) — 예제 소스 코드 분석, 확장 기능 개발 · SW2",
            "3주차 (11.13–11.17) — ETTIFOS 소개(CV2X · DSRC · C-ITS · OBU · RSU), TCP/UDP 이해",
            "4주차 (11.20–11.24) — TCP/UDP 소켓 프로그래밍, 랭킹 시스템 개발",
            "5주차 (11.27–11.30) — 최종 발표 자료 작성",
          ],
        },
        {
          heading: "과제 ① 남의 코드부터 읽었다",
          body: [
            "처음 받은 과제는 무언가를 만드는 것이 아니라 **이미 있는 코드를 읽는 것**이었다. " +
              "C로 짜인 Snake 게임 소스를 분석하고, 어떻게 동작하는지 정리해 발표했다.",
            "환경부터 새로 잡았다. WSL 위에 Ubuntu 를 올리고 VS Code 를 붙였다. 학교에서는 " +
              "대개 IDE 하나로 끝났는데, 여기서는 리눅스 환경 자체가 과제의 일부였다.",
            "읽고 나서는 기능을 덧붙였다. 남이 짠 구조 안에서 무언가를 늘려보는 일은 " +
              "빈 파일에서 시작하는 것과 전혀 다른 종류의 어려움이었다. 어디를 건드리면 " +
              "어디가 깨지는지를 먼저 알아야 했다.",
          ],
        },
        {
          heading: "과제 ② Snake 게임에 랭킹 서버를 붙이다",
          body: [
            "읽은 코드를 **서버-클라이언트 구조로 확장**하는 것이 본 과제였다. 게임은 그대로 " +
              "두고, 점수를 서버에 보내 순위를 매기고 다시 받아오는 랭킹 시스템을 만들었다. " +
              "Ubuntu · C · ncurses · TCP 소켓이 재료였다.",
            "**자료구조가 장식이 아니었다.** 뱀의 몸통은 이중 연결 리스트와 큐로 표현했다 — " +
              "머리가 나아가면 enqueue, 꼬리가 빠지면 dequeue. 자료구조 수업에서 외우던 " +
              "동작이 화면 위에서 그대로 움직이는 걸 처음 봤다.",
            "랭킹은 파일에 쌓고 읽을 때 정렬해 넣는 방식으로 처리했다. `fopen()` 으로 " +
              "순위 파일을 열고 한 줄씩 읽으면서 `insert_sorted()` 로 연결 리스트에 끼워 " +
              "넣은 뒤, 완성된 순위를 문자열로 만들어 클라이언트에 보냈다.",
            "만들고 나서야 보이는 구멍도 있었다. 점수가 0인 판까지 순위에 올라가길래 " +
              "0점은 기록에서 빼도록 고쳤다. 요구사항에 없던, 돌려보다 발견한 문제였다.",
          ],
        },
        {
          heading: "TCP 를 고른 이유를 설명해야 했다",
          body: [
            "소켓을 쓰는 것보다 어려웠던 건 **왜 TCP 인지 말하는 것**이었다. 전송 계층이 " +
              "무엇을 책임지는 자리인지부터 정리해야 답이 나왔다.",
            "전송 계층이 푸는 문제는 두 가지다. **흐름(Flow)** — 보내는 쪽이 받는 쪽보다 " +
              "빠르면 수신자가 감당하지 못한다. **혼잡(Congestion)** — 중간 네트워크가 " +
              "막히면 순서대로 보낸 것이 순서대로 도착하지 않는다. 랭킹 데이터는 순서가 " +
              "틀리면 그대로 틀린 순위가 되므로 TCP 쪽이었다.",
            "서버와 클라이언트가 만나는 순서도 이때 손에 익었다. 서버는 " +
              "`socket() → bind() → listen() → accept()` 로 자리를 잡고 기다리고, " +
              "클라이언트는 `socket() → connect()` 로 그 주소를 두드린다. " +
              "`listen()` 의 대기열 크기가 '몇 명까지 기다리게 할 것인가' 라는 것도 " +
              "직접 값을 바꿔보고 나서 이해했다.",
          ],
        },
        {
          heading: "V2X AIR — 팀이 만들던 제품",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ettifos-v2x-air.jpg`,
            alt: "스마트폰과 BLE로 연결된 에티포스 V2X-AIR 단말",
            caption: "V2X-AIR. 차량 단말이 받은 V2X 정보를 BLE 로 스마트폰까지 넘긴다.",
          },
          body: [
            "소속된 SW 2팀이 다루던 제품이다. 차량에 실린 단말이 주변에서 오는 V2X 메시지를 " +
              "받고, 그 정보를 블루투스로 스마트폰에 넘겨 운전자가 실제로 볼 수 있는 형태로 " +
              "만든다.",
            "내가 이 제품 코드를 짠 건 아니다. 다만 팀이 무엇을 만들고 있는지가 보이니까 " +
              "따로 배우던 것들이 한 줄로 꿰어졌다. 단말과 앱 사이의 연결, 서버와 주고받는 " +
              "데이터, 그 안에 담기는 V2X 메시지 — 각각 소켓 · 비동기 통신 · V2X 용어라는 " +
              "이름으로 정리해둔 것들이었다.",
            "처음에는 기대만큼 걱정도 컸다. 경험이 부족한 상태로 적응할 수 있을지, 회사에서 " +
              "몫을 할 수 있을지 하는 고민이었다. 팀원분들과 멘토님이 적극적으로 도와주신 " +
              "덕분에 생각보다 빠르게 적응했고, 배우는 과정 자체를 즐길 수 있었다.",
          ],
        },
        {
          heading: "정리한 기록 ① 비동기 통신과 AJAX",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ettifos-doc-async.jpg`,
            alt: "동기 방식과 비동기 방식의 차이를 그린 도식",
            caption: "동기는 한 줄로 기다리고, 비동기는 요청을 걸어두고 다른 일을 이어간다.",
          },
          body: [
            "AJAX 는 페이지 전체를 새로 고치지 않고 서버와 데이터를 주고받는 방식이다. " +
              "동기 방식은 요청을 보내고 응답이 올 때까지 멈춰 있지만, 비동기는 요청을 " +
              "걸어두고 프로그램이 계속 돌아간다. 그래서 필요한 부분만 바꿔 그릴 수 있다.",
            "흐름은 단순하다. 사용자 동작이 자바스크립트를 부르고, XMLHttpRequest 로 서버에 " +
              "요청을 보내고, 서버가 JSON 이나 XML 로 응답하면 그 데이터로 화면의 일부만 " +
              "다시 그린다. 기다리는 동안 브라우저는 다른 일을 한다.",
            "한계도 같이 정리해뒀다. 시작이 항상 클라이언트의 요청이라, 서버가 먼저 밀어주는 " +
              "푸시 방식의 실시간 서비스는 이 방식만으로는 만들기 어렵다.",
          ],
        },
        {
          heading: "정리한 기록 ② 소켓",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ettifos-doc-socket.jpg`,
            alt: "클라이언트 소켓과 서버 소켓의 함수 호출 순서를 그린 도식",
            caption: "서버는 socket → bind → listen → accept, 클라이언트는 socket → connect.",
          },
          body: [
            "소켓은 프로세스가 네트워크로 데이터를 내보내고 받아들이는 창구다. 프로토콜과 " +
              "IP 주소, 포트 번호 세 가지로 하나의 소켓이 정해진다.",
            "서버는 소켓을 열고 주소에 묶은 뒤 대기열을 만들어 접속을 기다리고, 클라이언트는 " +
              "소켓을 열어 그 주소로 연결을 건다. 연결이 성립하면 양쪽이 서로 읽고 쓴다.",
            "TCP 는 순서와 오류를 보장하는 대신 오버헤드가 있어 큰 데이터에 맞고, UDP 는 " +
              "보장하지 않는 대신 가벼워 실시간 처리에 쓰인다. HTTP 가 요청이 있을 때만 " +
              "응답하고 끊는 단방향이라면, 소켓은 연결을 유지하는 양방향이다.",
          ],
        },
        {
          heading: "정리한 기록 ③ V2X 용어",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ettifos-doc-v2x-terms.jpg`,
            alt: "V2X 구성요소와 시나리오, 메시지를 정리한 노션 표",
            caption: "구성요소 · 시나리오 · 메시지 · 표준 · 단체로 나눠 정리한 용어 표.",
          },
          body: [
            "V2X 를 '대화' 로 놓고 용어를 나눠 정리했다. 누가 말하는가(구성요소), 어떤 " +
              "상황에서 말하는가(시나리오), 무엇을 말하는가(메시지), 어떤 방식으로 " +
              "말하는가(통신 방식) 로 갈라두면 낯선 약어들이 제자리를 찾는다.",
            "구성요소는 셋이다. 차량에 실리는 **OBU**(On-Board Unit), 도로변에 서는 " +
              "**RSU**(Road-Side Unit), 그리고 사고가 났을 때 가장 크게 다치는 쪽 — " +
              "보행자 · 자전거 · 이륜차를 묶은 **VRU**(Vulnerable Road User).",
            "메시지는 표준이 정해둔 문장이다. 차량 상태를 알리는 **BSM** 은 V2V 를 " +
              "대표하고, 신호가 몇 초 뒤에 어떻게 바뀌는지를 담는 **SPAT** 은 V2I 를 " +
              "대표한다. SPAT 이 있으면 사거리에서 앞차부터 순차로 출발하는 대신 " +
              "멈춰 있던 차들이 동시에 출발할 수 있다 — 메시지 하나가 도로의 동작을 " +
              "바꾸는 예라서 인상 깊었다.",
            "통신 방식은 두 갈래로 갈린다. **WAVE**(DSRC · IEEE 802.11p) 는 Wi-Fi 계열을 " +
              "고속 주행 환경에 맞게 고친 것이고, **C-V2X** 는 셀룰러 쪽에서 온 것이다. " +
              "둘 다 같은 5.9GHz ITS 대역을 쓰는데 왜 나뉘는지가 처음엔 이해가 안 돼 " +
              "기사까지 찾아봤다. 뿌리가 Wi-Fi 냐 LTE 냐의 차이였다.",
            "정리하다 걸린 구분이 하나 더 있다. **직접 통신과 네트워크 통신**은 기술이 " +
              "아니라 **누가 돈을 내느냐**로도 갈린다. WAVE · Sidelink 같은 직접 통신은 " +
              "ITS 대역을 쓰고 도로 이용자 누구나 무료로 쓰지만, V2N 처럼 기지국을 " +
              "거치는 네트워크 통신은 통신사 대역이라 가입자만, 통신비를 내고 쓴다. " +
              "표준 문서만 봐서는 안 보이던 부분이었다.",
            "이 표를 만들고 팀 앞에서 발표했다.",
          ],
          list: [
            "구성요소 — OBU · RSU · VRU",
            "시나리오 — V2V · V2I · V2P · V2N",
            "메시지 — BSM · PSM · SPAT · MAP · PVD · TIM",
            "표준 — DSRC / 802.11p / WAVE / ITS-G5, C-V2X / LTE-V2X / 5G-V2X",
            "단체 — IEEE · 3GPP · SAE · 5GAA · FCC · USDOT",
          ],
        },
        {
          heading: "멘토는 나를 이렇게 봤다",
          body: [
            "마지막 주에 최종 발표를 했고, 멘토가 SWOT 과 점수로 평가를 남겼다. 스스로 " +
              "쓴 회고가 아니라 **남이 본 나**라서, 지금 다시 읽어도 쓸모가 있다.",
            "강점으로 꼽힌 건 업무 파악과 실행 능력, C 이해도, 그리고 프로그래밍에 대한 " +
              "적극적인 자세였다. 반대로 **문서 작성 능력과 의사소통**이 보완점으로 " +
              "적혔다. 이건 변명할 게 없었다 — 아는 것을 남이 읽을 형태로 만드는 일이 " +
              "그때는 확실히 약했다.",
            "세부 평가는 7개 항목 35점 만점에 **32점**. 자기개발 · 책임감 · 적응력 · " +
              "성실성이 5점, 기획력 · 협조성 · 능동성이 4점이었다. 5점이 붙은 쪽은 " +
              "'열심히 했다' 에 가깝고, 4점이 붙은 쪽은 '먼저 제안하고 함께 끌고 가는' " +
              "능력이다. 그 구분이 정확하다고 생각했다.",
            "지적받은 두 가지를 그 뒤로 계속 붙잡고 있다. 지금 쓰고 있는 이 기록들도, " +
              "노션에 정리 습관을 이어가는 것도 결국 그때 받은 피드백의 연장선이다.",
          ],
        },
        {
          heading: "두 달 뒤",
          body: [
            "학교 현장실습은 11월에 끝났고, 12월은 인턴형 일경험 프로그램으로 이어져 " +
              "12월 29일자로 마무리됐다. 회사 사정으로 취업 연계까지는 가지 못해 다시 " +
              "광주로 돌아왔다.",
            "최종 발표 소감문에는 이렇게 적었다 — 처음에는 소켓 통신을 몰라 어려웠지만, " +
              "TCP 와 UDP 의 차이를 이해하고 장단점을 따져 프로토콜을 고르는 경험을 하며 " +
              "**동아리에서 하던 C 언어와는 다른 새로운 느낌**을 받았고, 어렵더라도 즐겁게 " +
              "배울 수 있었다고. 로봇을 움직이던 C 와 서버를 띄우는 C 가 같은 언어라는 게 " +
              "그때는 신기했다.",
            "실습 보고서의 향후 진로 계획란에는 네트워크 · 소켓 · 리눅스를 익혀 " +
              "**DevOps 쪽으로 가고 싶다**고 썼다. 지금 하는 일이 대체로 그쪽이니, 그 칸에 " +
              "적은 문장은 지켜진 셈이다.",
          ],
        },
      ],
      clip: {
        src: `${import.meta.env.BASE_URL}media/ettifos-snake-demo.mp4`,
        poster: `${import.meta.env.BASE_URL}media/ettifos-snake-demo.jpg`,
        heading: "실제로 돌아가는 화면",
        caption:
          "왼쪽이 게임, 오른쪽이 서버. 서버를 띄우면 Waiting.. 으로 대기하다가 " +
          "클라이언트가 붙는 순간 Client is connected. 가 찍힌다.",
      },
      deck: {
        heading: "남은 기록",
        note:
          "두 달을 증명하는 서류들. 출근부는 ==11월 22일 · 12월 20일, 결석 0일==로 " +
          "양쪽 다 출석률 100% 였다. 멘토 평가에서 성실성이 5점이었던 근거가 여기 있다.",
        slides: [
          {
            src: `${import.meta.env.BASE_URL}assets/ettifos-slide-demo.png`,
            alt: "Snake 게임 화면과 조작 방법을 설명한 발표 슬라이드",
            caption: "과제 ① 발표 슬라이드. 캐릭터 O, 아이템 @, 장애물 X, 점수는 초당 10점.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ettifos-report.png`,
            alt: "에티포스 현장실습 결과보고서(학생용) 문서",
            caption: "현장실습 결과보고서. 향후 진로계획란에 DevOps 라고 적혀 있다.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ettifos-attend-11.png`,
            alt: "11월 출근부의 일자별 근로시간 표",
            caption: "11월 출근부. 09:00–18:00, 22일 전부 출석.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ettifos-attend-12.png`,
            alt: "12월 출근부의 일자별 근로시간 표",
            caption: "12월 출근부. 마지막 근무일이 12월 29일로 찍혀 있다.",
          },
        ],
      },
      downloads: {
        heading: "자료 받기",
        note:
          "실습 중에 만든 발표 자료와 학교에 낸 보고서. 원본 그대로이고, " +
          "회사 템플릿과 대외비 표시가 남아 있다.",
        items: [
          {
            label: "인턴 최종 발표 자료",
            url: `${import.meta.env.BASE_URL}docs/ettifos-final-presentation.pptx`,
            meta: "PPTX · 24장 · 4.6MB",
          },
          {
            label: "과제 ① Snake 게임 소스 코드 분석",
            url: `${import.meta.env.BASE_URL}docs/ettifos-snake-analysis.pptx`,
            meta: "PPTX · 7장 · 0.4MB",
          },
          {
            label: "현장실습 결과보고서",
            url: `${import.meta.env.BASE_URL}docs/ettifos-practicum-report.docx`,
            meta: "DOCX · 20KB",
          },
        ],
      },
      linksHeading: "회사 링크",
      links: [
        {
          label: "에티포스 — 회사 소개",
          url: "https://www.ettifos.com/ko/company-aboutus",
          note: "5G 기반 V2X 통신 솔루션. 2018년 설립, 성남 · 새너제이.",
        },
        {
          label: "에티포스 LinkedIn",
          url: "https://www.linkedin.com/company/ettifos/",
          note: "회사 소식과 채용 공고가 올라오는 채널.",
        },
      ],
    },
  },

  {
    at: 20240610,
    period: "2024.06.10 – 2024.12.24",
    title: "LG 유플러스 유레카 SW 교육과정",
    highlight: true,
    detail: {
      org: "LG 유플러스 × 멀티캠퍼스 · 유레카 SW 교육과정 1기 (백엔드)",
      facts: [
        { label: "과정", value: "백엔드 · 1기" },
        { label: "기간", value: "2024.06.10 – 2024.12.24 (7개월)" },
        { label: "총 교육시간", value: "약 1,000시간" },
        { label: "장소", value: "멀티캠퍼스 선릉" },
        { label: "최종 프로젝트", value: "댕댕플레이스 · 7조(7DDAENG)" },
        { label: "수료 기준", value: "출석 80% 이상" },
      ],
      hero: {
        src: `${import.meta.env.BASE_URL}assets/ureca-graduation.jpg`,
        alt: "유레카 SW 교육과정 1기 수료식에서 수료증을 들고 찍은 단체 사진",
        caption: "1기 수료식. 2024년 12월, 7개월을 함께 통과한 사람들.",
      },
      summary:
        "LG 유플러스가 현업 수요에 맞춰 운영하는 ==SW 교육과정 1기== 백엔드 트랙이다. " +
        "7개월 동안 알고리즘부터 Spring, 배포까지 훑고 ==세 번의 프로젝트==로 매듭지었다. " +
        "문법으로만 알던 자바가 ==서비스를 만드는 도구==가 됐고, 마지막 프로젝트는 " +
        "==AWS 위에 올려 실제로 접속되는 상태==로 끝냈다.",
      sections: [
        {
          heading: "왜 유레카였는가",
          body: [
            "졸업하고 혼자 공부하면서 한계를 느꼈다. 무엇을 모르는지조차 혼자서는 잘 " +
              "드러나지 않았고, 방향이 맞는지 확인할 상대도 없었다. 다른 사람들과 지식을 " +
              "나누며 성장하고 싶어서 지원했다.",
            "면접에서도 같은 이야기를 했다. 이 답만큼은 자신 있게 말할 수 있었는데, 그건 " +
              "지어낸 이유가 아니라 그때 실제로 겪고 있던 문제였기 때문이다.",
          ],
        },
        {
          heading: "커리큘럼 — 무엇을 언제 배웠나",
          body: [
            "7개월이 통으로 주어진 게 아니라 월 단위로 쪼개져 있었고, 앞 달에 배운 것이 " +
              "뒤 달의 재료가 되도록 짜여 있었다. 마지막 두 달은 수업이 아니라 프로젝트다.",
            "수료 조건은 총 교육시간의 **80% 이상 출석**이었다. 하루 교육시간의 절반을 " +
              "빠지면 결석 1일, 지각·조퇴 3회가 결석 1일로 쌓였다.",
          ],
          list: [
            "1개월차 — 소프트웨어 엔지니어링(객체지향 · 설계 원칙), 알고리즘, 데이터베이스 활용",
            "2개월차 — 데이터베이스 활용(80H), 미니 프로젝트",
            "3개월차 — 프레임워크(Spring)",
            "4개월차 — REST API, 취업 특강",
            "5개월차 — 종합 프로젝트(120H)",
            "6~7개월차 — 최종 융합 프로젝트(88H)",
          ],
        },
        {
          heading: "자바를 다시 보게 된 과정",
          body: [
            "처음 유레카에 들어갔을 때만 해도 자바는 하기 싫은 언어였다. 학교에서 배울 " +
              "때부터 '이게 도대체 무슨 언어야' 싶었고, 어렵고 복잡하게만 느껴졌다.",
            "과정을 따라가면서 시각이 바뀌기 시작했다. 문법을 익히는 데서 그치지 않고 " +
              "실제 프로젝트에 적용해 보니 자바가 가진 객체지향적 개념과 라이브러리들이 " +
              "점점 눈에 들어왔다.",
            "학교에서 배운 개념, 블로그에 정리해둔 내용, 책으로 익힌 지식이 이 시기에 " +
              "서로 연결되기 시작했다. 하나의 언어를 제대로 활용한다는 게 얼마나 깊이 있는 " +
              "일인지는 지금도 계속 깨닫는 중이지만, 적어도 막연하게 어렵지는 않게 됐다.",
          ],
        },
        {
          heading: "미니 프로젝트 — 자바 스윙으로 만든 영화 애플리케이션",
          body: [
            "영화 미니 프로젝트를 고를 때는 차근차근 생각해보며 '이 정도면 다 구현할 수 " +
              "있겠지' 했다. 실제로는 자바 스윙으로 원하는 자리에 글자 하나 띄우는 것부터 " +
              "어려웠다. 자바도 스윙도 거의 처음이라 그 방법을 찾는 데만 한참이 걸렸다.",
            "발표는 세 번째였다. 끝내고 나서는 1등도 노려볼 만하다고 생각했다. 그러다 " +
              "일곱 번째 발표부터 감이 확 왔다 — 1등을 하려면 저 정도는 해야 하는구나. " +
              "그 뒤로 발표한 분들도 확실히 나보다 잘했다. 짧은 시간에 그만큼 구현했다는 " +
              "건 그만큼 했다는 뜻이라, 박수가 안 나올 수 없었다.",
          ],
          list: [
            "일을 미루지 말자 — 계획을 크게 잡고 미루는 일이 잦아졌다",
            "계획을 구체적으로 잡자 — 큰 틀로만 잡으니 진행할 때 혼동이 생긴다",
            "책 읽는 습관을 기르자 — 부족한 쪽을 스스로 알고 있었다",
          ],
        },
        {
          heading: "팀 협업 프로젝트 — 영화 리뷰 사이트",
          body: [
            "왓챠피디아를 클론 코딩하는 프로젝트였다. 동아리 활동을 빼면 여러 명의 백엔드 " +
              "개발자와 함께한 첫 협업이라 설렘 반 걱정 반으로 시작했다. '내가 잘 해낼 수 " +
              "있을까' 하는 걱정이 컸다.",
            "**첫 번째 산은 인증과 인가였다.** 수업에서도 Security라는 말 자체가 어렵게 " +
              "느껴졌는데, 구현 단계에서는 더했다. 자료는 많았지만 코드가 왜 그렇게 " +
              "동작하는지를 이해하는 게 쉽지 않았다. 따라 치기에 급급하다가, 직접 " +
              "구현해나가면서 인증은 '누구인지 확인하는 것', 인가는 '그 사람이 이 " +
              "리소스에 접근할 권한이 있는지 확인하는 것'이라는 게 몸으로 이해됐다.",
            "인증·인가는 JWT로 풀었다. 처음에는 Access Token만이라도 제대로 만들자는 " +
              "목표였다. Refresh Token까지 욕심내기에는 아는 게 부족하다고 느꼈기 " +
              "때문이다. Security 설정에서 특히 많이 헤맸는데, 리뷰 조회는 누구나 " +
              "가능하지만 작성과 수정은 로그인한 사용자만 되도록 SecurityFilterChain 에서 " +
              "URL 별 권한을 갈라야 했다.",
            "**두 번째 산은 협업 자체였다.** 프론트엔드 개발자 없이 백엔드 개발자들이 " +
              "View 까지 맡는 방식이라 서로의 코드가 맞물리는 지점이 많았다. 브랜치 " +
              "관리와 커밋 규칙을 정하는 것부터 충돌을 푸는 것까지 전부 처음이었다.",
            "여기서 제일 크게 배운 건 기본적인 규칙의 중요성이었다. 코드 컨벤션이나 Git " +
              "규칙 같은 것이 정해지지 않으면 나중에 합치는 데 훨씬 더 많은 시간이 든다. " +
              "다음 프로젝트는 그 규칙부터 세우고 시작해야 한다는 걸 경험으로 알았다.",
          ],
        },
        {
          heading: "최종 융합 프로젝트 — 댕댕플레이스",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-title.png`,
            alt: "댕댕플레이스 발표 자료 표지. 7DDAENG 팀원 이름이 적혀 있다.",
            caption: "7DDAENG(칠땡) — 프론트 3명, 백엔드 4명. 백엔드에 이름을 올렸다.",
          },
          body: [
            "마지막은 프론트와 백엔드가 섞인 **7인 융합 프로젝트**였다. 주제는 " +
              "**강아지 동반 가능 시설 공유 플랫폼**. 반려견을 데리고 갈 수 있는 곳을 " +
              "지도에서 찾고, 다녀온 사람이 리뷰를 남기고, 성향에 맞는 곳을 추천받는 " +
              "서비스다.",
            "데이터는 지어내지 않았다. 한국문화정보원의 전국 반려동물 동반 가능 문화시설 " +
              "위치 데이터 **23,930개**를 그대로 밀어 넣고 시작했다.",
            "백엔드 4명 중 내가 맡은 건 **시설 필터링 · 리뷰 CRUD · 성향 테스트 · 성향별 " +
              "추천 시스템**이었다. 앞서 팀 프로젝트에서 리뷰를 한 번 만들어봤던 게 여기서 " +
              "그대로 쓰였고, 추천은 처음 해보는 쪽이었다.",
          ],
        },
        {
          heading: "이번엔 배포까지가 과제였다",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-arch.png`,
            alt: "댕댕플레이스 기술 스택과 시스템 아키텍처 다이어그램",
            caption: "Next.js / Spring Boot / MySQL · Redis, 그리고 AWS 위의 배포 파이프라인.",
          },
          body: [
            "미니 프로젝트는 내 노트북에서 돌면 끝이었고, 팀 프로젝트도 크게 다르지 " +
              "않았다. 이번엔 **실제로 인터넷에 올라가 있어야** 했다.",
            "프론트는 Next.js에 Storybook, 상태는 Zustand. 백엔드는 Spring Boot, " +
              "DB는 MySQL에 Redis를 얹었다. 배포는 프론트가 Vercel, 백엔드가 AWS ECS이고 " +
              "RDS · S3 · ElastiCache가 붙는다. 로그인은 Google · Kakao OAuth, 지도는 " +
              "Google Map API 를 썼다.",
            "이 그림을 처음 그렸을 때가 기억에 남는다. 그때까지 배운 단어들이 각자 " +
              "어디에 놓이는지가 한 장에 정리되는 경험이었다.",
          ],
        },
        {
          heading: "막힌 두 곳",
          figure: {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-ocr.png`,
            alt: "영수증 OCR 모델 선정 과정을 정리한 트러블슈팅 슬라이드",
            caption: "Tesseract 의 한글 인식률이 낮아 CLOVA OCR 로 갈아탄 과정.",
          },
          body: [
            "**배포** — GitHub Actions 의 `gradle.yml` 에 넣어둔 환경변수가 컨테이너까지 " +
              "전달되지 않았다. 값이 비어 있으니 컨테이너는 뜨는데 서비스가 안 되는, " +
              "제일 답답한 종류의 실패였다. 결국 AWS CodePipeline 으로 배포를 옮기고, " +
              "환경변수 파일을 S3 에 올려 ECS 가 읽어가는 방식으로 바꿔 풀었다.",
            "**OCR** — 리뷰를 아무나 못 쓰게 하려고 영수증을 찍어 인증하는 구조를 잡았다. " +
              "처음 붙인 Google Tesseract 는 한글 인식률이 너무 낮아서, 추가 학습 없이 " +
              "바로 쓸 수 있는 **Naver CLOVA OCR** 로 교체했다.",
            "인식이 되고 나서도 끝이 아니었다. OCR 결과에는 필요 없는 필드가 잔뜩 섞여 " +
              "있고 상호명 사이에 공백이 들쭉날쭉해서, 영수증의 가게 이름과 시설 이름이 " +
              "매칭되지 않았다. 불필요한 필드를 걷어내고 공백을 정리한 뒤 JSON 을 파싱해 " +
              "비교하는 식으로 맞췄다.",
          ],
        },
        {
          heading: "7개월이 남긴 것",
          body: [
            "기술만 남은 과정은 아니었다. 혼자 공부할 때는 보이지 않던 내 위치가 여러 " +
              "사람 사이에서는 분명하게 보였고, 그게 다음에 무엇을 해야 하는지를 " +
              "정해줬다. 지원할 때 바랐던 것이 정확히 그거였다.",
            "세 프로젝트가 각각 다른 걸 가르쳤다. 미니 프로젝트는 **끝까지 만들어보는 " +
              "일**, 팀 프로젝트는 **남과 코드를 합치는 일**, 최종 프로젝트는 **만든 것을 " +
              "실제로 띄워두는 일**이었다.",
            "팀 프로젝트에서 못 했던 Refresh Token 은 최종 프로젝트에서 처리했다 — " +
              "Access Token 은 로컬 스토리지, Refresh Token 은 쿠키. 한 과정 안에서 " +
              "숙제를 남기고 다시 가져와 푼 셈이다.",
          ],
        },
      ],
      clip: {
        src: `${import.meta.env.BASE_URL}media/ureca-daengplace-demo.mp4`,
        poster: `${import.meta.env.BASE_URL}media/ureca-daengplace-demo.jpg`,
        heading: "댕댕플레이스 시연",
        caption:
          "소셜 로그인 → 반려견 등록 → 반경 5km 시설 조회 → 리뷰 · 즐겨찾기 → 성향별 추천. " +
          "최종 발표에서 튼 시연 영상.",
      },
      deck: {
        heading: "발표 자료에서",
        note:
          "최종 융합 프로젝트 발표 자료 중 설계와 트러블슈팅 부분. " +
          "==크게 보기==를 누르면 원본이 열린다.",
        slides: [
          {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-roles.png`,
            alt: "백엔드 4인의 역할 분담을 정리한 슬라이드",
            caption: "백엔드 역할 분담. 시설 필터링 · 리뷰 CRUD · 성향 테스트 · 추천 시스템.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-db.png`,
            alt: "댕댕플레이스 데이터베이스 설계도",
            caption: "DB 설계. 회원 · 반려견 · 시설 · 리뷰 · 성향이 엮인다.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-recommend.png`,
            alt: "성향별 시설 추천 기능을 설명한 슬라이드",
            caption: "성향별 추천. 반려견 성향과 보호자 선호를 받아 시설을 고른다.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-deploy.png`,
            alt: "백엔드 배포 트러블슈팅을 정리한 슬라이드",
            caption: "GitHub Actions 환경변수 문제 → AWS CodePipeline 전환.",
          },
          {
            src: `${import.meta.env.BASE_URL}assets/ureca-dp-ocr.png`,
            alt: "영수증 OCR 모델 선정 트러블슈팅 슬라이드",
            caption: "Tesseract → CLOVA OCR, 그리고 상호명 매칭 전처리.",
          },
        ],
      },
      downloads: {
        heading: "자료 받기",
        items: [
          {
            label: "댕댕플레이스 — 최종 발표 자료",
            url: `${import.meta.env.BASE_URL}docs/ureca-daengplace-deck.pdf`,
            meta: "PDF · 22장 · 7.3MB",
          },
        ],
      },
      linksHeading: "링크",
      links: [
        {
          label: "DaengPlace — GitHub",
          url: "https://github.com/DaengPlace",
          note: "댕댕플레이스 저장소. 프론트 · 백엔드가 나뉘어 있다.",
        },
        {
          label: "댕댕플레이스 — 배포된 서비스",
          url: "https://daengplace.vercel.app",
          note: "최종 발표 시점에 올려둔 주소.",
        },
        {
          label: "LG 유플러스 부트캠프 — 과정 정리",
          url: "https://yuchan-log.notion.site/2a7445b5c77c41fda28403197ff6037d",
          note: "유레카가 어떤 과정이었는지, 그 안에서 무엇이 바뀌었는지 정리한 문서.",
        },
        {
          label: "유레카 미니 프로젝트를 마무리 하며",
          url: "https://yuchan-log.notion.site/ed779cce98814adcacc60fd3de81ceb8",
          note: "영화 미니 프로젝트 회고. 발표 순서까지 그대로 남아 있다.",
        },
        {
          label: "팀 협업 프로젝트를 마무리 하며",
          url: "https://yuchan-log.notion.site/7ea0853aafb0474dba8d161e2fc05f53",
          note: "영화 리뷰 사이트 회고. 인증·인가와 Git 협업에서 겪은 것들.",
        },
      ],
    },
  },
  { at: 20240701, period: "2024.07.01 – 2024.12.24", title: "LG 유플러스 스터디" },
  { at: 20240805, period: "2024.08.05 – 2024.08.18", title: "Backend Challenge 포트폴리오 프로젝트와 서류 관리법 (원티드)" },
  { at: 20240923, period: "2024.09.23", title: "LG 유플러스 테크 컨퍼런스" },
  {
    at: 20241105,
    period: "2024.11.05 – 2024.11.14",
    title: "OOP와 SOLID를 이용한 클론코딩 (원티드)",
    highlight: true,
  },
  {
    at: 20241111,
    period: "2024.11.11 – 2025.10.01",
    title: "Java & Spring 역량 기르기 스터디 (Back 투더 퓨처)",
    highlight: true,
  },
  { at: 20250107, period: "2025.01.07 – 2025.01.16", title: "이제는 꼭 알아야 할 AWS (원티드)" },
  {
    at: 20250513,
    period: "2025.05.13 – ing",
    title: "마스터웨이 & 세움러닝",
    highlight: true,
    detail: {
      org: "마스터웨이 (Masterway) · 백엔드 개발자",
      facts: [
        { label: "형태", value: "정규직 백엔드 개발자" },
        { label: "기간", value: "2025.05.13 – 재직 중" },
        { label: "팀", value: "2인 개발팀 · 백엔드 + DevOps" },
        { label: "서비스", value: "세움러닝 · 인앤써" },
      ],
      summary:
        "==2인 개발팀==에서 백엔드 개발과 DevOps 운영을 함께 맡고 있다. Spring Boot " +
        "기반 비즈니스 로직부터 ==AWS · Docker · Nginx== 배포 환경과 CI/CD 운영까지, " +
        "서비스가 굴러가는 전 구간을 다룬다.",
      sections: [
        {
          heading: "무엇을 만드는가",
          body: [
            "세움러닝이 운영하는 교육 서비스 인앤써의 백엔드를 맡고 있다. 하나의 " +
              "제품처럼 보이지만 안은 여러 도메인이 맞물려 있고, 2인 팀이라 한 도메인에만 " +
              "머무를 수 없다.",
            "그래서 일하는 방식이 자연히 '한 기능을 깊게'보다 '한 흐름을 끝까지'가 된다. " +
              "요청이 들어와서 응답이 나가고, 그게 배포되어 실제로 도는 데까지가 한 " +
              "사람의 범위 안에 있다.",
          ],
          list: [
            "인증 · 사용자",
            "면접 · AI 학습",
            "생활기록부 · 분석",
            "상품 · 결제 · 요금제",
            "커뮤니티 · 게이미피케이션",
            "메시징 (비즈톡)",
            "공통 · 인프라",
          ],
        },
        {
          heading: "AI 면접 — 동기 처리를 비동기 배치로",
          body: [
            "AI 면접 서비스의 OCR · GPT 문제 생성 흐름이 원래는 동기 처리였다. 요청 " +
              "하나가 생성이 끝날 때까지 자리를 붙잡고 있으니, 사람이 몰리는 시간대에 " +
              "그대로 밀렸다.",
            "이 흐름을 **비동기 배치 파이프라인**으로 바꿨다. JMeter 기준 1,000 ~ 2,000건 " +
              "동시 요청 환경에서도 안정적으로 요청을 수용하도록 설계했다.",
            "결과는 시간과 실패율 양쪽에서 나왔다. 기존 10 ~ 15분 걸리던 문제 생성 시간을 " +
              "5분 이내로 줄였고, 실패율은 3 ~ 4% 수준으로 낮췄다.",
          ],
        },
        {
          heading: "생활기록부 — 전환이 걸린 퍼널",
          body: [
            "생활기록부 업로드 퍼널은 서비스의 핵심 사용자 흐름이다. 여기서 막히면 " +
              "그 뒤가 전부 없어지기 때문에, 기능이 도는 것보다 끝까지 도는 것이 중요하다.",
            "운영 기준으로 1,680명 중 381명이 결제까지 이어졌다. 전환율 22.68%. 숫자가 " +
              "보이니 어느 단계를 손봐야 하는지도 같이 보였다.",
          ],
        },
        {
          heading: "민감한 데이터를 다루는 기준",
          body: [
            "생활기록부는 교육 데이터 중에서도 민감한 축에 속한다. 그래서 기능보다 " +
              "먼저 정한 것이 보관과 폐기의 기준이었다.",
            "키는 **KEK / DEK 를 분리**해 관리하고, 데이터는 **AES-GCM** 으로 암호화한다. " +
              "식별자는 **TSID** 를 써서 순차 노출을 피했고, 보관은 **1년 단위 보관 · 폐기 " +
              "정책**으로 못 박았다.",
            "이 기준을 함께 설계하면서, 보안은 나중에 덧붙이는 기능이 아니라 스키마와 " +
              "수명 주기를 정할 때 같이 정해지는 것이라는 걸 알게 됐다.",
          ],
        },
        {
          heading: "2인 팀에서 일한다는 것",
          body: [
            "개발과 운영 사이에 경계가 없다. 짠 코드를 직접 배포하고, 문제가 나면 직접 " +
              "본다. AWS · Docker · Nginx 위에서 도는 환경과 CI/CD 도 같은 사람의 일이다.",
            "인원이 적어서 생기는 제약은 분명하지만, 덕분에 비즈니스 로직부터 배포 " +
              "환경까지를 하나의 시스템으로 보게 됐다. 지금 홈랩과 개발 자동화에 손을 " +
              "대고 있는 것도 여기서 이어진 흐름이다.",
          ],
        },
      ],
      linksHeading: "관련 링크",
      links: [
        {
          label: "GitHub — codwithyc",
          url: "https://github.com/codwithyc",
          note: "지금 하고 있는 일과 다루는 스택을 정리해둔 프로필.",
        },
      ],
    },
  },
];
