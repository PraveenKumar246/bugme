export default function Modal({ onClose, children, className = '', maxWidth = 520 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-panel${className ? ' ' + className : ''}`}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, icon, onClose }) {
  return (
    <div className="modal-panel__header">
      <div className="modal-panel__header-left">
        {icon && <div className="modal-panel__icon">{icon}</div>}
        <div>
          <h3 className="modal-panel__title">{title}</h3>
          {subtitle && <p className="modal-panel__subtitle">{subtitle}</p>}
        </div>
      </div>
      {onClose && (
        <button className="modal-panel__close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export function ModalBody({ children, className = '' }) {
  return <div className={`modal-panel__body${className ? ' ' + className : ''}`}>{children}</div>;
}

export function ModalFooter({ children }) {
  return <div className="modal-panel__footer">{children}</div>;
}
