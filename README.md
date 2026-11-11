<div align="center">
  <h1 align="center">
    Art City Intelligence
    <br />
    <br />
    <a href="https://art-city-intelligence.vercel.app/">
      <img src="https://github.com/user-attachments/assets/29e67442-0211-4935-8551-0f44df8cdb99" alt="Art City Intelligence 첫 화면" width="880">
    </a>
  </h1>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white" alt="Vercel deployed">
  <img src="https://img.shields.io/badge/status-prototype-lightgrey" alt="status prototype">
</p>

<p align="center"><a href="https://art-city-intelligence.vercel.app/">웹사이트</a> · <a href="https://github.com/user-attachments/files/32440703/Art_City_Intelligence_Portfolio_With_Screenshots.pptx">발표 자료 (PPTX)</a></p>

## Introduction

세계 도시의 예술 생태계를 정량 · 정성 데이터로 비교하고, 팝업 · 쇼룸 같은 공간 · 브랜드 기회로 잇는 도시 인텔리전스 웹 프로토타입입니다. 서울, 베를린, 런던, 뉴욕, 파리, 도쿄 등 18개 이상의 도시를 다룹니다.

- **지표를 문헌에서 설계했습니다**

> UNESCO · EU · OECD 문헌을 바탕으로 문화 · 시장 · 제도 지표를 정했습니다.

- **추천은 규칙 기반입니다**

> 어떤 도시를 왜 추천하는지 규칙으로 설명할 수 있게 했습니다.

- **모든 점수는 출처까지 추적됩니다**

> 지표 값마다 관측 데이터와 출처를 따라갈 수 있습니다.

## Installation

Node.js가 필요합니다.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
```

## 화면 구성

| 경로 | 내용 |
| --- | --- |
| `/overview` | 지구본에서 비교군 도시를 고르고 신호를 읽는 첫 화면 |
| `/cities/[citySlug]` | 도시별 문화 · 시장 · 산업 기회 상세 |
| `/compare` | 도시 간 지표 비교 |
| `/methodology` | 지표 설계와 데이터 출처 |
| `/admin/*` | 도시 · 지표 · 출처 관리와 데이터 검증 (관리자) |

## 구조

```text
src/
├── app/            (public) · (admin) 라우트, api
├── features/       city-intelligence · comparison · cultural-intelligence · market-intelligence · evidence
├── components/     charts · city · globe · evidence · market · ui
└── lib/            api · validation · utils
```

## Screenshots

<details>
<summary>화면 더 보기</summary>

<img width="1094" height="611" alt="화면 캡처 2026-09-21 025633" src="https://github.com/user-attachments/assets/a7b0ca7e-69bc-4c00-8fbf-9cfac71fc8ce" />
<img width="1093" height="616" alt="화면 캡처 2026-09-21 025646" src="https://github.com/user-attachments/assets/6dd73a1e-1782-4765-966d-f619d51093b9" />
<img width="1094" height="615" alt="화면 캡처 2026-09-21 025659" src="https://github.com/user-attachments/assets/7abb870c-bc63-431b-b863-6e3dfff73485" />
<img width="1097" height="615" alt="화면 캡처 2026-09-21 025754" src="https://github.com/user-attachments/assets/c0fafa7e-c7a9-4545-a8cd-fc00e144f42f" />
<img width="1095" height="616" alt="화면 캡처 2026-09-21 025805" src="https://github.com/user-attachments/assets/62fa4922-6423-4f61-9817-6032f8297ea8" />
<img width="1093" height="613" alt="화면 캡처 2026-09-21 025820" src="https://github.com/user-attachments/assets/37f1e93f-b887-403a-b18b-52891711c7af" />
<img width="1093" height="614" alt="화면 캡처 2026-09-21 025832" src="https://github.com/user-attachments/assets/cea8b08f-7f9a-4c9a-a3f8-ab2c09324dd9" />
<img width="1096" height="616" alt="화면 캡처 2026-09-21 025845" src="https://github.com/user-attachments/assets/3a9e860f-8a27-460e-a16f-7ab67321456a" />
<img width="1096" height="615" alt="화면 캡처 2026-09-21 025857" src="https://github.com/user-attachments/assets/8e352485-2baa-4909-89f9-48ff1c66fcf0" />
<img width="1095" height="617" alt="화면 캡처 2026-09-21 025910" src="https://github.com/user-attachments/assets/047ba314-2abb-4b65-9eef-2595886ed70f" />
<img width="1097" height="617" alt="화면 캡처 2026-09-21 025919" src="https://github.com/user-attachments/assets/72df1264-d60f-4cbe-8703-756eaf4cad30" />
<img width="1095" height="616" alt="화면 캡처 2026-09-21 025931" src="https://github.com/user-attachments/assets/65f868e2-6d52-40fc-97a1-7c47e5c0aeee" />
<img width="1093" height="616" alt="화면 캡처 2026-09-21 025942" src="https://github.com/user-attachments/assets/dd5add4c-ab86-4d25-b899-8ced13fc46d3" />
<img width="1094" height="617" alt="화면 캡처 2026-09-21 025954" src="https://github.com/user-attachments/assets/9d1901c6-931c-4217-a993-d31d06a47875" />
<img width="1097" height="618" alt="화면 캡처 2026-09-21 030007" src="https://github.com/user-attachments/assets/aaf774a4-ace6-4e4a-9b74-97f7ee4e47fe" />

</details>

## Status

개인 프로젝트 웹 프로토타입입니다 (2026.09). 실제 사용자 성과는 측정하지 않았습니다.

## Author

안정빈 — 기획 · 리서치 · 서비스 설계 · 구현 (개인)
