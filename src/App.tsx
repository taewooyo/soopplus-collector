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
import Setting from "./Setting";

import "./App.css";

interface IProps {
  nicks: User[];
  ids: User[];
  toggle: ToggleData;
  collector: ChatCollectorData;
  // favoriteChannel: FavoriteChannelData[];
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
    <article className="wrapper">
      <header>
        <img width="180"/>
        <div className="top-menu">
          <a href="https://github.com/taewooyo/afreecaTV-plus/issues" target="_blank">버그 제보</a>
          <a href="https://www.sooplive.com" target="_blank">soop 바로가기</a>
        </div>
      </header>
      <ChatOptions {...props} />
      <CollectorOptions {...props} wrapStyle={{ marginTop: '1rem' }} />
      <footer>
        <b>2024 Soop Plus Project</b>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <a href="https://github.com/taewooyo" target="_blank">Creator: taewooyo</a>
          <span style={{ margin: '0 10px' }}>|</span>
          <a href="https://github.com/taewooyo/afreecaTV-plus/graphs/contributors" target="_blank">Contributor</a>
        </div>
      </footer>
    </article>
  )
}