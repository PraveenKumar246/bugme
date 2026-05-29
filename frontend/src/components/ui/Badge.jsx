import { STATUS_CONFIG, PRIORITY_CONFIG, TC_STATUS_CONFIG, SPRINT_STATUS_CONFIG } from '../../utils/constants';

export default function Badge({ label, color, bg, size = 'md', pill = true }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 7px' : '3px 10px',
      borderRadius: pill ? 20 : 6,
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 600,
      color, background: bg,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>{label}</span>
  );
}

export function StatusBadge({ status, size }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size={size} />;
}

export function PriorityBadge({ priority, size }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size={size} />;
}

export function PriorityDot({ priority }) {
  const color = (PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium).color;
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: color, display: 'inline-block', flexShrink: 0,
    }} />
  );
}

export function TcStatusBadge({ status }) {
  const cfg = TC_STATUS_CONFIG[status] || TC_STATUS_CONFIG.untested;
  return <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />;
}

export function SprintStatusBadge({ status }) {
  const cfg = SPRINT_STATUS_CONFIG[status] || SPRINT_STATUS_CONFIG.planned;
  return <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />;
}
