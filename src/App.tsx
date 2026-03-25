import { ChatOptions } from "./features/chat";
import { CollectorOptions } from "./features/collector";
import { useHasHydratedChat } from "./stores/useChatStore";
import { useHasHydratedCollector } from "./stores/useCollectorStore";
import { useHasHydratedFilter } from "./stores/useFilterStore";

import "./App.css";

export default function App() {
  const hasChatHydrated = useHasHydratedChat();
  const hasCollectorHydrated = useHasHydratedCollector();
  const hasFilterHydrated = useHasHydratedFilter();

  const isHydrated = hasChatHydrated && hasCollectorHydrated && hasFilterHydrated;

  if (!isHydrated) {
    return (
      <article className="wrapper" role="main" aria-label="Soop Plus 확장프로그램 설정">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <span>로딩중...</span>
        </div>
      </article>
    );
  }

  return (
    <article className="wrapper" role="main" aria-label="Soop Plus 확장프로그램 설정">
      <header>
        <img
          width="180"
          alt="Soop Plus 로고"
        />
        <nav className="top-menu" aria-label="외부 링크">
          <a
            href="https://github.com/taewooyo/afreecaTV-plus/issues"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub에서 버그 제보하기"
          >
            버그 제보
          </a>
          <a
            href="https://www.sooplive.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Soop 라이브 사이트로 이동"
          >
            soop 바로가기
          </a>
        </nav>
      </header>
      <main>
        <ChatOptions />
        <CollectorOptions wrapStyle={{ marginTop: '1rem' }} />
      </main>
      <footer role="contentinfo">
        <b>2024 Soop Plus Project</b>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <a
            href="https://github.com/taewooyo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="제작자 taewooyo의 GitHub 프로필"
          >
            Creator: taewooyo
          </a>
          <span style={{ margin: '0 10px' }} aria-hidden="true">|</span>
          <a
            href="https://github.com/taewooyo/afreecaTV-plus/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="프로젝트 기여자 목록 보기"
          >
            Contributor
          </a>
        </div>
      </footer>
    </article>
  );
}
