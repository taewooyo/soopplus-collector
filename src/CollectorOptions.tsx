import Toggle from "./components/Toggle";
import SubTitle from "./components/SubTitle";
import { useState } from "react";
import { Highlight } from "./model/Highlight";
import { ToggleData } from "./model/ToggleData";
import { ChatCollectorData } from "./model/ChatCollectorData";
import { User } from "./model/User";
import InputForm from "./components/InputForm";
import styled from "styled-components";
import Setting from "./Setting";

interface IProps {
  collector: ChatCollectorData;
  highlight: Highlight;
  toggle: ToggleData;
  nicks: User[];
  ids: User[];
  wrapStyle?: React.CSSProperties;
}

const CollectorOptions = ({ wrapStyle, ...props }: IProps) => {
  const [collector, setCollector] = useState(props.collector);
  const [highlight, setHighlight] = useState(props.highlight);
  const [toggle, setToggle] = useState(props.toggle);

  const [ids, setIds] = useState(props.ids);
  const [nicks, setNicks] = useState(props.nicks);

  const changeCollector = () => {
    let newChatCollector = { isUse: !collector.isUse };
    chrome.storage.local.set({ collector: newChatCollector }, () => {
      setCollector(newChatCollector);
    });
  };

  const changeHighlight = () => {
    let newHighlight = { isUse: !highlight.isUse };
    chrome.storage.local.set({ highlight: newHighlight }, () => {
      setHighlight(newHighlight);
    });
  };

  const changeToggle = (text: string) => () => {
    let newToggleData = {
      streamer: toggle.streamer,
      manager: toggle.manager,
      topfan: toggle.topfan,
      gudok: toggle.gudok,
      fan: toggle.fan,
      user: toggle.user,
    };
    if (text == "streamer") {
      newToggleData.streamer = !newToggleData.streamer;
    } else if (text == "manager") {
      newToggleData.manager = !newToggleData.manager;
    } else if (text == "topfan") {
      newToggleData.topfan = !newToggleData.topfan;
    } else if (text == "gudok") {
      newToggleData.gudok = !newToggleData.gudok;
    } else if (text == "fan") {
      newToggleData.fan = !newToggleData.fan;
    } else if (text == "user") {
      newToggleData.user = !newToggleData.user;
    }
    chrome.storage.local.set({ toggle: newToggleData }, () => {
      setToggle(newToggleData);
    });
  };

  const handleAddNick = (nickname: string, resetInput: () => void) => {
    const nicknames = nicks.map((user) => user.user);
    // 방어 코드: 닉네임이 비었거나 중복일 경우 처리
    if (!nickname.trim() || nicknames.includes(nickname)) {
      return;
    }

    const newNicks = [...nicks, { isNickname: true, user: nickname }];
    chrome.storage.local.set({ nicks: newNicks }, () => {
      setNicks(newNicks);
      resetInput();
    });
  };

  const handleAddId = (id: string, resetInput: () => void) => {
    const userIds = ids.map((user) => user.user);
    if (!id.trim() || userIds.includes(id)) {
      return;
    }

    const newIds = [...ids, { isNickname: false, user: id }];
    chrome.storage.local.set({ ids: newIds }, () => {
      setIds(newIds);
      resetInput(); // 성공 시 입력 필드 초기화
    });
  };

  const handleNickClick = (nickname: string) => {
    const newNicks = nicks.filter((user) => user.user !== nickname);
    chrome.storage.local.set({ nicks: newNicks }, () => setNicks(newNicks));
  };

  const handleIdClick = (id: string) => {
    const newIds = ids.filter((user) => user.user !== id);
    chrome.storage.local.set({ ids: newIds }, () => setIds(newIds));
  };

  return (
    <Wrapper style={wrapStyle}>
      <SubTitle>콜렉터 설정</SubTitle>
      <div className="parent">
        <Toggle
          onChange={changeCollector}
          label="채팅 콜렉터"
          value={collector.isUse}
        />
        <Toggle
          onChange={changeHighlight}
          label="콜렉터 채팅 하이라이트 처리"
          value={highlight.isUse}
        />
      </div>
      <div className="sub-parent">
        <Toggle
          onChange={changeToggle("streamer")}
          label="스트리머"
          value={toggle.streamer}
        />
        <Toggle
          onChange={changeToggle("manager")}
          label="매니저"
          value={toggle.manager}
        />
        <Toggle
          onChange={changeToggle("topfan")}
          label="열혈팬"
          value={toggle.topfan}
        />
        <Toggle
          onChange={changeToggle("gudok")}
          label="구독팬"
          value={toggle.gudok}
        />
        <Toggle
          onChange={changeToggle("fan")}
          label="팬클럽"
          value={toggle.fan}
        />
        <Toggle
          onChange={changeToggle("user")}
          label="일반유저"
          value={toggle.user}
        />
      </div>
      <div className="filter-list" style={{ marginTop: "0.5rem" }}>
        <InputForm
          name="닉네임"
          placeholder="닉네임을 입력하세요"
          onAdd={handleAddNick}
        />
        <InputForm
          name="아이디"
          placeholder="아이디를 입력하세요"
          onAdd={handleAddId}
        />
        <Setting />
        <div>
          <details
            role="button"
            className="outline"
            open
            style={{ marginTop: "0.25rem" }}
          >
            <summary>
              <span>
                필터링 리스트 <b>{nicks.length + ids.length}</b>명
              </span>
            </summary>
            <div>
              <small>닉네임 혹은 아이디를 클릭시 리스트 제거</small>
            </div>
            {nicks.map((nick) => (
              <div
                className="filter-item"
                key={nick.user}
                onClick={() => handleNickClick(nick.user)}
              >
                {nick.user}
              </div>
            ))}
            {ids.map((id) => (
              <div
                className="filter-item"
                key={id.user}
                onClick={() => handleIdClick(id.user)}
              >
                {id.user}
              </div>
            ))}
          </details>
        </div>
      </div>
    </Wrapper>
  );
};

export default CollectorOptions;

const Wrapper = styled.div`
  label {
    margin-bottom: 0;
  }
  .parent {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 5px;
    margin-bottom: 5px;
  }
  .sub-parent {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 5px;
  }
`;

