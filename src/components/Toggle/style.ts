import styled from "styled-components";

export const ToggleItem = styled.li`
  list-style: none;
`;

export const ToggleWrapper = styled.label`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--pico-border-radius);
  transition: background var(--transition-fast);

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  @media (prefers-color-scheme: dark) {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  input[type="checkbox"] {
    transition: background var(--transition-fast), border-color var(--transition-fast);

    &:focus-visible {
      outline: 2px solid var(--pico-primary);
      outline-offset: 2px;
    }

    &:focus:not(:focus-visible) {
      outline: none;
    }
  }
`;
