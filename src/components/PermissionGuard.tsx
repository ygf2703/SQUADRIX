import type { ReactNode } from 'react';
import type { Role } from '../types/domain';
import { useCurrentAuth } from '../contexts/AuthContext';
export function PermissionGuard({ roles, children }: { roles: Role[]; children: ReactNode }) { const { profile } = useCurrentAuth(); return profile && roles.includes(profile.role) ? <>{children}</> : null; }
