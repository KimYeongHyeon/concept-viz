# Clinician-in-the-Loop OMOP Criteria Mapper

**Target Trial Emulation을 위한 Eligibility Criteria Concept Mapping Interactive Review System**

---

## 1. 배경

관찰 데이터 기반 Target Trial Emulation(TTE)에서는 임상시험 프로토콜의 포함·제외 기준(eligibility criteria)을 OMOP CDM 표준 concept로 정확히 매핑해야 재현 가능한 코호트를 정의할 수 있다. 최근 LLM과 knowledge graph를 결합한 반자동 매핑 시스템이 등장하여 매핑 정확도는 크게 향상되었으나, **최종 검토 단계에서 의료진이 후보 concept를 효율적으로 비교·판단할 수 있는 인터페이스**는 여전히 부족하다.

기존 도구인 Athena는 vocabulary 탐색 브라우저로, Usagi는 term-level 매핑 도구로 유용하지만, 두 도구 모두 criteria 문장의 맥락(동반 조건, 시간 제약, 값 범위)을 함께 보여주거나, 후보 concept 간 계층 관계를 인라인으로 비교하는 워크플로우를 제공하지 않는다. AI가 추천한 concept의 적절성을 의료진이 빠르게 판정할 수 있는 **검토 중심 시각화 시스템**이 필요하다.

## 2. 목적

본 과제는 AI 기반 concept 매핑 시스템(Artemis)이 생성한 후보 concept를 의료진이 **인터랙티브하게 검토·비교·승인**할 수 있는 시각화 웹 시스템을 개발하는 것을 목표로 한다.

핵심 목표는 다음 세 가지이다:

1. **검토 효율화** — 의료진의 Approve/Replace/Reject 의사결정을 최소 클릭으로 완료
2. **판단 품질 향상** — 후보 concept의 계층 관계, confidence, provenance를 시각적으로 제시하여 정보에 기반한 의사결정 지원
3. **매핑 재사용성** — 승인된 매핑 이력을 축적하여 반복 연구의 검토 시간 단축

## 3. 방법

### 3.1 시스템 아키텍처

기존 Artemis 매핑 파이프라인을 블랙박스 백엔드로 활용하고, 의료진용 review 시각화 계층을 새로 구축한다.

```
┌─────────────────────────────────────────────────────────────────┐
│              Clinician Review Interface (본 과제)                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐ │
│  │ A. Criteria  │  │ B. Candidate     │  │ C. Hierarchy      │ │
│  │    Panel     │  │    Cards         │  │    Explorer       │ │
│  │              │  │                  │  │                   │ │
│  │ 원문 + Span  │  │ Top-N 비교 카드  │  │ 계층 트리/그래프  │ │
│  │ 하이라이트   │  │ Confidence 바    │  │ 관계 시각화       │ │
│  │ 도메인 태그  │  │ Approve/Replace  │  │ 클릭 탐색         │ │
│  │ 값 제약 표시 │  │ /Reject 액션     │  │ Provenance 표시   │ │
│  └──────────────┘  └──────────────────┘  └───────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ D. Mapping Dashboard                                     │   │
│  │ 전체 criteria 매핑 진행률 │ 승인/보류/거부 통계          │   │
│  │ Confidence 분포 히트맵    │ 매핑 이력 타임라인            │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
                             │ (CriterionMappingMetadata:
                             │  allCandidates, rerankConfidence,
                             │  selectedConceptIds)
┌────────────────────────────▼────────────────────────────────────┐
│          Artemis Mapping Pipeline (기존 시스템, 블랙박스)        │
│  Criteria Text → Query Expansion → Retrieval → Rerank          │
│  → KG Expansion → Critic → Refiner → Candidate Concepts       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 시각화 설계

#### A. Criteria Panel (좌측)

criteria 원문을 표시하고, 파싱된 엔티티를 시각적으로 구분한다.

- **Span 하이라이트** — 매핑 대상 엔티티(질환, 약물, 검사 등)를 도메인별 색상으로 표시
- **메타데이터 뱃지** — 도메인(Condition/Drug/Measurement), 로직 타입(PRESENCE/ABSENCE), 값 제약(예: HbA1c > 7%), 시간 윈도우
- **매핑 상태 인디케이터** — 각 criterion의 승인/보류/거부 상태를 아이콘으로 표시
- **포함·제외 기준 그룹핑** — inclusion/exclusion을 시각적으로 분리하고 접기/펼치기 지원

#### B. Candidate Cards (중앙)

AI가 추천한 후보 concept를 비교 가능한 카드 형태로 제시한다.

- **카드 구성** — concept name, concept ID, vocabulary (SNOMED CT/RxNorm/LOINC 등), domain, standard concept 여부
- **Confidence 시각화** — reranker confidence 점수를 수평 바 또는 게이지로 표시
- **근거 표시** — 해당 concept가 선택된 이유(semantic similarity, KG 관계, critic reasoning)를 접을 수 있는 패널로 제공
- **액션 버튼** — Approve(승인), Replace(대체 concept 검색), Reject(거부 + 사유 입력)
- **비교 모드** — 2개 이상의 후보를 나란히 비교하는 side-by-side 뷰

#### C. Hierarchy Explorer (우측)

선택한 concept의 OMOP vocabulary 계층 관계를 인터랙티브하게 탐색한다.

- **트리 뷰** — parent-child 관계를 접기/펼치기 가능한 트리로 표시
- **그래프 뷰** — sibling, Maps to, Mapped from 등 다양한 관계를 네트워크 그래프로 시각화 (Cytoscape.js)
- **하이라이트** — 현재 후보 concept와 기존 승인 concept를 색상으로 구분
- **클릭 탐색** — 노드 클릭 시 해당 concept 상세 정보와 CDM 내 출현 빈도 표시

#### D. Mapping Dashboard (하단)

전체 연구의 매핑 진행 상황을 한눈에 파악한다.

- **진행률 바** — 전체 criteria 중 승인/보류/거부/미처리 비율
- **Confidence 히트맵** — criteria별 AI confidence 분포를 색상 매트릭스로 표시하여 저신뢰 항목 우선 검토 유도
- **매핑 이력 타임라인** — 승인/수정 이력을 시간순 표시, versioned mapping 추적

### 3.3 인터랙션 설계

의료진의 검토 워크플로우를 최적화하기 위한 핵심 인터랙션:

| 인터랙션 | 설명 |
|----------|------|
| **Smart Queue** | confidence가 낮은 criteria를 우선 표시하여 검토 효율 극대화 |
| **Bulk Approve** | 고신뢰(confidence > 임계값) 매핑을 일괄 승인 |
| **Replace Search** | Reject 시 Athena 검색을 인라인으로 호출하여 대체 concept 즉시 탐색 |
| **Annotation** | 승인/거부 시 근거 메모를 남겨 매핑 provenance 기록 |
| **History Suggest** | 과거 승인 이력에서 동일/유사 criteria의 기승인 concept 자동 제안 |

### 3.4 기술 스택

| 계층 | 기술 | 역할 |
|------|------|------|
| Frontend | React, TailwindCSS | 3패널 Review UI |
| 계층 시각화 | Cytoscape.js | Concept hierarchy 그래프 |
| 통계 시각화 | D3.js 또는 Recharts | Confidence 히트맵, 진행률 |
| Backend API | Python FastAPI (Artemis) | 매핑 결과 및 메타데이터 제공 |
| 데이터 | OMOP CDM (PostgreSQL) | Vocabulary, concept 관계 |
| 코호트 연계 | CIRCE JSON → ATLAS/WebAPI | 승인된 매핑의 cohort definition 반영 |

## 4. 기대효과

### 기존 도구와의 비교

| 항목 | Athena | Usagi | 본 시스템 |
|------|--------|-------|-----------|
| 주요 기능 | Vocabulary 브라우징 | Source-to-concept 매핑 | AI 추천 결과 검토·승인 |
| 컨텍스트 | 단일 concept 탐색 | 단일 용어 매칭 | Criteria 문맥 + 후보 비교 |
| 계층 탐색 | 별도 페이지 이동 | 미제공 | 인라인 인터랙티브 그래프 |
| 의사결정 지원 | 없음 | 유사도 점수 | Confidence + 근거 + 비교 뷰 |
| 매핑 이력 | 없음 | CSV export | 자동 축적 + 재사용 제안 |

### 평가 계획

#### User Study (주 평가 방법)

- **참여자**: 의료정보학 또는 임상 배경의 연구자 3~5명
- **태스크**: 동일 criteria set(LEADER 연구 eligibility criteria)을 두 가지 조건으로 검토
  - 조건 A: Athena만 사용하여 수동 매핑 검토
  - 조건 B: 본 시스템을 사용하여 AI 추천 결과 검토
- **측정 지표**:
  - 검토 완료 시간 (criteria당 평균)
  - 매핑 일치율 (gold standard 대비 precision/recall)
  - 시스템 사용성 점수 (SUS, System Usability Scale)
  - 주관적 만족도 (Likert scale)

#### 보조 평가

- 재사용률: 첫 번째 연구(LEADER) 매핑 승인 후, 두 번째 연구(PLATO)에서 자동 제안 적용 비율
- Bulk approve 비율: 고신뢰 매핑의 일괄 승인 비율과 그 정확도

### 산출물

1. Eligibility criteria 매핑 검토·승인 인터랙티브 웹 시스템
2. OMOP concept hierarchy 시각화 컴포넌트
3. 매핑 승인 로그 및 provenance 기록 시스템
4. User study 평가 보고서 (검토 시간·정확도·사용성 비교)
5. Cohort definition 자동 연계 (승인 즉시 CIRCE JSON 반영)
