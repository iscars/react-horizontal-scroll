import React, { ReactNode } from 'react';
import classNames from 'classnames';

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
      className={classNames('slider__btn', className, visible && 'visible')}
  >
      {arrow}
  </button>
);