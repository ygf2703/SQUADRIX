import type { ReactNode } from 'react'; import { useAuth } from '../hooks/useAuth'; import type { Role } from '../types/domain';
export function PermissionGuard({ roles, children }: { roles: Role[]; children: ReactNode }) { const { profile } = useAuth(); return profile && roles.includes(profile.role) ? <>{children}</> : null; }
