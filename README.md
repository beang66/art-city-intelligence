# Art City Intelligence

세계 도시의 예술 생태계를 비교하고 시장·문화·산업 기회로 전환하는 Next.js App Router 기반 프로토타입입니다. 기존 정적 HTML 화면을 도메인 중심 구조로 이관했으며, Overview의 인터랙티브 지구본과 도시별 Signal 대시보드를 React 컴포넌트로 분리했습니다.

## 실행

```bash
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:3000`입니다. 프로덕션 검증은 `npm run build`, 타입 검사는 `npm run typecheck`로 실행합니다.

VS Code의 **Open with Live Server**를 계속 사용하는 경우 루트 `index.html`은 실행 중인 Next.js 개발 서버(`http://localhost:3000/overview`)로 이동시키는 호환용 진입 파일입니다. 실제 화면 소스는 `src/app`에 있습니다.

## 주요 라우트

- `/` 및 `/overview`: 플랫폼 개요와 인터랙티브 지구본
- `/cities/[citySlug]`: 도시별 City, Market, Cultural, Opportunity Signal
- `/compare`: 서울·베를린·밀라노의 6개 차원 비교
- `/methodology`: 수집·정규화·점수화·검증 방법론
- `/admin/cities`, `/admin/indicators`, `/admin/sources`, `/admin/validation`: 운영 화면 스캐폴드
- `/api/cities`, `/api/indicators`, `/api/market`, `/api/cultural`: 읽기 전용 프로토타입 API

## 구조 원칙

```text
src/app          라우트, 레이아웃, Route Handler
src/components   화면 단위 UI와 지구본 인터랙션
src/features     도시·시장·문화·비교 도메인 로직
src/lib          API, 언어 처리, 검증 공통 계층
src/types        공유 도메인 타입
src/img          도시별 대표 작품 이미지
src/report       화면에서 인용하는 등록 출처 원문
public           지도 데이터와 아이콘 정적 자산
scripts          정적 지도 데이터 생성 도구
```

도시 데이터는 현재 `src/features/city-intelligence/service.ts`의 검증용 예시 데이터입니다. 실제 운영 데이터 저장소를 연결할 때는 별도의 DB 계층과 관리 화면 인증·권한 검사를 추가해야 합니다.
