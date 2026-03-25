import Toggle from "../../components/Toggle";
import SubTitle from "../../components/SubTitle";
import Card from "../../components/Card";
import styled from "styled-components";
import { useChatStore } from "../../stores/useChatStore";

interface ChatOptionsProps {
  wrapStyle?: React.CSSProperties;
}

const ChatOptions = ({ wrapStyle }: ChatOptionsProps) => {
  const {
    divider,
    chatSetting,
    chatTwoLine,
    subscribeBadge,
    topFanBadge,
    fanBadge,
    supportBadge,
    toggleDivider,
    toggleChatSetting,
    toggleChatTwoLine,
    toggleSubscribeBadge,
    toggleTopFanBadge,
    toggleFanBadge,
    toggleSupportBadge,
  } = useChatStore();

  return (
    <Card style={wrapStyle}>
      <Wrapper>
        <SubTitle>채팅창 설정</SubTitle>
        <div className="parent" role="group" aria-label="채팅창 설정 옵션">
          <Toggle
            onChange={toggleDivider}
            label="채팅 구분자"
            value={divider}
            description="채팅 메시지 사이에 구분선을 추가합니다"
          />
          <Toggle
            onChange={toggleChatSetting}
            label="채팅 시작 정렬"
            value={chatSetting}
            description="채팅 메시지를 왼쪽 정렬로 시작합니다"
          />
          <Toggle
            onChange={toggleChatTwoLine}
            label="채팅 두줄 보기"
            value={chatTwoLine}
            description="채팅을 두 줄로 표시합니다"
          />
          <Toggle
            onChange={toggleSubscribeBadge}
            label="구독 뱃지 제거"
            value={subscribeBadge}
            description="구독자 뱃지를 숨깁니다"
          />
          <Toggle
            onChange={toggleTopFanBadge}
            label="열혈팬 뱃지 제거"
            value={topFanBadge}
            description="열혈팬 뱃지를 숨깁니다"
          />
          <Toggle
            onChange={toggleFanBadge}
            label="팬클럽 뱃지 제거"
            value={fanBadge}
            description="팬클럽 뱃지를 숨깁니다"
          />
          <Toggle
            onChange={toggleSupportBadge}
            label="서포터 뱃지 제거"
            value={supportBadge}
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
