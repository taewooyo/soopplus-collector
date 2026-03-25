import React, { useRef, useId } from "react";

interface InputFormProps {
  name: string;
  placeholder: string;
  onAdd: (value: string, resetInput: () => void) => void;
}

interface InputEvent extends React.KeyboardEvent<HTMLInputElement> {
  target: HTMLInputElement;
}

const InputForm = ({ name, placeholder, onAdd }: InputFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleAdd = () => {
    if (!inputRef.current || !inputRef.current.value) return;
    onAdd(inputRef.current.value, () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  };

  const handleEnterPress = (e: InputEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <fieldset role="group">
      <label htmlFor={inputId} className="sr-only">
        {name} 입력
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onKeyUp={handleEnterPress}
        aria-label={`${name} 입력`}
      />
      <button
        onClick={handleAdd}
        aria-label={`${name} 추가하기`}
      >
        {name} 추가
      </button>
    </fieldset>
  );

  // return (
  //   <FormContainer>
  //     <StyledInput
  //       ref={inputRef}
  //       type="text"
  //       placeholder={placeholder}
  //       onKeyUp={handleEnterPress}
  //     />
  //     <AddButton onClick={handleAdd}>추가</AddButton>
  //   </FormContainer>
  // );
};

export default InputForm;
