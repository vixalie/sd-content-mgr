import { NavLink as Link } from '@mantine/core';
import { FC } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

type ActivatableNavLinkProps = {
  to: NavLinkProps['to'];
  icon?: Link['icon'];
  label?: Link['label'];
  disabled?: boolean;
};

export function ActivatableNavLink({
  to,
  icon,
  label,
  disabled
}: ActivatableNavLinkProps): FC<ActivatableNavLinkProps> {
  return (
    <NavLink to={to} style={disabled && { pointerEvents: 'none' }}>
      {({ isActive }) => <Link active={isActive} icon={icon} label={label} disabled={disabled} />}
    </NavLink>
  );
}
