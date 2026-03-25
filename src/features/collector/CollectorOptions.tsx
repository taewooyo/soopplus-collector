import Toggle from "../../components/Toggle";
import SubTitle from "../../components/SubTitle";
import Card from "../../components/Card";
import InputForm from "../../components/InputForm";
import styled from "styled-components";
import { useCallback } from "react";
import { useCollectorStore } from "../../stores/useCollectorStore";
import { useFilterStore, useNicknames, useIds } from "../../stores/useFilterStore";
import Setting from "../setting/Setting";
import { FilterTypes } from "../../interfaces/setting";

interface CollectorOptionsProps {
  wrapStyle?: React.CSSProperties;
}

const CollectorOptions = ({ wrapStyle }: CollectorOptionsProps) => {
  const {
    isEnabled,
    highlight,
    filters,
    toggleCollector,
    toggleHighlight,
    toggleFilter,
  } = useCollectorStore();

  const { addNick, addId, removeNick, removeId } = useFilterStore();
  const nicks = useNicknames();
  const ids = useIds();

  const handleAddNick = (nickname: string, resetInput: () => void) => {
    if (!nickname.trim()) return;
    const exists = nicks.some((u) => u.user === nickname);
    if (exists) return;

    addNick(nickname);
    resetInput();
  };

  const handleAddId = (id: string, resetInput: () => void) => {
    if (!id.trim()) return;
    const exists = ids.some((u) => u.user === id);
    if (exists) return;

    addId(id);
    resetInput();
  };

  const handleNickClick = (nickname: string) => {
    removeNick(nickname);
  };

  const handleIdClick = (id: string) => {
    removeId(id);
  };

  const handleFilterKeyDown = useCallback(
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
    []
  );

  const handleToggleFilter = (key: keyof FilterTypes) => () => {
    toggleFilter(key);
  };

  return (
    <Card style={wrapStyle}>
      <Wrapper>
        <SubTitle>콜렉터 설정</SubTitle>
        <div className="parent" role="group" aria-label="콜렉터 기본 설정">
          <Toggle
            onChange={toggleCollector}
            label="채팅 콜렉터"
            value={isEnabled}
            description="특정 사용자의 채팅을 모아서 보여줍니다"
          />
          <Toggle
            onChange={toggleHighlight}
            label="콜렉터 채팅 하이라이트 처리"
            value={highlight}
            description="콜렉터에 수집된 채팅을 강조 표시합니다"
          />
        </div>
        <div className="sub-parent" role="group" aria-label="사용자 유형별 필터">
          <Toggle
            onChange={handleToggleFilter("streamer")}
            label="스트리머"
            value={filters.streamer}
            description="스트리머 채팅 수집"
          />
          <Toggle
            onChange={handleToggleFilter("manager")}
            label="매니저"
            value={filters.manager}
            description="매니저 채팅 수집"
          />
          <Toggle
            onChange={handleToggleFilter("topfan")}
            label="열혈팬"
            value={filters.topfan}
            description="열혈팬 채팅 수집"
          />
          <Toggle
            onChange={handleToggleFilter("gudok")}
            label="구독팬"
            value={filters.gudok}
            description="구독팬 채팅 수집"
          />
          <Toggle
            onChange={handleToggleFilter("fan")}
            label="팬클럽"
            value={filters.fan}
            description="팬클럽 채팅 수집"
          />
          <Toggle
            onChange={handleToggleFilter("user")}
            label="일반유저"
            value={filters.user}
            description="일반 유저 채팅 수집"
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
              <div role="list" aria-label="필터링된 사용자 목록">
                {nicks.map((nick) => (
                  <div
                    className="filter-item"
                    key={nick.user}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNickClick(nick.user)}
                    onKeyDown={handleFilterKeyDown(() => handleNickClick(nick.user))}
                    aria-label={`닉네임 ${nick.user} 제거`}
                  >
                    {nick.user}
                  </div>
                ))}
                {ids.map((id) => (
                  <div
                    className="filter-item"
                    key={id.user}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleIdClick(id.user)}
                    onKeyDown={handleFilterKeyDown(() => handleIdClick(id.user))}
                    aria-label={`아이디 ${id.user} 제거`}
                  >
                    {id.user}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </Wrapper>
    </Card>
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
