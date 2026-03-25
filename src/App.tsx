import { ChatCollectorData } from "./model/ChatCollectorData";
import { ChatSetting } from "./model/ChatSetting";
import { ChatTwoLine } from "./model/ChatTwoLine";
import { Divider } from "./model/Divider";
import { FanBadge } from "./model/FanBadge";
import { Highlight } from "./model/Highlight";
import { SubscribeBadge } from "./model/SubscribeBadge";
import { SupportBadge } from "./model/SupportBadge";
import { ToggleData } from "./model/ToggleData";
import { TopfanBadge } from "./model/TopfanBadge";
import { User } from "./model/User";
import ChatOptions from "./ChatOptions";
import CollectorOptions from "./CollectorOptions";

import "./App.css";

interface IProps {
  nicks: User[];
  ids: User[];
  toggle: ToggleData;
  collector: ChatCollectorData;
  chatSetting: ChatSetting;
  chatTwoLine: ChatTwoLine;
  fanBadge: FanBadge;
  subscribeBadge: SubscribeBadge;
  supportBadge: SupportBadge;
  topfanBadge: TopfanBadge;
  divider: Divider;
  highlight: Highlight;
}

export default function App(props: IProps) {
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
        <ChatOptions {...props} />
        <CollectorOptions {...props} wrapStyle={{ marginTop: '1rem' }} />
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