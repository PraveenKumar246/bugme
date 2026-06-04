/**
 * Modal — lightweight overlay shell that uses the app's existing
 * .modal-overlay / .modal / .modal-header / .modal-body / .modal-footer CSS.
 *
 * Usage:
 *   <Modal onClose={onClose}>
 *     <ModalHeader title="Create Team" onClose={onClose} />
 *     <ModalBody>…form fields…</ModalBody>
 *     <ModalFooter>
 *       <Button variant="secondary" onClick={onClose}>Cancel</Button>
 *       <Button loading={isPending}>Create Team</Button>
 *     </ModalFooter>
 *   </Modal>
 */
export default function Modal({ onClose, children, className = '' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal${className ? ' ' + className : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose }) {
  return (
    <div className="modal-header">
      <h3>{title}</h3>
      {onClose && (
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      )}
    </div>
  );
}

export function ModalBody({ children }) {
  return <div className="modal-body">{children}</div>;
}

export function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}
