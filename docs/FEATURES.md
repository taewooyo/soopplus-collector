# 주요 기능 설명

## 1. 채팅 콜렉터

특정 사용자의 채팅만 필터링하여 별도 영역에 표시하는 핵심 기능입니다.

### 동작 원리

```
┌─────────────────────────────────────┐
│         콜렉터 영역 (30%)            │  ← 필터링된 채팅만 표시
│  ┌─────────────────────────────┐   │
│  │ [매니저] user1: 안녕하세요    │   │
│  │ [열혈팬] user2: 반갑습니다    │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤  ← 리사이즈 핸들 (드래그 가능)
│                                     │
│         원본 채팅 영역 (70%)         │  ← 모든 채팅 표시
│                                     │
└─────────────────────────────────────┘
```

### 필터링 조건

1. **닉네임 필터**: 지정한 닉네임의 채팅만 수집
2. **ID 필터**: 지정한 사용자 ID의 채팅만 수집
3. **사용자 등급 필터**:
   - 스트리머 (방송 진행자)
   - 매니저 (채널 관리자)
   - 열혈팬 (후원 상위 유저)
   - 구독자 (채널 구독 유저)
   - 팬클럽 (팬클럽 가입 유저)
   - 일반 유저

### 관련 파일

```
src/content-scripts/core/chatFilter.ts    # 필터링 로직
src/content-scripts/chat.tsx              # 라이브 채팅 처리
src/content-scripts/vod.tsx               # VOD 채팅 처리
src/features/collector/CollectorOptions.tsx  # 설정 UI
src/stores/useCollectorStore.ts           # 상태 관리
```

### 사용법

1. 확장 프로그램 아이콘 클릭
2. "채팅 콜렉터" 토글 활성화
3. 필터 조건 설정:
   - 사용자 등급 선택
   - 닉네임 또는 ID 입력 후 추가
4. 라이브/VOD 페이지에서 필터링된 채팅 확인

---

## 2. 채팅 UI 커스터마이징

채팅창의 외관과 표시 방식을 변경합니다.

### 채팅 구분자

채팅 메시지 앞에 " : " 구분자를 추가합니다.

```
Before: [닉네임] 안녕하세요
After:  [닉네임] : 안녕하세요
```

**구현:**
```typescript
// chat.css에 정의
.chat-divider::before {
  content: " : ";
}
```

### 채팅 시작 정렬

채팅 메시지를 왼쪽 정렬로 변경합니다.

**구현:**
```typescript
// data 속성으로 CSS 제어
element.setAttribute('data-mngr', 'chat_sort');
```

### 채팅 두줄 보기

닉네임과 메시지를 두 줄로 분리하여 표시합니다.

```
Before: [닉네임] 안녕하세요
After:  [닉네임]
        안녕하세요
```

**구현:**
```typescript
element.setAttribute('data-mngr', 'chat_two_line');
```

### 관련 파일

```
src/features/chat/ChatOptions.tsx    # 설정 UI
src/stores/useChatStore.ts           # 상태 관리
src/chat.css                         # 스타일 정의
```

---

## 3. 뱃지 숨기기

특정 뱃지의 표시 여부를 제어합니다.

### 지원 뱃지

| 뱃지 | CSS 클래스 | 설명 |
|------|-----------|------|
| 구독 뱃지 | `hide-subscribe` | 채널 구독자 뱃지 |
| 열혈팬 뱃지 | `hide-topfan` | 후원 상위 유저 뱃지 |
| 팬클럽 뱃지 | `hide-fan` | 팬클럽 가입 뱃지 |
| 서포터 뱃지 | `hide-support` | 서포터 뱃지 |

### 구현 방식

```typescript
// domUtils.ts
function updateBadgeClasses(container: Element, settings: ChatSettings) {
  container.classList.toggle('hide-subscribe', settings.subscribeBadge);
  container.classList.toggle('hide-topfan', settings.topFanBadge);
  container.classList.toggle('hide-fan', settings.fanBadge);
  container.classList.toggle('hide-support', settings.supportBadge);
}
```

### 관련 파일

```
src/content-scripts/core/domUtils.ts    # 뱃지 클래스 업데이트
src/features/chat/ChatOptions.tsx       # 설정 UI
src/stores/useChatStore.ts              # 상태 관리
```

---

## 4. 설정 저장/로드

필터 설정을 파일로 내보내고 가져오는 기능입니다.

### 파일 형식

```text
[닉네임]
닉네임1
닉네임2
닉네임3

[아이디]
userid1
userid2
userid3
```

### 저장 (Export)

```typescript
// SaveModal.tsx
const exportSettings = () => {
  const nicks = useFilterStore.getState().nicks;
  const ids = useFilterStore.getState().ids;

  let content = '[닉네임]\n';
  nicks.forEach(n => content += n.user + '\n');
  content += '\n[아이디]\n';
  ids.forEach(i => content += i.user + '\n');

  saveAs(new Blob([content]), 'soop-plus-settings.txt');
};
```

### 로드 (Import)

```typescript
// LoadModal.tsx
const importSettings = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    // [닉네임], [아이디] 섹션 파싱
    // 스토어에 저장
  };
  reader.readAsText(file);
};
```

### 관련 파일

```
src/features/setting/Setting.tsx      # 저장/로드 버튼
src/features/setting/SaveModal.tsx    # 저장 모달
src/features/setting/LoadModal.tsx    # 로드 모달
```

---

## 5. 화면 캡처

라이브 방송 화면을 캡처하는 기능입니다.

### 구현

```typescript
// ui/captureButton.ts
function createCaptureButton() {
  const button = document.createElement('button');
  button.addEventListener('click', () => {
    // 비디오 요소 찾기
    // canvas에 그리기
    // 이미지로 다운로드
  });
  return button;
}
```

### 관련 파일

```
src/content-scripts/ui/captureButton.ts    # 캡처 버튼 생성
src/content-scripts/chat.tsx               # 버튼 삽입
```

---

## 6. 스트리머 미리보기

메인 페이지에서 스트리머 썸네일 호버 시 미리보기를 표시합니다.

### 동작

1. 메인 페이지의 스트리머 목록 감시
2. 마우스 호버 감지
3. 미리보기 이미지 표시

### 관련 파일

```
src/preview.ts    # 미리보기 전체 로직
```

---

## 7. 콜렉터 하이라이트

콜렉터 영역의 채팅을 하이라이트 처리합니다.

### 구현

```css
/* 하이라이트 활성화 시 */
.collector-highlight .chat-item {
  background-color: rgba(255, 255, 0, 0.1);
  border-left: 3px solid #ffd700;
}
```

### 관련 파일

```
src/stores/useCollectorStore.ts              # highlight 상태
src/features/collector/CollectorOptions.tsx  # 하이라이트 토글
src/chat.css                                 # 하이라이트 스타일
```

---

## 기능별 Chrome Storage 키

| 기능 | Storage 키 | 값 형식 |
|------|-----------|---------|
| 채팅 구분자 | `divider` | `{ isUse: boolean }` |
| 채팅 정렬 | `chatSetting` | `{ isUse: boolean }` |
| 두줄 보기 | `chatTwoLine` | `{ isUse: boolean }` |
| 구독 뱃지 | `subscribeBadge` | `{ isUse: boolean }` |
| 열혈팬 뱃지 | `topFanBadge` | `{ isUse: boolean }` |
| 팬클럽 뱃지 | `fanBadge` | `{ isUse: boolean }` |
| 서포터 뱃지 | `supportBadge` | `{ isUse: boolean }` |
| 콜렉터 | `collector` | `{ isEnabled, highlight }` |
| 콜렉터 필터 | `collectorFilters` | `FilterTypes` |
| 닉네임 목록 | `nicks` | `LegacyUser[]` |
| ID 목록 | `ids` | `LegacyUser[]` |
