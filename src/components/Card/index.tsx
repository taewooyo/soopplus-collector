import styled from "styled-components";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CardWrapper = styled.section`
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--card-shadow);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);

  &:hover {
    box-shadow: var(--card-shadow-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Card = ({ children, className, style }: CardProps) => {
  return (
    <CardWrapper className={className} style={style} aria-label="설정 섹션">
      {children}
    </CardWrapper>
  );
};

export default Card;
