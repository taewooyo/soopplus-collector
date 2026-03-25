import saveAs from "file-saver";
import styled from "styled-components";
import { useNicknames, useIds } from "../../stores/useFilterStore";

interface SaveModalProps {
  open: boolean;
  close: () => void;
}

const SaveSettingModal = ({ open, close }: SaveModalProps) => {
  const nicks = useNicknames();
  const ids = useIds();

  const saveSetting = () => {
    const guideMessage =
      "가이드\n[닉네임]와 [아이디] 하단에 각각에 알맞게 한줄에 하나의 유저 정보를 넣어주세요.\n\n";

    const nicksText = "[닉네임]\n" + nicks.map((nick) => nick.user).join("\n");
    const idsText = "[아이디]\n" + ids.map((id) => id.user).join("\n");

    const textContent = `${guideMessage}\n${nicksText}\n\n${idsText}`;

    const blob = new Blob([textContent], { type: "text/plain" });
    saveAs(blob, "soop_plus.txt");
    close();
  };

  return (
    <Modal open={open}>
      <article>
        <h2>설정 저장</h2>
        <p>현재 설정 사항을 파일로 다운로드 받습니다.</p>
        <hr />
        <h5>※ 주의 ※</h5>
        <p>설정 파일을 수정할 수 있지만, 양식에 맞지 않으면 처리되지 않습니다.</p>
        <p>파일 양식을 반드시 준수해 주세요.</p>
        <footer>
          <button className="secondary" onClick={close}>
            취소
          </button>
          <button onClick={saveSetting}>저장</button>
        </footer>
      </article>
    </Modal>
  );
};

export default SaveSettingModal;

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
