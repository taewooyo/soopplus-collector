import Toggle from "./components/Toggle";
import { useState } from "react";
import { ChatSetting } from "./model/ChatSetting";
import { ChatTwoLine } from "./model/ChatTwoLine";
import { FanBadge } from "./model/FanBadge";
import { SubscribeBadge } from "./model/SubscribeBadge";
import { SupportBadge } from "./model/SupportBadge";
import { TopfanBadge } from "./model/TopfanBadge";
import { Divider } from "./model/Divider";
import SubTitle from "./components/SubTitle";
import Card from "./components/Card";
import styled from "styled-components";

interface IProps {
  divider: Divider;
  chatSetting: ChatSetting;
  chatTwoLine: ChatTwoLine;
  subscribeBadge: SubscribeBadge;
  topfanBadge: TopfanBadge;
  fanBadge: FanBadge;
  supportBadge: SupportBadge;
  wrapStyle?: React.CSSProperties
}

const ChatOptions = ({ wrapStyle, ...props }: IProps) => {
  const [divider, setDivider] = useState(props.divider);
  const [chatSetting, setChatSetting] = useState(props.chatSetting);
  const [chatTwoLine, setChatTwoLine] = useState(props.chatTwoLine);
  const [subscribeBadge, setSubscribeBadage] = useState(props.subscribeBadge);
  const [topFanBadge, setTopFanBadge] = useState(props.topfanBadge);
  const [fanBadge, setFanBadge] = useState(props.fanBadge);
  const [supportBadge, setSupportBadge] = useState(props.supportBadge);

  const changeDivider = () => {
    let newDivider = { isUse: !divider.isUse };
    chrome.storage.local.set({ divider: newDivider }, () => {
      setDivider(newDivider);
    });
  };

  const changeChatSetting = () => {
    let newChatSetting = { isUse: !chatSetting.isUse };
    chrome.storage.local.set({ chatSetting: newChatSetting }, () => {
      setChatSetting(newChatSetting);
      if (chatTwoLine.isUse) changeChatTwoLine();
    });
  };

  const changeChatTwoLine = () => {
    let newChatTwoLine = { isUse: !chatTwoLine.isUse };
    chrome.storage.local.set({ chatTwoLine: newChatTwoLine }, () => {
      setChatTwoLine(newChatTwoLine);
      if (chatSetting.isUse) changeChatSetting();
    });
  };

  const changeSubscribeBadge = () => {
    let newSubscribeBadge = { isUse: !subscribeBadge.isUse };
    chrome.storage.local.set({ subscribeBadge: newSubscribeBadge }, () => {
      setSubscribeBadage(newSubscribeBadge);
    });
  };

  const changeTopFanBadge = () => {
    let newTopFanBadge = { isUse: !topFanBadge.isUse };
    chrome.storage.local.set({ topFanBadge: newTopFanBadge }, () => {
      setTopFanBadge(newTopFanBadge);
    });
  };

  const changeFanBadge = () => {
    let newFanBadge = { isUse: !fanBadge.isUse };
    chrome.storage.local.set({ fanBadge: newFanBadge }, () => {
      setFanBadge(newFanBadge);
    });
  };

  const changeSupportBadge = () => {
    let newSupportBadge = { isUse: !supportBadge.isUse };
    chrome.storage.local.set({ supportBadge: newSupportBadge }, () => {
      setSupportBadge(newSupportBadge);
    });
  };

  return (
    <Card style={wrapStyle}>
      <Wrapper>
        <SubTitle>채팅창 설정</SubTitle>
        <div className="parent" role="group" aria-label="채팅창 설정 옵션">
          <Toggle
            onChange={changeDivider}
            label="채팅 구분자"
            value={divider.isUse}
            description="채팅 메시지 사이에 구분선을 추가합니다"
          />
          <Toggle
            onChange={changeChatSetting}
            label="채팅 시작 정렬"
            value={chatSetting.isUse}
            description="채팅 메시지를 왼쪽 정렬로 시작합니다"
          />
          <Toggle
            onChange={changeChatTwoLine}
            label="채팅 두줄 보기"
            value={chatTwoLine.isUse}
            description="채팅을 두 줄로 표시합니다"
          />
          <Toggle
            onChange={changeSubscribeBadge}
            label="구독 뱃지 제거"
            value={subscribeBadge.isUse}
            description="구독자 뱃지를 숨깁니다"
          />
          <Toggle
            onChange={changeTopFanBadge}
            label="열혈팬 뱃지 제거"
            value={topFanBadge.isUse}
            description="열혈팬 뱃지를 숨깁니다"
          />
          <Toggle
            onChange={changeFanBadge}
            label="팬클럽 뱃지 제거"
            value={fanBadge.isUse}
            description="팬클럽 뱃지를 숨깁니다"
          />
          <Toggle
            onChange={changeSupportBadge}
            label="서포터 뱃지 제거"
            value={supportBadge.isUse}
            description="서포터 뱃지를 숨깁니다"
          />
        </div>
      </Wrapper>
    </Card>
  );
};

export default ChatOptions;

const Wrapper = styled.div`
  .parent {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 5px;

    label {
      margin-bottom: 0;
    }
  }
`;

