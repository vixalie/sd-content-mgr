import { NavLink as Link } from '@mantine/core';
import { ForwardRefExoticComponent, ForwardedRef, forwardRef } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

type ActivatableNavLinkProps = {
  to: NavLinkProps['to'];
  icon?: Link['icon'];
  label?: Link['label'];
  disabled?: boolean;
};

export const ActivatableNavLink = forwardRef(
  (
    { to, icon, label, disabled }: ActivatableNavLinkProps,
    ref: ForwardedRef
  ): ForwardRefExoticComponent<ActivatableNavLinkProps> => {
    return (
      <NavLink to={to} style={disabled && { pointerEvents: 'none' }} ref={ref}>
        {({ isActive }) => <Link active={isActive} icon={icon} label={label} disabled={disabled} />}
      </NavLink>
    );
  }
);
