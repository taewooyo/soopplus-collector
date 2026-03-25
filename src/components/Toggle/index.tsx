import { useId } from "react";
import { ToggleProps } from "../../types/toggle";
import { ToggleWrapper } from "./style";

const Toggle = ({ onChange, label, value, id: propId, description }: ToggleProps) => {
  const generatedId = useId();
  const toggleId = propId || generatedId;
  const descriptionId = description ? `${toggleId}-description` : undefined;

  return (
    <ToggleWrapper>
      <input
        id={toggleId}
        onChange={onChange}
        type="checkbox"
        role="switch"
        checked={value}
        aria-checked={value}
        aria-describedby={descriptionId}
      />
      <span id={`${toggleId}-label`}>{label}</span>
      {description && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
    </ToggleWrapper>
  );
};

export default Toggle;




// import { ToggleProps } from "@/src/types/toggle";
// import React from "react";
// import { Form } from "react-bootstrap";
// import { ToggleItem } from "./style";

// const Toggle = ({ onChange, label, value }: ToggleProps) => {
//   return (
//     <ToggleItem>
//       <Form.Check
//         onChange={onChange}
//         type="switch"
//         label={label}
//         checked={value}
//       />
//     </ToggleItem>
//   );
// };

// export default Toggle;
