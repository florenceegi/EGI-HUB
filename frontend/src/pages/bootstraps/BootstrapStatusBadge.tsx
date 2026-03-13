/**
 * BootstrapStatusBadge — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Badge colorato per visualizzare lo stato di un TenantAdminBootstrap
 */

import type { BootstrapStatus } from '@/types/bootstrap';

interface Props {
  status: BootstrapStatus;
}

const STATUS_CONFIG: Record<
  BootstrapStatus,
  { label: string; className: string }
> = {
  pending:   { label: 'Pending',   className: 'badge-ghost' },
  invited:   { label: 'Invited',   className: 'badge-info' },
  activated: { label: 'Activated', className: 'badge-success' },
  suspended: { label: 'Suspended', className: 'badge-warning' },
  revoked:   { label: 'Revoked',   className: 'badge-error' },
};

export default function BootstrapStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'badge-ghost' };
  return (
    <span className={`badge ${config.className} font-medium`}>
      {config.label}
    </span>
  );
}
