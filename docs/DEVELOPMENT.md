# 개발 가이드

## 개발 환경 설정

### 필수 요구사항

- Node.js 16.x 이상
- npm 또는 yarn
- Chrome 브라우저

### 설치

```bash
# 저장소 클론
git clone https://github.com/taewooyo/Prefreeca.git
cd afreecaTV-plus

# 의존성 설치
npm install
```

### 빌드

```bash
# 개발 빌드
npm run build

# 감시 모드 (변경 시 자동 빌드)
npm run watch  # package.json에 스크립트 추가 필요
```

### Chrome에서 테스트

1. Chrome에서 `chrome://extensions` 접속
2. "개발자 모드" 활성화 (우측 상단)
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `dist` 폴더 선택
5. SOOP 사이트에서 확장 프로그램 테스트

---

## 프로젝트 구조 이해

### 진입점

```
src/index.tsx     → Popup UI (확장 프로그램 아이콘 클릭 시)
src/chat.tsx      → 라이브 채팅 페이지에 주입
src/vodChat.tsx   → VOD 페이지에 주입
src/preview.ts    → 메인 페이지에 주입
```

### 주요 모듈

```
stores/           → Zustand 상태 관리
features/         → 페이지별 React 컴포넌트
components/       → 공유 UI 컴포넌트
content-scripts/  → 웹 페이지 조작 로직
interfaces/       → TypeScript 인터페이스
```

---

## 새 기능 추가하기

### 1. 새 토글 설정 추가

**예시: "채팅 시간 표시" 토글 추가**

#### Step 1: 인터페이스 정의

```typescript
// src/interfaces/setting.ts
export interface ChatSettings {
  // ... 기존 필드
  showTimestamp: BooleanSetting;  // 추가
}
```

#### Step 2: Store에 상태 추가

```typescript
// src/stores/useChatStore.ts
interface ChatState {
  // ... 기존 상태
  showTimestamp: boolean;
  toggleShowTimestamp: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // ... 기존 상태
      showTimestamp: false,

      toggleShowTimestamp: () => {
        const newValue = !get().showTimestamp;
        set({ showTimestamp: newValue });
        chrome.storage.local.set({
          showTimestamp: { isUse: newValue }
        });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

#### Step 3: UI 컴포넌트 추가

```typescript
// src/features/chat/ChatOptions.tsx
const ChatOptions: React.FC = () => {
  const { showTimestamp, toggleShowTimestamp } = useChatStore();

  return (
    <Card>
      {/* ... 기존 토글 */}
      <Toggle
        onChange={toggleShowTimestamp}
        label="채팅 시간 표시"
        value={showTimestamp}
        description="채팅 메시지에 시간을 표시합니다"
      />
    </Card>
  );
};
```

#### Step 4: Content Script에서 처리

```typescript
// src/content-scripts/chat.tsx
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.showTimestamp) {
    const isEnabled = changes.showTimestamp.newValue.isUse;
    updateTimestampDisplay(isEnabled);
  }
});

function updateTimestampDisplay(enabled: boolean) {
  const chatArea = document.querySelector('.chat-area');
  chatArea?.classList.toggle('show-timestamp', enabled);
}
```

#### Step 5: CSS 스타일 추가

```css
/* src/chat.css */
.chat-area:not(.show-timestamp) .chat-timestamp {
  display: none;
}
```

---

### 2. 새 필터 조건 추가

**예시: "VIP 유저" 필터 추가**

#### Step 1: 인터페이스 수정

```typescript
// src/interfaces/setting.ts
export interface FilterTypes {
  // ... 기존 필터
  vip: boolean;  // 추가
}
```

#### Step 2: Store 수정

```typescript
// src/stores/useCollectorStore.ts
const defaultFilters: FilterTypes = {
  // ... 기존 기본값
  vip: false,
};
```

#### Step 3: 필터링 로직 추가

```typescript
// src/content-scripts/core/chatFilter.ts
export function filterLiveChat(
  userInfo: UserInfo,
  filters: FilterTypes,
  nicksMap: Map<string, boolean>,
  idsSet: Set<string>
): boolean {
  // ... 기존 로직

  // VIP 필터 추가
  if (filters.vip && userInfo.grade === 'vip') {
    return true;
  }

  return false;
}
```

#### Step 4: UI에 토글 추가

```typescript
// src/features/collector/CollectorOptions.tsx
<Toggle
  onChange={() => toggleFilter('vip')}
  label="VIP"
  value={filters.vip}
  description="VIP 유저의 채팅을 수집합니다"
/>
```

---

### 3. 새 공유 컴포넌트 추가

**예시: Dropdown 컴포넌트**

```typescript
// src/components/Dropdown/index.tsx
import React from 'react';
import { Container, Option } from './style';

interface DropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  label,
}) => {
  return (
    <Container>
      {label && <label>{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </select>
    </Container>
  );
};
```

```typescript
// src/components/Dropdown/style.ts
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Option = styled.option`
  padding: 8px;
`;
```

---

## 코드 스타일 가이드

### TypeScript

```typescript
// 인터페이스 명명: PascalCase
interface UserInfo {
  nickname: string;
  userId: string;
}

// 타입 별칭: PascalCase
type FilterCallback = (user: UserInfo) => boolean;

// 상수: UPPER_SNAKE_CASE
const MAX_CHAT_COUNT = 200;

// 함수: camelCase
function filterChat(chat: Element): boolean {
  // ...
}

// React 컴포넌트: PascalCase
const ChatOptions: React.FC = () => {
  // ...
};
```

### React

```typescript
// 함수형 컴포넌트 사용
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // hooks는 최상단에
  const [state, setState] = useState(false);
  const store = useMyStore();

  // 이벤트 핸들러
  const handleClick = () => {
    // ...
  };

  return (
    <div onClick={handleClick}>
      {/* ... */}
    </div>
  );
};
```

### styled-components

```typescript
// 컴포넌트 명명: PascalCase
const Container = styled.div`
  display: flex;
`;

// props 사용
const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? 'blue' : 'gray'};
`;
```

---

## 디버깅

### Console 로그

```typescript
// 개발 중 로그
if (process.env.NODE_ENV !== 'production') {
  console.log('[SOOP Plus]', 'Debug info:', data);
}
```

### Chrome DevTools

1. F12로 DevTools 열기
2. **Console**: 로그 확인
3. **Elements**: DOM 구조 확인
4. **Network**: API 요청 확인
5. **Application > Storage > Local Storage**: 확장 프로그램 저장소 확인

### 확장 프로그램 디버깅

1. `chrome://extensions` 접속
2. SOOP Plus의 "검사" 클릭
3. Popup의 DevTools 열림

---

## 테스트

### 수동 테스트 체크리스트

- [ ] Popup UI가 올바르게 렌더링되는가?
- [ ] 토글 상태가 저장되는가?
- [ ] Content Script가 SOOP 페이지에 주입되는가?
- [ ] 채팅 필터링이 정상 동작하는가?
- [ ] 설정 변경이 실시간으로 반영되는가?
- [ ] 콜렉터 리사이즈가 동작하는가?
- [ ] 설정 저장/로드가 동작하는가?

### 테스트 시나리오

1. **새 설치 테스트**
   - 확장 프로그램 삭제 후 재설치
   - 기본값이 올바른지 확인

2. **설정 지속성 테스트**
   - 설정 변경 후 브라우저 재시작
   - 설정이 유지되는지 확인

3. **페이지 전환 테스트**
   - 라이브 → VOD → 메인 페이지 이동
   - 각 페이지에서 기능 정상 동작 확인

---

## 배포

### 버전 업데이트

```json
// public/manifest.json
{
  "version": "2.3.4"  // 버전 증가
}
```

### 빌드 및 패키징

```bash
# 프로덕션 빌드
npm run build

# dist 폴더를 zip으로 압축
cd dist
zip -r ../soop-plus-v2.3.4.zip .
```

### Chrome Web Store 업로드

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
2. 확장 프로그램 선택
3. "새 버전 업로드"
4. zip 파일 업로드
5. 검토 제출

---

## 문제 해결

### 빌드 오류

```bash
# node_modules 재설치
rm -rf node_modules
npm install

# 캐시 정리
rm -rf dist
npm run build
```

### Content Script 미작동

1. manifest.json의 `matches` URL 확인
2. SOOP 사이트 URL 변경 여부 확인
3. Console에서 에러 확인

### Storage 문제

```javascript
// Console에서 Storage 확인
chrome.storage.local.get(null, (data) => {
  console.log('All storage data:', data);
});

// Storage 초기화
chrome.storage.local.clear();
```
