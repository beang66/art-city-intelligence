**세계 도시의 예술 생태계를 정량·정성 데이터로 분석하고, 문화·시장·산업 기회로 연결하는 도시 인텔리전스 플랫폼**
[프로젝트 개요](#-소개) • [주요 기능](#-주요-기능) • [라우트 및 구조](#-라우트-및-페이지-구성) • [기술 스택](#-기술-스택) • [시작 가이드](#-시작-가이드)

</div>

```
🔗 [웹사이트 바로가기 (배포 링크)](https://art-city-intelligence.onrender.com/overview))  
📁 [발표 자료 원본 다운로드 (PPTX)](https://github.com/user-attachments/files/32440703/Art_City_Intelligence_Portfolio_With_Screenshots.pptx)
```

---

## 📌 소개

**Art City Intelligence**는 전 세계 주요 18개 이상의 거점 도시(서울, 베를린, 런던, 뉴욕, 파리, 도쿄 등)의 예술 생태계를 입체적으로 조망하는 **Next.js App Router** 기반의 인터랙티브 인텔리전스 대시보드입니다.

단순한 도시 지표 나열을 넘어, 각 도시가 가진 고유한 문화적 DNA, 예술 생산 및 유통 구조, 시장 가격대, 제도적 인프라, 그리고 산업적 연계 기회를 투명한 관측 데이터와 시계열 지표로 시각화합니다.

```
"도시의 크기가 아니라, 예술이 생산되고 유통되고 소비되는 방식을 비교하고 추적합니다."

<img width="1094" height="612" alt="화면 캡처 2026-09-21 025615" src="https://github.com/user-attachments/assets/0e73efab-8ebf-41c7-856f-ea757254ef78" />
<img width="1094" height="611" alt="화면 캡처 2026-09-21 025633" src="https://github.com/user-attachments/assets/6ec12af6-9bb1-4af1-a94e-a7302f73af52" />
<img width="1093" height="616" alt="화면 캡처 2026-09-21 025646" src="https://github.com/user-attachments/assets/5bbdb71f-a720-41fe-a459-c19c56e7cb37" />
<img width="1094" height="615" alt="화면 캡처 2026-09-21 025659" src="https://github.com/user-attachments/assets/077edd9e-7ade-4229-9432-96d5e6fa4c52" />
<img width="1098" height="613" alt="화면 캡처 2026-09-21 025712" src="https://github.com/user-attachments/assets/62235b6e-b83d-48bb-b227-1083afa6f05e" />
<img width="1096" height="617" alt="화면 캡처 2026-09-21 025722" src="https://github.com/user-attachments/assets/62d30966-8870-49a3-b84c-a72964c70d2b" />
<img width="1096" height="615" alt="화면 캡처 2026-09-21 025733" src="https://github.com/user-attachments/assets/cdcea1db-e936-486f-b673-15ddd4d0e773" />
<img width="1094" height="616" alt="화면 캡처 2026-09-21 025743" src="https://github.com/user-attachments/assets/d7af88bb-f9d3-4279-99c3-22810e56580b" />
<img width="1097" height="615" alt="화면 캡처 2026-09-21 025754" src="https://github.com/user-attachments/assets/e397265c-731f-441f-9dbe-df9b406dbc3b" />
<img width="1095" height="616" alt="화면 캡처 2026-09-21 025805" src="https://github.com/user-attachments/assets/7d7d7dd5-7c07-405f-bd26-66d06c7c7e27" />
<img width="1093" height="613" alt="화면 캡처 2026-09-21 025820" src="https://github.com/user-attachments/assets/df38f3ff-ab0f-4cd7-9133-a2bbe90d2cae" />
<img width="1093" height="614" alt="화면 캡처 2026-09-21 025832" src="https://github.com/user-attachments/assets/11efc2df-c6f5-4b85-84b3-c39d1d79cad4" />
<img width="1096" height="616" alt="화면 캡처 2026-09-21 025845" src="https://github.com/user-attachments/assets/7bf6f675-b678-4bf7-9f3d-6d0f2304effa" />
<img width="1096" height="615" alt="화면 캡처 2026-09-21 025857" src="https://github.com/user-attachments/assets/e2399b12-bf64-4d36-948c-12cd4d9c432b" />
<img width="1095" height="617" alt="화면 캡처 2026-09-21 025910" src="https://github.com/user-attachments/assets/1cca59ef-cc5b-4ea4-85dc-4a898017df77" />
<img width="1097" height="617" alt="화면 캡처 2026-09-21 025919" src="https://github.com/user-attachments/assets/60b4f2d4-49b4-45e3-97fe-525cafc4a09b" />
<img width="1095" height="616" alt="화면 캡처 2026-09-21 025931" src="https://github.com/user-attachments/assets/85e62cbf-6280-4305-b774-e96ef1916134" />
<img width="1093" height="616" alt="화면 캡처 2026-09-21 025942" src="https://github.com/user-attachments/assets/2860722e-032d-4a6e-ab09-27f540ac0ab6" />
<img width="1094" height="617" alt="화면 캡처 2026-09-21 025954" src="https://github.com/user-attachments/assets/03b4b670-d149-4b46-9be4-9e7427b18d05" />
<img width="1097" height="618" alt="화면 캡처 2026-09-21 030007" src="https://github.com/user-attachments/assets/52aaf61e-32aa-4294-92d1-2d153c5b2a04" />











