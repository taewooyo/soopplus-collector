# 프로젝트 아키텍처

## 디렉토리 구조

```
src/
├── content-scripts/          # 웹 페이지에 주입되는 스크립트
│   ├── chat.tsx             # 라이브 채팅 콘텐츠 스크립트
│   ├── vod.tsx              # VOD 채팅 콘텐츠 스크립트
│   ├── core/                # 핵심 로직 모듈
│   │   ├── constants.ts     # 상수 정의
│   │   ├── types.ts         # 타입 정의
│   │   ├── chatFilter.ts    # 채팅 필터링 로직
│   │   ├── domCache.ts      # DOM 요소 캐싱
│   │   ├── domUtils.ts      # DOM 조작 유틸리티
│   │   ├── observer.ts      # Mutation Observer
│   │   └── storageManager.ts # Chrome Storage 관리
│   └── ui/                  # UI 관련 모듈
│       ├── captureButton.ts # 화면 캡처 버튼
│       ├── collectorSwap.ts # 콜렉터 스왑 UI
│       └── resizeHandler.ts # 리사이즈 핸들러
│
├── features/                 # React 기능 컴포넌트
│   ├── chat/                # 채팅 설정
│   │   └── ChatOptions.tsx
│   ├── collector/           # 콜렉터 설정
│   │   └── CollectorOptions.tsx
│   └── setting/             # 설정 저장/로드
│       ├── Setting.tsx
│       ├── SaveModal.tsx
│       └── LoadModal.tsx
│
├── components/               # 공유 UI 컴포넌트
│   ├── Toggle/              # 토글 스위치
│   ├── Card/                # 카드 컨테이너
│   ├── InputForm/           # 입력 폼
│   └── SubTitle/            # 부제목
│
├── stores/                   # Zustand 상태 관리
│   ├── useChatStore.ts      # 채팅 설정 상태
│   ├── useCollectorStore.ts # 콜렉터 설정 상태
│   └── useFilterStore.ts    # 필터 목록 상태
│
├── interfaces/               # TypeScript 인터페이스
│   ├── setting.ts           # 설정 관련
│   ├── user.ts              # 사용자 관련
│   └── filter.ts            # 필터 관련
│
├── App.tsx                   # 메인 앱 컴포넌트
├── index.tsx                 # Popup UI 진입점
└── preview.ts                # 스트리머 미리보기
```

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────────┐ │
│  │   Popup UI       │      │      Content Scripts          │ │
│  │   (React App)    │      │                               │ │
│  │                  │      │  ┌────────────┐ ┌──────────┐ │ │
│  │  ┌────────────┐  │      │  │ chat.tsx   │ │ vod.tsx  │ │ │
│  │  │ App.tsx    │  │      │  │ (라이브)   │ │ (VOD)    │ │ │
│  │  └─────┬──────┘  │      │  └─────┬──────┘ └────┬─────┘ │ │
│  │        │         │      │        │              │       │ │
│  │  ┌─────┴──────┐  │      │  ┌─────┴──────────────┴─────┐ │ │
│  │  │ features/  │  │      │  │      core/ modules       │ │ │
│  │  │ - Chat     │  │      │  │ - chatFilter.ts          │ │ │
│  │  │ - Collector│  │      │  │ - storageManager.ts      │ │ │
│  │  │ - Setting  │  │      │  │ - domUtils.ts            │ │ │
│  │  └─────┬──────┘  │      │  │ - observer.ts            │ │ │
│  │        │         │      │  └──────────────────────────┘ │ │
│  │  ┌─────┴──────┐  │      │                               │ │
│  │  │ components/│  │      └──────────────────────────────┘ │
│  │  └────────────┘  │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Zustand Stores (stores/)                 │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────┐    │   │
│  │  │useChatStore│ │useCollector│ │ useFilterStore │    │   │
│  │  │            │ │   Store    │ │                │    │   │
│  │  └─────┬──────┘ └─────┬──────┘ └───────┬────────┘    │   │
│  └────────┼──────────────┼────────────────┼─────────────┘   │
│           │              │                │                  │
│           ▼              ▼                ▼                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Chrome Storage                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 핵심 컴포넌트

### 1. Popup UI (React App)

확장 프로그램 아이콘 클릭 시 표시되는 설정 화면입니다.

```
index.tsx (진입점)
    ↓
App.tsx (메인 앱)
    ├── ChatOptions (채팅 설정)
    ├── CollectorOptions (콜렉터 설정)
    └── Setting (저장/로드)
```

**주요 역할:**
- 사용자 설정 UI 제공
- Zustand 스토어를 통한 상태 관리
- Chrome Storage와 동기화

### 2. Content Scripts

웹 페이지(SOOP 사이트)에 주입되어 실행되는 스크립트입니다.

```
chat.tsx / vod.tsx
    ↓
storageManager.ts (설정 로드)
    ↓
observer.ts (채팅 감시)
    ↓
chatFilter.ts (필터링 로직)
    ↓
domUtils.ts (DOM 조작)
```

**주요 역할:**
- 채팅 DOM 변경 감지 (MutationObserver)
- 필터링 조건에 맞는 채팅 추출
- 콜렉터 영역에 채팅 복사
- 설정 변경 실시간 반영

### 3. Zustand Stores

전역 상태 관리를 담당합니다.

| Store | 역할 | 주요 상태 |
|-------|------|---------|
| `useChatStore` | 채팅 UI 설정 | divider, chatSetting, chatTwoLine, 뱃지 설정 |
| `useCollectorStore` | 콜렉터 설정 | isEnabled, highlight, filters |
| `useFilterStore` | 필터 목록 | nicks, ids |

**특징:**
- `persist` 미들웨어로 Chrome Storage 자동 동기화
- `hydrate` 함수로 초기 데이터 로드

### 4. Chrome Storage

확장 프로그램의 영구 저장소입니다.

```typescript
// 저장 구조
{
  // 채팅 설정
  "divider": { "isUse": boolean },
  "chatSetting": { "isUse": boolean },
  "chatTwoLine": { "isUse": boolean },
  "subscribeBadge": { "isUse": boolean },
  ...

  // 콜렉터 설정
  "collector": { "isEnabled": boolean, "highlight": boolean },
  "collectorFilters": { streamer, manager, topfan, ... },

  // 필터 목록
  "nicks": [{ "isNickname": true, "user": "닉네임" }, ...],
  "ids": [{ "isNickname": false, "user": "아이디" }, ...]
}
```

## 데이터 흐름

### 설정 변경 흐름

```
사용자 액션 (토글 클릭)
    ↓
Zustand Store Action (toggleXxx)
    ↓
Store State 업데이트
    ↓
Chrome Storage 저장 (persist 미들웨어)
    ↓
storage.onChanged 이벤트 발생
    ↓
Content Script 수신
    ↓
DOM 업데이트 (설정 반영)
```

### 채팅 필터링 흐름

```
새로운 채팅 메시지 (DOM 변경)
    ↓
MutationObserver 감지
    ↓
extractUserInfo() (사용자 정보 추출)
    ↓
filterLiveChat() / filterVodChat()
    ├── 닉네임 목록 확인 (nicksMap)
    ├── ID 목록 확인 (idsSet)
    └── 사용자 등급 확인 (filters)
    ↓
조건 충족 시 채팅 복사
    ↓
콜렉터 영역에 추가
    ↓
최대 개수 초과 시 오래된 채팅 제거
```

## 파일별 책임

### Content Scripts Core

| 파일 | 책임 |
|------|------|
| `constants.ts` | 레이아웃 상수, DOM ID, CSS 클래스 정의 |
| `types.ts` | Content Script용 타입 정의 |
| `chatFilter.ts` | 채팅 필터링 로직, 사용자 정보 추출 |
| `domCache.ts` | 자주 사용하는 DOM 요소 캐싱 |
| `domUtils.ts` | DOM 조작 유틸리티 함수 |
| `observer.ts` | MutationObserver 관리 |
| `storageManager.ts` | Chrome Storage 접근 및 캐싱 |

### Features

| 파일 | 책임 |
|------|------|
| `ChatOptions.tsx` | 채팅 설정 UI (7개 토글) |
| `CollectorOptions.tsx` | 콜렉터 설정 UI, 필터 입력/표시 |
| `Setting.tsx` | 저장/로드 버튼 |
| `SaveModal.tsx` | 필터 설정 파일 다운로드 |
| `LoadModal.tsx` | 파일에서 필터 설정 로드 |

### Components

| 파일 | 책임 |
|------|------|
| `Toggle/` | 재사용 가능한 토글 스위치 |
| `Card/` | 섹션 카드 컨테이너 |
| `InputForm/` | 닉네임/ID 입력 폼 |
| `SubTitle/` | 섹션 부제목 |

## Manifest V3 구성

```json
{
  "manifest_version": 3,
  "action": {
    "default_popup": "index.html"  // Popup UI
  },
  "content_scripts": [
    {
      "matches": ["https://*.sooplive.co.kr/*", "https://*.sooplive.com/*"],
      "js": ["preview.js", "chat.js", "vod.js"]
    }
  ],
  "permissions": ["storage"],
  "host_permissions": ["https://myapi.afreecatv.com/api/favorite"]
}
```
