import React, { ReactNode } from 'react';

export type Props = {
  onClick: () => void;
  disabled: boolean;
  visible: boolean;
  arrow?: ReactNode;
  className?: string
};

export const NavButton = ({ onClick, disabled, visible, className, arrow='<' }: Props) => (
  <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={['slider__btn', className, visible && 'visible'].join(' ')}
  >
      {arrow}
  </button>
);