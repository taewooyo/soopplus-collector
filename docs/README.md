# SOOP Plus 프로젝트 문서

SOOP(구 아프리카TV) 스트리밍 서비스를 위한 Chrome 확장 프로그램입니다.

## 문서 목록

| 문서 | 설명 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 프로젝트 구조 및 아키텍처 |
| [FEATURES.md](./FEATURES.md) | 주요 기능 설명 |
| [OPTIMIZATION.md](./OPTIMIZATION.md) | 성능 최적화 기법 |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 개발 가이드 |
| [API.md](./API.md) | 주요 모듈 API 레퍼런스 |

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 빌드
npm run build

# Chrome에서 로드
# 1. chrome://extensions 접속
# 2. "개발자 모드" 활성화
# 3. "압축해제된 확장 프로그램 로드"
# 4. dist 폴더 선택
```

## 기술 스택

- **프론트엔드**: React 18, TypeScript, styled-components
- **상태 관리**: Zustand
- **빌드**: Webpack 5, SWC
- **스타일**: SCSS, Bootstrap, PicoCSS

## 주요 기능

1. **채팅 콜렉터**: 특정 사용자의 채팅만 필터링하여 별도 영역에 표시
2. **채팅 UI 커스터마이징**: 구분자, 정렬, 두줄 보기 등
3. **뱃지 숨기기**: 구독/팬 뱃지 표시 제어
4. **설정 저장/로드**: 필터 설정을 파일로 관리
5. **화면 캡처**: 라이브 화면 캡처 기능
