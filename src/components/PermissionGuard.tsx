import type { ReactNode } from 'react';
import type { Role } from '../types/domain';
import { useCurrentAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
export function PermissionGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { profile } = useCurrentAuth();
  const { canEditActiveTeam } = useTeam();
  const allowed = Boolean(profile && (
    (profile.role === 'admin' && roles.includes('admin'))
    || (roles.includes('professional_staff') && canEditActiveTeam)
    || (profile.role === 'viewer' && roles.includes('viewer'))
  ));
  return allowed ? <>{children}</> : null;
}
