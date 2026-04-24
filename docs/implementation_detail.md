# 시각화 세부 구현 계획

본 문서는 제안서(proposal_v2_visualization_focus.md)의 섹션 3.1, 3.2에 대한 세부 구현 계획이다.

## 3.1 계층적 구조 데이터의 효율적 시각화

### 3.1.1 Space-Filling Visualization (전체 분포 조망)

전체 vocabulary 규모와 도메인별 분포를 한눈에 파악하는 overview 시각화이다.

- **Treemap** — 각 concept의 CDM 내 환자 수를 면적으로, vocabulary 도메인을 색상으로 표현. 클릭으로 하위 계층 drill-down, breadcrumb trail로 탐색 경로 추적
- **Sunburst** — 방사형 계층 표현으로, 중심에서 바깥으로 depth를 표시. 클릭한 arc로 zoom-in하여 하위 분포 탐색

### 3.1.2 Focus+Context Visualization (탐색 효율 극대화)

관심 concept 주변은 상세하게, 나머지는 축약하여 전체 구조를 유지하면서 탐색 효율을 높인다.

- **DOI (Degree of Interest) Tree** — 선택한 concept(anchor)를 중심으로 ancestor N단계, descendant N단계를 자동 전개하고, 거리가 먼 노드는 접기/축소. 슬라이더로 전개 깊이 조절 가능
- **Semantic Zoom** — 줌 레벨에 따라 노드 표현이 3단계로 전환: Overview(색상 점만) → Normal(이름 라벨) → Detail(concept ID, 도메인, CDM 빈도를 포함한 full card)

### 3.1.3 Anchor-Based Hierarchy Navigation (매핑 검토 핵심)

AI가 매핑한 concept를 anchor로 삼아 계층을 자동 전개하는 방식이다. **검색 없이 시각적 탐색만으로** 빠진 concept를 발견하고 추가할 수 있다.

- **Anchor 자동 전개** — 매핑된 concept(gold)를 중심으로 parent 2단계, child 전체를 자동 표시
- **Discoverable Siblings** — 매핑된 concept의 형제 노드를 보라색(discoverable)으로 표시. 이들이 가장 빠지기 쉬운 concept이며, 클릭 한 번으로 concept set에 추가 가능
- **Include Descendants 토글** — 특정 노드의 하위 전체를 일괄 포함/제외하는 토글 제공

### 3.1.4 Interactive Visual Selection (검색 없는 concept 선택)

그래프/트리 위에서 직접 concept를 선택하여 concept set을 구축하는 인터랙션이다.

- **Drag-to-add** — 노드를 concept set 영역으로 드래그하여 추가
- **Lasso 선택** — Shift+드래그로 자유형 영역을 그려 다수 노드를 일괄 선택
- **Subtree 모드** — 노드 클릭 시 하위트리 전체를 선택하고 "Include Descendants" 버튼으로 일괄 추가
- **Graph/Tree 전환** — Force-directed graph(관계 중심)와 계층 tree(구조 중심)를 토글하여 두 관점에서 탐색

## 3.2 임상 데이터 기반 시각적 맥락 제공

### 3.2.1 Concept 단위 임상 통계

각 concept 노드/카드에 CDM 기반 집계 통계를 부착한다.

- **환자 수 (Patient Count)** — 해당 concept가 CDM에 기록된 고유 환자 수. 노드 크기로 인코딩하여 "데이터가 실제로 존재하는 곳"을 직관적으로 표현
- **연령/성별 분포** — 미니 히스토그램 및 파이 차트로 concept별 환자 인구통계 표시. 후보 간 비교 시 "어떤 concept가 연구 대상 인구를 더 잘 포착하는가" 판단 근거
- **Missingness Rate** — 해당 concept의 레코드 중 필수 필드(start_date, value, provider 등)가 누락된 비율. Traffic light 뱃지(Green/Yellow/Red)로 표시
- **방문 유형 분포(Visit Context)** — IP(입원)/OP(외래)/ER(응급) 비율. concept의 임상적 심각도를 간접적으로 파악

### 3.2.2 형제 Concept 비교 뷰

매핑된 concept의 형제 노드들을 **환자 수 기준 바 차트**로 나란히 비교한다.

- 형제 간 환자 분포가 고르면 → 특정 형제가 빠졌을 가능성 낮음
- 특정 형제에 환자가 집중되어 있으면 → 해당 형제가 빠지면 cohort 품질에 큰 영향
- **Concept Specificity Index** — 자식 환자 수 / 부모 환자 수 비율로 concept의 특이도를 수치화 (예: T2DM w/ nephropathy = 214/1,393 = 15.4%)

### 3.2.3 Cohort 영향도 미리보기

매핑 결정이 최종 cohort에 미치는 영향을 실시간으로 미리 보여준다.

- **Attrition Waterfall** — 각 criteria별 환자 수 감소를 폭포 차트로 표시. concept를 교체하면 차트가 실시간 갱신되어 "이 선택이 cohort를 얼마나 줄이는가"를 직관적으로 확인
- **Marginal Exclusion Rate** — 해당 criteria/concept만으로 제외되는 환자 비율. 과도하게 제한적인 매핑을 감지
- **Concept Swap Diff** — 현재 선택과 대안(부모, 형제, 자녀)을 교체했을 때의 cohort 크기 변화를 delta 표시

### 3.2.4 측정값 분포 시각화

측정값(Measurement) concept에 대해 연속형 데이터의 분포를 시각화한다.

- **Value Distribution Histogram** — HbA1c, eGFR 등의 실제 측정값 분포를 히스토그램으로 표시
- **Threshold Slider** — criteria의 값 조건(예: HbA1c ≥ 7%)을 슬라이더로 조절하면, 해당 threshold 이상/이하의 환자 수가 실시간 변경. 히스토그램 위에 threshold line 오버레이
- **이상치 비율** — 정상 범위 밖의 측정값 비율을 표시하여 임상적 유의성 간접 파악

### 3.2.5 시간 패턴 및 결과 미리보기

시간 패턴과 연구 결과 미리보기를 제공한다.

- **Prevalence Trend Sparkline** — 각 concept의 월별/연별 환자 수 추세를 미니 라인 차트로 표시. concept가 ICD9→ICD10 전환기에 갑자기 변동하는 등의 코딩 패턴 변화 감지
- **Mini Kaplan-Meier Preview** — concept 선택에 따른 생존 곡선 미리보기. 다른 concept으로 교체 시 치료 효과 추정치(HR)가 어떻게 달라지는지 시각적 비교
- **Co-occurrence Network** — 선택한 concept와 동일 환자에게 자주 함께 나타나는 다른 concept를 네트워크로 표시. vocabulary hierarchy에서 보이지 않는 **임상적 연관관계**를 데이터 기반으로 발견
