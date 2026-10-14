# WORD QUEST 제품 설계 · 2026-10-14

## 목표 사용자
중학교 학생(주로 남학생을 가정하되 성별과 관계없이 사용할 수 있는 스타일). 교과서와 학원 자료에서 추출한 단어를 5~15분씩 반복 학습해 내신 대비. 과도한 경쟁·벌점 대신 학습 성취를 시각화.

## 정보 구조
- 홈: XP/레벨, 연속 학습, 오늘 복습 수, 빠른 액션
- 사진 추출: 이미지 업로드/촬영 → OCR 원문 검수 → 어휘 후보 선택/수정 → 단어장에 저장
- 단어장: 교재별/단원별 묶음, 뜻/예문 수정, 발음 듣기
- 복습: 카드 앞/뒤 → 스스로 답을 떠올린 뒤 몰랐어요/헷갈려요/알아요 평가 → 재출제 예정 시점 저장
- 퀴즈: 4지선다 → 점수/XP → 틀린 단어 복습 대상으로 전환

## 학습 규칙 (초기 버전)
- 새 단어: 첫 복습 즉시
- 모름: 10분 후, XP +2
- 헷갈림: 1일 후, XP +5
- 앎: 1일 → 3일 → 이전 주기에 ease 값을 곱한 일수, XP +10
- 퀴즈 정답: XP +20, 오답: 해당 단어 즉시 복습 대상
- 레벨: XP 200점마다 1레벨 상승

주의: 초기 복습 로직은 학습용 휴리스틱이며 Anki FSRS와 동일하지 않습니다. XP가 목표를 왜곡하는지 실사용 테스트 필요.

## 로컬 데이터 구조
```json
{
  "words": [{
    "id": "UUID", "en": "achieve", "ko": "달성하다", "pos": "동사", "example": "...",
    "deck": "중2 영어 3과", "created": 0, "due": 0, "interval": 0, "ease": 2.5, "reps": 0, "miss": 0
  }],
  "xp": 0,
  "history": {"2026-10-14": 40},
  "settings": {"dailyGoal": 10},
  "created": 0
}
```

## 차기 서버 데이터 모델 (권장)
- `profiles`: user_id(pk, auth.users), nickname, grade, created_at
- `decks`: id(pk), owner_id(fk), title, grade, textbook, unit, created_at
- `vocabulary`: id(pk), owner_id(fk), deck_id(fk), lemma, meaning_ko, part_of_speech, example_en, source_text, created_at
- `srs_state`: id(pk), owner_id(fk), vocabulary_id(unique fk), due_at, stability, difficulty, reps, lapses
- `review_events`: id(pk), owner_id(fk), vocabulary_id(fk), rating, occurred_at, response_ms
- `quiz_attempts`: id(pk), owner_id(fk), deck_id(fk), correct, total, finished_at
- `xp_events`: id(pk), owner_id(fk), kind, points, occurred_at
- `media_assets`: id(pk), owner_id(fk), deck_id(fk), storage_path, created_at (가급적 이미지 원본 저장 최소화)

접근 제어: 모든 학습 테이블에서 `auth.uid() = owner_id` 정책. 쓰기 가능한 XP 이벤트는 악용 방지를 위해 서버 검증. 미성년자 기본 공개 프로필 비활성화.

## 구현 기술 로드맵
- 현재: 바닐라 JS 반응형 PWA, localStorage, Tesseract.js OCR, browser SpeechSynthesis
- 차기: React + TypeScript 또는 기존 앱 유지하며 Supabase Auth/Postgres/RLS 연계
- 번역: 검증된 영어-한국어 사전 API 또는 백엔드 LLM 호출 후 품사·문맥 기반 뜻 후보 생성 및 사용자 확인
- 고도화: FSRS 스케줄링, 학교별 교재 태깅, 주관식/철자 퀴즈, 시험 D-day 집중 모드
- 게임: 퀘스트와 배지, 단원별 보스전, 꾸미기 요소, 접근성/학습 효과 검증

## 개인정보·미성년자 고려
- 현재 사진은 OCR 실행을 위해 사용자 브라우저에서 읽으며 앱 자체 서버로 업로드하지 않음
- 외부 OCR 패키지 로딩 및 브라우저 보안 정책은 네트워크 환경에 영향받음
- 향후 이미지 저장 최소화, 개인정보가 보이는 문서 마스킹, 적법한 동의·보관정책 수립
- 공개 리더보드, 다른 학생과 채팅, 위치/연락처 접근은 초기에는 제외

## 테스트 시나리오
1. 모바일 카메라 사진을 선택하고 OCR을 실행해 영어 원문을 얻는다.
2. 추출된 목록에서 필요한 단어를 선택하고 뜻 수정 후 단어장에 저장한다.
3. 단어장을 열어 발음을 듣고 편집한다.
4. 복습에서 카드 뒤집기·평가·다음 날짜 설정을 확인한다.
5. 4개 이상 단어로 퀴즈를 풀고 오답은 복습 대상으로 표시되는지 확인한다.
6. 새로고침 후 저장 상태 유지, JSON 내보내기/복원 확인.
