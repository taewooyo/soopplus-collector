import styled from "styled-components";
import { useFilterStore } from "../../stores/useFilterStore";

interface LoadModalProps {
  open: boolean;
  close: () => void;
}

const LoadSettingModal = ({ open, close }: LoadModalProps) => {
  const loadSetting = () => {
    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".txt";
    file.onchange = () => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;

          const nicksSection =
            content.match(/\[닉네임\]\n([\s\S]*?)(?=\n\[|$)/)?.[1] || "";
          const idsSection =
            content.match(/\[아이디\]\n([\s\S]*?)(?=\n\[|$)/)?.[1] || "";

          // 기존 형식 그대로 저장
          const nicks = nicksSection
            .split("\n")
            .filter(Boolean)
            .map((user) => ({ isNickname: true, user }));
          const ids = idsSection
            .split("\n")
            .filter(Boolean)
            .map((user) => ({ isNickname: false, user }));

          // chrome.storage에 저장 후 스토어 hydrate
          chrome.storage.local.set({ nicks, ids }, () => {
            useFilterStore.getState().hydrate();
            window.close();
          });
        } catch (error) {
          console.error("Error parsing text file:", error);
        }
      };
      if (file.files && file.files[0]) {
        reader.readAsText(file.files[0]);
      } else {
        console.error("No file selected");
      }
    };
    file.click();
  };

  return (
    <Modal open={open}>
      <article>
        <h2>설정 불러오기</h2>
        <p>설정 파일을 선택하여 불러옵니다.</p>
        <hr />
        <h5>※ 주의 ※</h5>
        <p>설정 파일을 불러오면 현재 설정이 덮어씌워집니다.</p>
        <p>필요할 경우 현재 설정을 저장한 후 불러오세요.</p>
        <footer>
          <button className="secondary" onClick={close}>
            취소
          </button>
          <button onClick={loadSetting}>불러오기</button>
        </footer>
      </article>
    </Modal>
  );
};

export default LoadSettingModal;

const Modal = styled.dialog`
  --pico-form-element-spacing-vertical: 5px;
  --pico-form-element-spacing-horizontal: 10px;

  article {
    margin: 0 5px;
  }
  h5 {
    margin: 10px 0;
  }
  p {
    margin-bottom: 10px;
  }

  footer {
    height: unset;
  }
`;
