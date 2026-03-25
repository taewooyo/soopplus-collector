# API 레퍼런스

주요 모듈의 API 문서입니다.

## Stores

### useChatStore

채팅 UI 설정을 관리하는 Zustand 스토어입니다.

```typescript
import { useChatStore } from '@/stores/useChatStore';
```

#### State

| 속성 | 타입 | 설명 |
|------|------|------|
| `divider` | `boolean` | 채팅 구분자 표시 여부 |
| `chatSetting` | `boolean` | 채팅 시작 정렬 여부 |
| `chatTwoLine` | `boolean` | 채팅 두줄 보기 여부 |
| `subscribeBadge` | `boolean` | 구독 뱃지 숨김 여부 |
| `topFanBadge` | `boolean` | 열혈팬 뱃지 숨김 여부 |
| `fanBadge` | `boolean` | 팬클럽 뱃지 숨김 여부 |
| `supportBadge` | `boolean` | 서포터 뱃지 숨김 여부 |
| `isHydrated` | `boolean` | 초기화 완료 여부 |

#### Actions

```typescript
// 토글 함수들
toggleDivider(): void
toggleChatSetting(): void
toggleChatTwoLine(): void
toggleSubscribeBadge(): void
toggleTopFanBadge(): void
toggleFanBadge(): void
toggleSupportBadge(): void

// 초기화
hydrate(): Promise<void>
```

#### 사용 예시

```typescript
const ChatComponent: React.FC = () => {
  const { divider, toggleDivider, isHydrated } = useChatStore();

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <Toggle
      value={divider}
      onChange={toggleDivider}
      label="채팅 구분자"
    />
  );
};
```

---

### useCollectorStore

채팅 콜렉터 설정을 관리하는 Zustand 스토어입니다.

```typescript
import { useCollectorStore } from '@/stores/useCollectorStore';
```

#### State

| 속성 | 타입 | 설명 |
|------|------|------|
| `isEnabled` | `boolean` | 콜렉터 활성화 여부 |
| `highlight` | `boolean` | 하이라이트 표시 여부 |
| `filters` | `FilterTypes` | 사용자 등급별 필터 |
| `isHydrated` | `boolean` | 초기화 완료 여부 |

#### FilterTypes

```typescript
interface FilterTypes {
  streamer: boolean;   // 스트리머
  manager: boolean;    // 매니저
  topfan: boolean;     // 열혈팬
  gudok: boolean;      // 구독자
  fan: boolean;        // 팬클럽
  user: boolean;       // 일반 유저
}
```

#### Actions

```typescript
toggleEnabled(): void
toggleHighlight(): void
toggleFilter(key: keyof FilterTypes): void
hydrate(): Promise<void>
```

#### 사용 예시

```typescript
const CollectorComponent: React.FC = () => {
  const { isEnabled, toggleEnabled, filters, toggleFilter } = useCollectorStore();

  return (
    <>
      <Toggle value={isEnabled} onChange={toggleEnabled} label="콜렉터" />
      <Toggle
        value={filters.manager}
        onChange={() => toggleFilter('manager')}
        label="매니저"
      />
    </>
  );
};
```

---

### useFilterStore

닉네임/ID 필터 목록을 관리하는 Zustand 스토어입니다.

```typescript
import { useFilterStore } from '@/stores/useFilterStore';
```

#### State

| 속성 | 타입 | 설명 |
|------|------|------|
| `nicks` | `LegacyUser[]` | 닉네임 필터 목록 |
| `ids` | `LegacyUser[]` | ID 필터 목록 |
| `isHydrated` | `boolean` | 초기화 완료 여부 |

#### LegacyUser

```typescript
interface LegacyUser {
  isNickname: boolean;  // true: 닉네임, false: ID
  user: string;         // 사용자 값
}
```

#### Actions

```typescript
addNick(nick: string): void
removeNick(nick: string): void
addId(id: string): void
removeId(id: string): void
clearAll(): void
setNicks(nicks: LegacyUser[]): void
setIds(ids: LegacyUser[]): void
hydrate(): Promise<void>
```

#### 사용 예시

```typescript
const FilterComponent: React.FC = () => {
  const { nicks, addNick, removeNick } = useFilterStore();

  const handleAdd = (value: string) => {
    addNick(value);
  };

  return (
    <>
      <InputForm onAdd={handleAdd} placeholder="닉네임 입력" />
      <ul>
        {nicks.map((n) => (
          <li key={n.user} onClick={() => removeNick(n.user)}>
            {n.user}
          </li>
        ))}
      </ul>
    </>
  );
};
```

---

## Content Script Core

### storageManager

Chrome Storage를 관리하는 싱글톤 클래스입니다.

```typescript
import { storageManager } from '@/content-scripts/core/storageManager';
```

#### Methods

```typescript
// 초기화 (설정 로드)
async initialize(): Promise<void>

// 닉네임 Map 반환
getNicksMap(): Map<string, boolean>

// ID Set 반환
getIdsSet(): Set<string>

// 콜렉터 설정 반환
getCollector(): { isEnabled: boolean; highlight: boolean }

// 콜렉터 필터 반환
getFilters(): FilterTypes

// 채팅 설정 반환
getChatSetting(): ChatSettings
```

#### 사용 예시

```typescript
// 초기화
await storageManager.initialize();

// 닉네임 확인
const nicksMap = storageManager.getNicksMap();
if (nicksMap.has('홍길동')) {
  console.log('필터 목록에 있음');
}

// 콜렉터 상태 확인
const collector = storageManager.getCollector();
if (collector.isEnabled) {
  initializeCollector();
}
```

---

### chatFilter

채팅 필터링 로직을 제공합니다.

```typescript
import {
  filterLiveChat,
  filterVodChat,
  extractLiveChatUserInfo,
  extractVodChatUserInfo
} from '@/content-scripts/core/chatFilter';
```

#### Functions

```typescript
// 라이브 채팅 필터링
filterLiveChat(
  userInfo: UserInfo,
  filters: FilterTypes,
  nicksMap: Map<string, boolean>,
  idsSet: Set<string>
): boolean

// VOD 채팅 필터링
filterVodChat(
  userInfo: UserInfo,
  filters: FilterTypes,
  nicksMap: Map<string, boolean>,
  idsSet: Set<string>
): boolean

// 라이브 채팅 사용자 정보 추출
extractLiveChatUserInfo(chatElement: Element): UserInfo | null

// VOD 채팅 사용자 정보 추출
extractVodChatUserInfo(chatElement: Element): UserInfo | null
```

#### UserInfo

```typescript
interface UserInfo {
  nickname: string;
  userId: string;
  grade: UserGrade;
}

type UserGrade =
  | 'streamer'
  | 'manager'
  | 'topfan'
  | 'gudok'
  | 'fan'
  | 'user';
```

#### 사용 예시

```typescript
const handleNewChat = (chatElement: Element) => {
  const userInfo = extractLiveChatUserInfo(chatElement);
  if (!userInfo) return;

  const nicksMap = storageManager.getNicksMap();
  const idsSet = storageManager.getIdsSet();
  const filters = storageManager.getFilters();

  const shouldCollect = filterLiveChat(userInfo, filters, nicksMap, idsSet);

  if (shouldCollect) {
    addToCollector(chatElement);
  }
};
```

---

### domUtils

DOM 조작 유틸리티 함수들입니다.

```typescript
import {
  trimChildren,
  updateBadgeClasses,
  updateChatDisplayMode,
  createResizeHandle,
  scrollToBottomIfNeeded
} from '@/content-scripts/core/domUtils';
```

#### Functions

```typescript
// 자식 요소 정리 (최대 개수 유지)
trimChildren(parent: Element, maxChildren: number): void

// 뱃지 숨김 클래스 업데이트
updateBadgeClasses(container: Element, settings: ChatSettings): void

// 채팅 디스플레이 모드 업데이트
updateChatDisplayMode(
  container: Element,
  divider: boolean,
  chatSetting: boolean,
  chatTwoLine: boolean
): void

// 리사이즈 핸들 생성
createResizeHandle(): HTMLElement

// 스크롤 하단 유지
scrollToBottomIfNeeded(container: Element): void
```

#### 사용 예시

```typescript
// 채팅 개수 제한
const collectorContainer = document.getElementById('collector');
trimChildren(collectorContainer, 200);

// 뱃지 클래스 업데이트
const chatArea = document.querySelector('.chat-area');
updateBadgeClasses(chatArea, {
  subscribeBadge: true,
  topFanBadge: false,
  fanBadge: true,
  supportBadge: false
});
```

---

### constants

상수 정의입니다.

```typescript
import {
  LAYOUT,
  DEFAULTS,
  DOM_IDS,
  CSS_CLASSES
} from '@/content-scripts/core/constants';
```

#### LAYOUT

```typescript
const LAYOUT = {
  HEADER_HEIGHT: 56,
  SIDEBAR_WIDTH: 240,
  // ... 레이아웃 오프셋
};
```

#### DEFAULTS

```typescript
const DEFAULTS = {
  CONTAINER_RATIO: 30,       // 콜렉터 높이 비율 (%)
  MAX_FILTERED_CHATS: 200,   // 최대 채팅 개수
  FLUSH_INTERVAL: 300,       // DOM 업데이트 간격 (ms)
};
```

#### DOM_IDS

```typescript
const DOM_IDS = {
  COLLECTOR_CONTAINER: 'soop-plus-collector',
  FILTER_AREA: 'soop-plus-filter-area',
  RESIZE_HANDLE: 'soop-plus-resize-handle',
};
```

#### CSS_CLASSES

```typescript
const CSS_CLASSES = {
  HIDDEN: 'soop-plus-hidden',
  HIGHLIGHT: 'soop-plus-highlight',
  // ...
};
```

---

## Components

### Toggle

토글 스위치 컴포넌트입니다.

```typescript
import { Toggle } from '@/components/Toggle';
```

#### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `value` | `boolean` | Y | 현재 상태 |
| `onChange` | `() => void` | Y | 변경 콜백 |
| `label` | `string` | Y | 라벨 텍스트 |
| `description` | `string` | N | 접근성 설명 |

#### 사용 예시

```tsx
<Toggle
  value={isEnabled}
  onChange={handleToggle}
  label="기능 활성화"
  description="이 기능을 활성화하면 추가 옵션이 표시됩니다"
/>
```

---

### Card

카드 컨테이너 컴포넌트입니다.

```typescript
import { Card } from '@/components/Card';
```

#### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `children` | `ReactNode` | Y | 자식 요소 |
| `style` | `CSSProperties` | N | 커스텀 스타일 |

#### 사용 예시

```tsx
<Card style={{ marginBottom: '16px' }}>
  <h3>설정</h3>
  <Toggle ... />
  <Toggle ... />
</Card>
```

---

### InputForm

입력 폼 컴포넌트입니다.

```typescript
import { InputForm } from '@/components/InputForm';
```

#### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `name` | `string` | Y | 입력 필드 이름 |
| `placeholder` | `string` | N | 플레이스홀더 |
| `onAdd` | `(value: string) => void` | Y | 추가 콜백 |

#### 사용 예시

```tsx
<InputForm
  name="nickname"
  placeholder="닉네임을 입력하세요"
  onAdd={(value) => {
    console.log('Added:', value);
    addNick(value);
  }}
/>
```

---

### SubTitle

부제목 컴포넌트입니다.

```typescript
import { SubTitle } from '@/components/SubTitle';
```

#### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `children` | `ReactNode` | Y | 텍스트 내용 |

#### 사용 예시

```tsx
<Card>
  <SubTitle>필터 설정</SubTitle>
  {/* 내용 */}
</Card>
```

---

## Interfaces

### BooleanSetting

```typescript
interface BooleanSetting {
  isUse: boolean;
}
```

### ChatSettings

```typescript
interface ChatSettings {
  divider: BooleanSetting;
  chatSetting: BooleanSetting;
  chatTwoLine: BooleanSetting;
  subscribeBadge: BooleanSetting;
  topFanBadge: BooleanSetting;
  fanBadge: BooleanSetting;
  supportBadge: BooleanSetting;
}
```

### CollectorSettings

```typescript
interface CollectorSettings {
  isEnabled: boolean;
  highlight: boolean;
  filters: FilterTypes;
}
```

### FilterTypes

```typescript
interface FilterTypes {
  streamer: boolean;
  manager: boolean;
  topfan: boolean;
  gudok: boolean;
  fan: boolean;
  user: boolean;
}
```

### LegacyUser

```typescript
interface LegacyUser {
  isNickname: boolean;
  user: string;
}
```
