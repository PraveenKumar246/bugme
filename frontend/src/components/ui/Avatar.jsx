import { getInitials, avatarHue } from '../../utils/helpers';

export default function Avatar({ name, size = 32, className = '' }) {
  const initials = getInitials(name);
  const hue      = avatarHue(name);
  return (
    <span
      className={`avatar ${className}`}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `hsl(${hue},60%,50%)`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.38), fontWeight: 700, color: '#fff', flexShrink: 0,
        userSelect: 'none',
      }}
    >{initials}</span>
  );
}
