export default function FormField({ label, required, error, children, className = '' }) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-field__label">
          {label}
          {required && <span className="form-field__required"> *</span>}
        </label>
      )}
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`form-input ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`form-input form-input--textarea ${className}`} {...props} />;
}

export function Select({ className = '', options = [], placeholder, ...props }) {
  return (
    <select className={`form-input form-input--select ${className}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
