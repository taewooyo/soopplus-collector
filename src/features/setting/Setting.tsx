import styled from "styled-components";
import SaveSettingModal from "./SaveModal";
import LoadSettingModal from "./LoadModal";
import { useState } from "react";

const Setting = () => {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);

  return (
    <>
      <Wrapper>
        <button className="primary" onClick={() => setSaveModalOpen(true)}>
          설정저장
        </button>
        <button className="secondary" onClick={() => setLoadModalOpen(true)}>
          불러오기
        </button>
      </Wrapper>
      <SaveSettingModal open={saveModalOpen} close={() => setSaveModalOpen(false)} />
      <LoadSettingModal open={loadModalOpen} close={() => setLoadModalOpen(false)} />
    </>
  );
};

export default Setting;

const Wrapper = styled.div`
  --pico-form-element-spacing-vertical: 0rem;
  --pico-form-element-spacing-horizontal: 0.2rem;

  display: flex;
  flex-direction: row;
  gap: 0.5rem;

  margin-top: 0.25rem;
  margin-bottom: 0.5rem;

  button {
    width: 100%;
  }
`;
