import styled from "styled-components";

const SubTitle = styled.h2`
  font-size: 1rem;
  text-align: left;
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding-left: 0.75rem;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0.5rem;
    width: 3px;
    background: var(--subtitle-accent, var(--pico-primary));
    border-radius: 2px;
  }

  @media (prefers-color-scheme: dark) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
`;

export default SubTitle;
