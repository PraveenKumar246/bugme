import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, issueService, testCaseService, sprintService, analyticsService, teamService, customFieldService } from '../services/api';
import IssueDrawer from '../components/IssueDrawer';
import BadgeComponent, { PriorityDot } from '../components/ui/Badge';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, SEVERITY_CONFIG,
  TC_STATUS_CONFIG, TYPE_CONFIG, SPRINT_STATUS_CONFIG,
  ISSUE_TYPES, ISSUE_PRIORITIES, ISSUE_SEVERITIES,
} from '../utils/constants';
import { capitalize } from '../utils/helpers';
import '../styles/project-detail.css';

function Badge({ label, color, bg, small }) {
  return <BadgeComponent label={label} color={color} bg={bg} size={small ? 'sm' : 'md'} />;
}

/* ─────────── Issue row ─────────── */
function IssueRow({ issue, onClick }) {
  const sc = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
  return (
    <div className="pd-issue-row" onClick={onClick}>
      <PriorityDot priority={issue.priority} />
      <span className="pd-issue-type">{TYPE_CONFIG[issue.type]?.icon || '🐛'}</span>
      <span className="pd-issue-title">{issue.title}</span>
      <div className="pd-issue-badges">
        {(issue.tags || []).slice(0, 2).map(t => (
          <span key={t} className="pd-tag">{t}</span>
        ))}
      </div>
      <Badge label={sc.label} color={sc.color} bg={sc.bg} small />
      <span className="pd-issue-severity" style={{ color: SEVERITY_CONFIG[issue.severity]?.color || '#999' }}>
        {capitalize(issue.severity)}
      </span>
      <span className="pd-issue-assignee">{issue.assignee_name || '—'}</span>
      <span className="pd-issue-date">{new Date(issue.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
    </div>
  );
}

/* ─────────── Predefined tag list ─────────── */
const PREDEFINED_TAGS = [
  'Functional', 'UI', 'UX', 'Crash', 'ANR', 'Performance',
  'Security', 'Intermittent', 'Font', 'Backend', 'API',
  'Database', 'Authentication', 'Navigation', 'Layout',
];

/* ─────────── Tag Selector (right panel) ─────────── */
function TagSelector({ tags, onChange }) {
  const [open, setOpen]     = useState(false);
  const [pos, setPos]       = useState({ top: 0, right: 0 });
  const [search, setSearch] = useState('');
  const btnRef  = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const fn = e => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const openDropdown = () => {
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    setOpen(true);
  };

  const close = () => { setOpen(false); setSearch(''); };

  // Predefined + any already-added custom tags (title-cased for display)
  const allOptions = [...new Set([
    ...PREDEFINED_TAGS,
    ...tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
  ])];
  const filtered = allOptions.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (tag) => {
    const n = tag.toLowerCase();
    onChange(tags.includes(n) ? tags.filter(x => x !== n) : [...tags, n]);
  };

  const createNew = () => {
    const n = search.trim().toLowerCase();
    if (!n) return;
    if (!tags.includes(n)) onChange([...tags, n]);
    setSearch('');
  };

  return (
    <div className="ci-tag-selector">
      <button
        ref={btnRef}
        type="button"
        className={`ci-tag-add-btn${tags.length > 0 ? ' has-tags' : ''}`}
        onClick={open ? close : openDropdown}
      >
        <span className="ci-tag-btn-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </span>
        <span className="ci-tag-btn-text">+Add Tags</span>
        {tags.length > 0 && <span className="ci-tag-badge">{tags.length}</span>}
      </button>

      {tags.length > 0 && (
        <div className="ci-selected-tags">
          {tags.map(t => (
            <span key={t} className="ci-tag-chip">
              {t}
              <button type="button" onClick={() => toggle(t)}>×</button>
            </span>
          ))}
        </div>
      )}

      {open && createPortal(
        <div ref={dropRef} className="ci-tag-dropdown" style={{ top: pos.top, right: pos.right }}>
          <div className="ci-tag-dropdown-head">
            <span className="ci-tag-dropdown-title">Tags</span>
            <button type="button" className="ci-tag-dropdown-close" onClick={close}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="ci-tag-search-wrap">
            <input
              className="ci-tag-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim()) { e.preventDefault(); createNew(); } }}
              placeholder="Search Tags"
              autoFocus
            />
          </div>

          <div className="ci-tag-list">
            {filtered.length === 0
              ? <div className="ci-tag-empty">No tags found</div>
              : filtered.map(t => {
                  const sel = tags.includes(t.toLowerCase());
                  return (
                    <button key={t} type="button" className={`ci-tag-opt${sel ? ' selected' : ''}`} onClick={() => toggle(t)}>
                      <span>{t}</span>
                      {sel && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  );
                })
            }
          </div>

          <button type="button" className="ci-tag-create" onClick={createNew}>
            {search.trim() ? `Create "${search.trim()}"` : '+ Create New Tag'}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─────────── Issue Meta Field (right panel pill) ─────────── */
function MetaField({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const current = options.find(o => o.value === value) || options[0];

  return (
    <div className="ci-meta-item" ref={ref}>
      <button type="button" className="ci-meta-btn" onClick={() => setOpen(v => !v)}>
        <span className="ci-meta-icon-wrap" style={{ background: current.bg || 'var(--bg-subtle)', color: current.color || 'var(--text-muted)' }}>
          {current.icon || <span className="ci-meta-dot" style={{ background: current.color }} />}
        </span>
        <span className="ci-meta-group">
          {label && <span className="ci-meta-field-name">{label}</span>}
          <span className="ci-meta-field-val" style={current.color ? { color: current.color } : {}}>
            {current.label}
          </span>
        </span>
        <svg className="ci-meta-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="ci-meta-dropdown">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              className={`ci-meta-opt${value === o.value ? ' active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span className="ci-meta-opt-icon" style={{ background: o.bg || 'var(--bg-subtle)', color: o.color || 'var(--text-muted)' }}>
                {o.icon || <span className="ci-meta-dot" style={{ background: o.color }} />}
              </span>
              <span>{o.label}</span>
              {value === o.value && (
                <svg className="ci-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Custom Field type definitions ─────────── */
const FIELD_TYPES = {
  'Basic Elements': [
    { value: 'single_line_text', label: 'Single Line Text', symbol: '▬', color: '#6366f1', bg: '#eef2ff' },
    { value: 'multi_line_text',  label: 'Multi Line Text',  symbol: '≡', color: '#f59e0b', bg: '#fffbeb' },
    { value: 'url',              label: 'URL',              symbol: '⊕', color: '#f97316', bg: '#fff7ed' },
  ],
  'Numbers': [
    { value: 'number',     label: 'Number',     symbol: '01',  color: '#10b981', bg: '#ecfdf5' },
    { value: 'decimal',    label: 'Decimal',    symbol: '0.0', color: '#ec4899', bg: '#fdf2f8' },
    { value: 'currency',   label: 'Currency',   symbol: '$',   color: '#6b7280', bg: '#f3f4f6' },
    { value: 'percentage', label: 'Percentage', symbol: '%',   color: '#f59e0b', bg: '#fffbeb' },
  ],
  'Date and Time': [
    { value: 'date',      label: 'Date',      symbol: '📅', color: '#3b82f6', bg: '#eff6ff' },
    { value: 'date_time', label: 'Date Time', symbol: '🕐', color: '#6366f1', bg: '#eef2ff' },
  ],
  'Options': [
    { value: 'dropdown',         label: 'Dropdown',         symbol: '▾', color: '#10b981', bg: '#ecfdf5' },
    { value: 'user_type',        label: 'User Type',        symbol: '👤', color: '#ec4899', bg: '#fdf2f8' },
    { value: 'single_selection', label: 'Single Selection', symbol: '◉', color: '#ec4899', bg: '#fdf2f8' },
    { value: 'multi_selection',  label: 'Multi Selection',  symbol: '☑', color: '#6366f1', bg: '#eef2ff' },
    { value: 'tags',             label: 'Tags',             symbol: '🏷', color: '#8b5cf6', bg: '#f5f3ff' },
  ],
};
const ALL_FIELD_TYPES = Object.values(FIELD_TYPES).flat();

/* ─────────── TypeDropdown (grouped, portal) ─────────── */
function TypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0, width: 0 });
  const btnRef  = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const fn = e => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const toggle = () => {
    if (!open) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(v => !v);
  };

  const current = ALL_FIELD_TYPES.find(t => t.value === value) || ALL_FIELD_TYPES[0];

  return (
    <div className="cf-type-wrap">
      <button ref={btnRef} type="button" className="cf-type-trigger" onClick={toggle}>
        <span className="cf-type-symbol" style={{ background: current.bg, color: current.color }}>{current.symbol}</span>
        <span className="cf-type-label">{current.label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && createPortal(
        <div ref={dropRef} className="cf-type-list" style={{ top: pos.top, left: pos.left, width: pos.width }}>
          {Object.entries(FIELD_TYPES).map(([group, types]) => (
            <div key={group} className="cf-type-group">
              <span className="cf-type-group-label">{group}</span>
              <div className="cf-type-group-divider" />
              {types.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`cf-type-opt${value === t.value ? ' active' : ''}`}
                  onClick={() => { onChange(t.value); setOpen(false); }}
                >
                  <span className="cf-type-symbol" style={{ background: t.bg, color: t.color }}>{t.symbol}</span>
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─────────── AccordionSection ─────────── */
function AccordionSection({ title, open, onToggle, children, desc }) {
  return (
    <div className="cf-accordion">
      <button type="button" className={`cf-accordion-head${open ? ' is-open' : ''}`} onClick={onToggle}>
        <span className={`cf-accordion-title${open ? ' open' : ''}`}>{title}</span>
        <svg className={`cf-accordion-chevron${open ? ' up' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="cf-accordion-body">
          {desc && <p className="cf-accordion-desc">{desc}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────── CustomFieldPanel (slide-in via portal) ─────────── */
function CustomFieldPanel({ projectId, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '', field_type: 'single_line_text', placeholder: '', mandatory: false,
    options: { prefix: '', suffix: '', min_length: '', max_length: '', default_value: '', description: '', show_when_status: 'all', show_for: 'all', edit_if: 'all', autofill_on_status: 'none' },
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [sections, setSections] = useState({ additional: false, conditions: false, autofill: false });

  const setF   = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setOpt = (k, v) => setForm(p => ({ ...p, options: { ...p.options, [k]: v } }));
  const toggle = k => setSections(p => ({ ...p, [k]: !p[k] }));

  const handleCreate = async () => {
    if (!form.name.trim()) { setError('Field name is required'); return; }
    setSaving(true);
    try {
      const res = await customFieldService.create(projectId, {
        name: form.name.trim(), field_type: form.field_type,
        placeholder: form.placeholder, mandatory: form.mandatory, options: form.options,
      });
      onCreate(res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create field');
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <div className="cf-overlay" onClick={onClose} />
      <div className="cf-panel">
        <div className="cf-panel-header">
          <span className="cf-panel-title">Customise Field</span>
          <button type="button" className="cf-panel-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="cf-panel-body">
          {error && <div className="cf-panel-error">{error}</div>}

          <div className="cf-f">
            <label className="cf-lbl">Type of Field</label>
            <TypeDropdown value={form.field_type} onChange={v => setF('field_type', v)} />
          </div>

          <div className="cf-f">
            <label className="cf-lbl">Field Name</label>
            <input className="cf-inp" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Enter field name" autoFocus />
          </div>

          <div className="cf-f">
            <label className="cf-lbl">Placeholder</label>
            <input className="cf-inp" value={form.placeholder} onChange={e => setF('placeholder', e.target.value)} placeholder="Enter your response here…" />
          </div>

          <label className="cf-mandatory-row">
            <input type="checkbox" checked={form.mandatory} onChange={e => setF('mandatory', e.target.checked)} />
            <span>Make this field mandatory</span>
          </label>

          <AccordionSection title="Additional Options" open={sections.additional} onToggle={() => toggle('additional')}
            desc="You will be able to set prefix, suffix, minimum length, maximum length, initial value, height and description for the field.">
            <div className="cf-row-2">
              <div className="cf-f"><label className="cf-lbl-sm">Prefix</label><input className="cf-inp" value={form.options.prefix} onChange={e => setOpt('prefix', e.target.value)} placeholder="Enter prefix" /></div>
              <div className="cf-f"><label className="cf-lbl-sm">Suffix</label><input className="cf-inp" value={form.options.suffix} onChange={e => setOpt('suffix', e.target.value)} placeholder="Enter suffix" /></div>
            </div>
            <div className="cf-row-2">
              <div className="cf-f"><label className="cf-lbl-sm">Minimum Length</label><input className="cf-inp" type="number" value={form.options.min_length} onChange={e => setOpt('min_length', e.target.value)} placeholder="1" /></div>
              <div className="cf-f"><label className="cf-lbl-sm">Maximum Length</label><input className="cf-inp" type="number" value={form.options.max_length} onChange={e => setOpt('max_length', e.target.value)} placeholder="200" /></div>
            </div>
            <div className="cf-f"><label className="cf-lbl-sm">Default Value</label><input className="cf-inp" value={form.options.default_value} onChange={e => setOpt('default_value', e.target.value)} placeholder="Enter default value" /></div>
            <div className="cf-f"><label className="cf-lbl-sm">Description</label><textarea className="cf-inp" rows={3} value={form.options.description} onChange={e => setOpt('description', e.target.value)} placeholder="Enter description" style={{ resize: 'vertical' }} /></div>
          </AccordionSection>

          <AccordionSection title="Conditions" open={sections.conditions} onToggle={() => toggle('conditions')}
            desc="Fields will be shown as per the conditions. You can also set the editor.">
            <div className="cf-f"><label className="cf-lbl-sm">Show Field when Status</label>
              <select className="cf-sel" value={form.options.show_when_status} onChange={e => setOpt('show_when_status', e.target.value)}>
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="cf-f"><label className="cf-lbl-sm">Show Field for</label>
              <select className="cf-sel" value={form.options.show_for} onChange={e => setOpt('show_for', e.target.value)}>
                <option value="all">All Users</option>
                <option value="owner">Owner Only</option>
              </select>
            </div>
            <div className="cf-f"><label className="cf-lbl-sm">Edit Field if User</label>
              <select className="cf-sel" value={form.options.edit_if} onChange={e => setOpt('edit_if', e.target.value)}>
                <option value="all">All Users</option>
                <option value="owner">Owner Only</option>
              </select>
            </div>
          </AccordionSection>

          <AccordionSection title="Autofill fields" open={sections.autofill} onToggle={() => toggle('autofill')}
            desc="Note: Autofilled with current date & time">
            <div className="cf-f"><label className="cf-lbl-sm">When Status Changed to</label>
              <select className="cf-sel" value={form.options.autofill_on_status} onChange={e => setOpt('autofill_on_status', e.target.value)}>
                <option value="none">None</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </AccordionSection>
        </div>

        <div className="cf-panel-footer">
          <button type="button" className="cf-btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="cf-btn-create" disabled={saving} onClick={handleCreate}>
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ─────────── Render input for a custom field ─────────── */
function CustomFieldInput({ field, value, onChange }) {
  const t = field.field_type;
  if (t === 'multi_line_text') return (
    <textarea className="ci-textarea" style={{ minHeight: 60 }} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} rows={3} />
  );
  if (t === 'date') return <input className="ci-input" type="date" value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (t === 'date_time') return <input className="ci-input" type="datetime-local" value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (t === 'number' || t === 'decimal' || t === 'currency' || t === 'percentage') return (
    <input className="ci-input" type="number" step={t === 'decimal' || t === 'currency' ? '0.01' : '1'} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} />
  );
  return <input className="ci-input" type={t === 'url' ? 'url' : 'text'} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
}

/* ─────────── Create Issue Modal ─────────── */
function CreateIssueModal({ projectId, members, sprints, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '',
    priority: 'medium', severity: 'medium', type: 'bug', status: 'open',
    tags: [], sprint_id: '', assignee_id: '', customValues: {},
  });
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [showCFPanel, setShowCFPanel]   = useState(false);

  useEffect(() => {
    customFieldService.getAll(projectId)
      .then(r => setCustomFields(r.data))
      .catch(() => {});
  }, [projectId]);

  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setCFV = (id, v) => setForm(p => ({ ...p, customValues: { ...p.customValues, [id]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Issue summary is required'); return; }
    const missing = customFields.filter(f => f.mandatory && !form.customValues[f.id]?.toString().trim());
    if (missing.length) { setError(`Required: ${missing.map(f => f.name).join(', ')}`); return; }
    setLoading(true);
    try {
      await onCreate({
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        severity: form.severity,
        type: form.type,
        status: form.status,
        tags: form.tags,
        sprint_id: form.sprint_id || null,
        assignee_id: form.assignee_id || null,
        custom_fields: form.customValues,
      });
      onClose();
    } catch { setError('Failed to create issue'); setLoading(false); }
  };

  const typeOptions     = ISSUE_TYPES.map(t => ({ value: t, label: TYPE_CONFIG[t].label, icon: TYPE_CONFIG[t].icon, bg: '#f3f4f6', color: '#374151' }));
  const priorityOptions = ISSUE_PRIORITIES.map(p => ({ value: p, label: PRIORITY_CONFIG[p].label, color: PRIORITY_CONFIG[p].color, bg: PRIORITY_CONFIG[p].bg }));
  const severityOptions = ISSUE_SEVERITIES.map(s => ({ value: s, label: capitalize(s), color: SEVERITY_CONFIG[s].color, bg: '#f3f4f6' }));
  const statusOptions   = Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label, color: v.color, bg: v.bg }));

  const selectedAssignee = members.find(m => m.id === form.assignee_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ci-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ci-header">
          <h2 className="ci-title">Add New Issue</h2>
          <button type="button" className="ci-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="ci-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="ci-body">

            {/* ── Left panel ── */}
            <div className="ci-left">

              <div className="ci-field">
                <label className="ci-label">Summary <span className="ci-req">*</span></label>
                <input
                  className="ci-input"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Crisp, precise and focus on impact."
                  autoFocus
                />
              </div>

              <div className="ci-field">
                <label className="ci-label">Description</label>
                <textarea
                  className="ci-textarea"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Detailed description of the issue…"
                  rows={6}
                />
              </div>

              {sprints.length > 0 && (
                <div className="ci-field">
                  <label className="ci-label">Sprint</label>
                  <select className="ci-select" value={form.sprint_id} onChange={e => set('sprint_id', e.target.value)}>
                    <option value="">No sprint</option>
                    {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="ci-field">
                <label className="ci-label">Assignees</label>
                <div className="ci-assignee-row">
                  {selectedAssignee ? (
                    <span className="ci-assignee-chip">
                      <span className="ci-assignee-avatar">{selectedAssignee.name.slice(0,2).toUpperCase()}</span>
                      {selectedAssignee.name}
                      <button type="button" onClick={() => set('assignee_id', '')}>×</button>
                    </span>
                  ) : (
                    <select className="ci-select ci-assignee-select" value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)}>
                      <option value="">+ Add Assignee</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Custom field inputs */}
              {customFields.map(f => (
                <div key={f.id} className="ci-field">
                  <label className="ci-label">
                    {f.name}
                    {f.mandatory && <span className="ci-req"> *</span>}
                  </label>
                  <CustomFieldInput
                    field={f}
                    value={form.customValues[f.id] ?? ''}
                    onChange={v => setCFV(f.id, v)}
                  />
                </div>
              ))}
            </div>

            {/* ── Right panel — metadata ── */}
            <div className="ci-right">
              <p className="ci-right-label">Properties</p>

              <MetaField label="Type"     value={form.type}     options={typeOptions}     onChange={v => set('type', v)} />
              <MetaField label="Severity" value={form.severity} options={severityOptions} onChange={v => set('severity', v)} />
              <MetaField label="Priority" value={form.priority} options={priorityOptions} onChange={v => set('priority', v)} />

              {/* Tags */}
              <TagSelector tags={form.tags} onChange={v => set('tags', v)} />

              <MetaField label="Status" value={form.status} options={statusOptions} onChange={v => set('status', v)} />

              {/* Add Custom Field */}
              <button type="button" className="ci-custom-field-btn" onClick={() => setShowCFPanel(true)}>
                <span className="ci-tag-btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/>
                  </svg>
                </span>
                <span className="ci-tag-btn-text">+Custom Field</span>
              </button>
            </div>
          </div>

          {showCFPanel && (
            <CustomFieldPanel
              projectId={projectId}
              onClose={() => setShowCFPanel(false)}
              onCreate={field => setCustomFields(prev => [...prev, field])}
            />
          )}

          {/* Footer */}
          <div className="ci-footer">
            <button type="button" className="ci-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="ci-btn-submit" disabled={loading}>
              {loading
                ? <><span className="spinner spinner-white spinner-sm" /> Creating…</>
                : 'Add Issue'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Create Test Case Modal ─────────── */
function CreateTestModal({ projectId, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', expected_result: '', priority: 'medium', steps: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const steps = form.steps
        ? form.steps.split('\n').map((s, i) => ({ step: i + 1, action: s.trim() })).filter(s => s.action)
        : [];
      await onCreate({ title: form.title, description: form.description, expected_result: form.expected_result, priority: form.priority, steps });
      onClose();
    } catch { setLoading(false); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={e => e.stopPropagation()}>
        <div className="pd-modal-header"><h3>New Test Case</h3><button className="pd-modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit} className="pd-modal-body">
          <div className="pd-modal-field"><label>Title *</label><input className="pd-modal-input" value={form.title} onChange={f('title')} autoFocus required /></div>
          <div className="pd-modal-field"><label>Description</label><textarea className="pd-modal-input" value={form.description} onChange={f('description')} rows={2} /></div>
          <div className="pd-modal-field">
            <label>Steps (one per line)</label>
            <textarea className="pd-modal-input" value={form.steps} onChange={f('steps')} rows={4} placeholder="Step 1&#10;Step 2&#10;Step 3" />
          </div>
          <div className="pd-modal-field"><label>Expected Result</label><textarea className="pd-modal-input" value={form.expected_result} onChange={f('expected_result')} rows={2} /></div>
          <div className="pd-modal-field">
            <label>Priority</label>
            <select className="pd-modal-input" value={form.priority} onChange={f('priority')}>
              {['low','medium','high','critical'].map(v => <option key={v} value={v}>{capitalize(v)}</option>)}
            </select>
          </div>
          <div className="pd-modal-footer">
            <button type="button" className="pd-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="pd-btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Test Case'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Create Sprint Modal ─────────── */
function CreateSprintModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', goal: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onCreate(form); onClose(); } catch { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={e => e.stopPropagation()}>
        <div className="pd-modal-header"><h3>New Sprint</h3><button className="pd-modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit} className="pd-modal-body">
          <div className="pd-modal-field"><label>Sprint Name *</label><input className="pd-modal-input" value={form.name} onChange={f('name')} autoFocus required /></div>
          <div className="pd-modal-field"><label>Goal</label><textarea className="pd-modal-input" value={form.goal} onChange={f('goal')} rows={2} placeholder="What should this sprint achieve?" /></div>
          <div className="pd-modal-row">
            <div className="pd-modal-field"><label>Start Date</label><input type="date" className="pd-modal-input" value={form.start_date} onChange={f('start_date')} /></div>
            <div className="pd-modal-field"><label>End Date</label><input type="date" className="pd-modal-input" value={form.end_date} onChange={f('end_date')} /></div>
          </div>
          <div className="pd-modal-footer">
            <button type="button" className="pd-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="pd-btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Sprint'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Reports Tab ─────────── */
function ReportsTab({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboard(projectId)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" /></div>;
  if (!data) return <div className="pd-empty">Failed to load analytics.</div>;

  const { stats, byStatus, byPriority } = data;
  const maxStatus   = Math.max(...(byStatus   || []).map(r => +r.count), 1);
  const maxPriority = Math.max(...(byPriority || []).map(r => +r.count), 1);

  const cards = [
    { label: 'Total Issues',    val: stats.total_issues,      color: '#6366f1' },
    { label: 'Open',            val: stats.open_issues,        color: '#3b82f6' },
    { label: 'In Progress',     val: stats.in_progress_issues, color: '#f59e0b' },
    { label: 'Closed',          val: stats.closed_issues,      color: '#10b981' },
    { label: 'Critical',        val: stats.critical_count,     color: '#ef4444' },
    { label: 'Test Cases',      val: stats.total_test_cases,   color: '#8b5cf6' },
  ];

  return (
    <div className="pd-reports">
      <div className="pd-stat-cards">
        {cards.map(c => (
          <div key={c.label} className="pd-stat-card" style={{ borderTopColor: c.color }}>
            <div className="pd-stat-val" style={{ color: c.color }}>{c.val ?? 0}</div>
            <div className="pd-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="pd-charts-row">
        <div className="pd-chart-card">
          <h4 className="pd-chart-title">Issues by Status</h4>
          <div className="pd-bar-chart">
            {(byStatus || []).map(r => {
              const cfg = STATUS_CONFIG[r.status] || { label: r.status, color: '#6366f1', bg: '#eef2ff' };
              return (
                <div key={r.status} className="pd-bar-row">
                  <span className="pd-bar-label">{cfg.label}</span>
                  <div className="pd-bar-track">
                    <div className="pd-bar-fill" style={{ width: `${(+r.count / maxStatus) * 100}%`, background: cfg.color }} />
                  </div>
                  <span className="pd-bar-count">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pd-chart-card">
          <h4 className="pd-chart-title">Issues by Priority</h4>
          <div className="pd-bar-chart">
            {(byPriority || []).map(r => (
              <div key={r.priority} className="pd-bar-row">
                <span className="pd-bar-label">{capitalize(r.priority)}</span>
                <div className="pd-bar-track">
                  <div className="pd-bar-fill" style={{ width: `${(+r.count / maxPriority) * 100}%`, background: PRIORITY_CONFIG[r.priority]?.color || '#6366f1' }} />
                </div>
                <span className="pd-bar-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.recent && data.recent.length > 0 && (
        <div className="pd-chart-card">
          <h4 className="pd-chart-title">Recently Reported</h4>
          <div className="pd-recent-list">
            {data.recent.map(i => {
              const sc = STATUS_CONFIG[i.status] || STATUS_CONFIG.open;
              return (
                <div key={i.id} className="pd-recent-row">
                  <PriorityDot priority={i.priority} />
                  <span className="pd-recent-title">{i.title}</span>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} small />
                  <span className="pd-recent-by">{i.created_by_name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Main ─────────── */
export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject]     = useState(null);
  const [issues, setIssues]       = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [sprints, setSprints]     = useState([]);
  const [members, setMembers]     = useState([]);
  const [activeTab, setActiveTab] = useState('issues');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [activeIssue, setActiveIssue]       = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTestModal, setShowTestModal]   = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);

  // Issue filters
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterType,     setFilterType]     = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, [projectId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [projRes, issuesRes, testsRes, sprintsRes, teamsRes] = await Promise.all([
        projectService.getById(projectId),
        issueService.getAll(projectId),
        testCaseService.getAll(projectId),
        sprintService.getAll(projectId),
        teamService.getAll(),
      ]);
      const proj = projRes.data;
      setProject(proj);
      setIssues(issuesRes.data);
      setTestCases(testsRes.data);
      setSprints(sprintsRes.data);
      // Prefer the project's own team; fall back to all members across the user's teams
      const projectTeam = teamsRes.data.find(t => t.id === proj.team_id);
      const allMembers  = (projectTeam?.members?.length
        ? projectTeam.members
        : teamsRes.data.flatMap(t => t.members || []));
      setMembers([...new Map(allMembers.map(m => [m.id, m])).values()]);
    } catch { setError('Failed to load project data'); }
    finally { setLoading(false); }
  };

  const fetchIssues = async () => {
    const res = await issueService.getAll(projectId);
    setIssues(res.data);
  };

  const handleCreateIssue = async (data) => {
    await issueService.create(projectId, data);
    fetchIssues();
  };

  const handleCreateTest = async (data) => {
    await testCaseService.create(projectId, data);
    const res = await testCaseService.getAll(projectId);
    setTestCases(res.data);
  };

  const handleCreateSprint = async (data) => {
    await sprintService.create(projectId, data);
    const res = await sprintService.getAll(projectId);
    setSprints(res.data);
  };

  const handleUpdateIssue = (updated) => {
    setIssues(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
  };

  const handleDeleteIssue = (id) => {
    setIssues(prev => prev.filter(i => i.id !== id));
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Delete this test case?')) return;
    await testCaseService.delete(projectId, id);
    setTestCases(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteSprint = async (id) => {
    if (!window.confirm('Delete this sprint? Issues will be unassigned from it.')) return;
    await sprintService.delete(projectId, id);
    setSprints(prev => prev.filter(s => s.id !== id));
  };

  const handleSprintStatusChange = async (sprint, status) => {
    const res = await sprintService.update(projectId, sprint.id, { status });
    setSprints(prev => prev.map(s => s.id === sprint.id ? { ...s, ...res.data.sprint } : s));
  };

  const handleTestStatusChange = async (tc, status) => {
    await testCaseService.update(projectId, tc.id, { status });
    setTestCases(prev => prev.map(t => t.id === tc.id ? { ...t, status } : t));
  };

  const filteredIssues = issues.filter(i => {
    if (filterStatus   && i.status   !== filterStatus)   return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterType     && i.type     !== filterType)     return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount      = issues.filter(i => i.status === 'open').length;
  const inProgCount    = issues.filter(i => i.status === 'in_progress').length;
  const closedCount    = issues.filter(i => i.status === 'closed').length;
  const criticalCount  = issues.filter(i => i.priority === 'critical').length;

  if (loading) return <div className="page-wrapper" style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>;
  if (!project) return (
    <div className="page-wrapper">
      <div className="alert alert-error">Project not found</div>
      <button className="btn btn-primary" onClick={() => navigate('/apps')}>Back to Projects</button>
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div className="pd-header">
        <div className="pd-header-left">
          <button className="pd-back-btn" onClick={() => navigate('/apps')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div className="pd-project-name-row">
              <h1 className="pd-project-name">{project.name}</h1>
              {project.platform && <span className="pd-platform-badge">{project.platform.replace(/_/g, ' ')}</span>}
            </div>
            {project.description && <p className="pd-project-desc">{project.description}</p>}
          </div>
        </div>
        <button className="pd-kb-btn" onClick={() => navigate(`/apps/${projectId}/knowledge-base`)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Knowledge Base
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="pd-stats-strip">
        {[
          { label: 'Open',        val: openCount,     color: '#3b82f6' },
          { label: 'In Progress', val: inProgCount,   color: '#f59e0b' },
          { label: 'Closed',      val: closedCount,   color: '#10b981' },
          { label: 'Critical',    val: criticalCount, color: '#ef4444' },
          { label: 'Test Cases',  val: testCases.length, color: '#8b5cf6' },
          { label: 'Sprints',     val: sprints.length,   color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} className="pd-stat-pill">
            <span className="pd-stat-num" style={{ color: s.color }}>{s.val}</span>
            <span className="pd-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Tabs ── */}
      <div className="pd-tabs">
        {[
          { key: 'issues',  label: `Issues`,     count: issues.length },
          { key: 'tests',   label: `Test Cases`, count: testCases.length },
          { key: 'sprints', label: `Sprints`,    count: sprints.length },
          { key: 'reports', label: `Reports` },
        ].map(t => (
          <button
            key={t.key}
            className={`pd-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.count != null && <span className="pd-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ════════ ISSUES TAB ════════ */}
      {activeTab === 'issues' && (
        <div className="pd-tab-content">
          {/* Toolbar */}
          <div className="pd-toolbar">
            <button className="pd-btn-primary" onClick={() => setShowIssueModal(true)}>+ New Issue</button>
            <div className="pd-search-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="pd-search" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="pd-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              {['open','in_progress','closed'].map(v => <option key={v} value={v}>{capitalize(v)}</option>)}
            </select>
            <select className="pd-filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priority</option>
              {['low','medium','high','critical'].map(v => <option key={v} value={v}>{capitalize(v)}</option>)}
            </select>
            <select className="pd-filter-select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
              <option value="">All Severity</option>
              {['low','medium','high','critical'].map(v => <option key={v} value={v}>{capitalize(v)}</option>)}
            </select>
            <select className="pd-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {['bug','improvement','observation','suggestion'].map(v => <option key={v} value={v}>{capitalize(v)}</option>)}
            </select>
            {(filterStatus || filterPriority || filterSeverity || filterType || search) && (
              <button className="pd-clear-filter" onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterSeverity(''); setFilterType(''); setSearch(''); }}>Clear</button>
            )}
          </div>

          {/* Table header */}
          {filteredIssues.length > 0 && (
            <div className="pd-issues-header">
              <span style={{ width: 8 }} />
              <span style={{ width: 20 }} />
              <span className="pd-col-title">Title</span>
              <span className="pd-col-tags">Tags</span>
              <span className="pd-col-status">Status</span>
              <span className="pd-col-severity">Severity</span>
              <span className="pd-col-assignee">Assignee</span>
              <span className="pd-col-date">Date</span>
            </div>
          )}

          {/* Issue rows */}
          {filteredIssues.length === 0 ? (
            <div className="pd-empty">
              <div className="pd-empty-icon">🐛</div>
              <p>{issues.length === 0 ? 'No issues yet. Create the first one.' : 'No issues match the current filters.'}</p>
              {issues.length === 0 && <button className="pd-btn-primary" onClick={() => setShowIssueModal(true)}>+ New Issue</button>}
            </div>
          ) : (
            <div className="pd-issues-list">
              {filteredIssues.map(issue => (
                <IssueRow key={issue.id} issue={issue} onClick={() => setActiveIssue(issue)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ TEST CASES TAB ════════ */}
      {activeTab === 'tests' && (
        <div className="pd-tab-content">
          <div className="pd-toolbar">
            <button className="pd-btn-primary" onClick={() => setShowTestModal(true)}>+ New Test Case</button>
          </div>
          {testCases.length === 0 ? (
            <div className="pd-empty">
              <div className="pd-empty-icon">✅</div>
              <p>No test cases yet.</p>
              <button className="pd-btn-primary" onClick={() => setShowTestModal(true)}>+ New Test Case</button>
            </div>
          ) : (
            <div className="pd-tc-list">
              {testCases.map(tc => {
                const sc = TC_STATUS_CONFIG[tc.status] || TC_STATUS_CONFIG.untested;
                const pc = PRIORITY_CONFIG[tc.priority]?.color || '#999';
                return (
                  <div key={tc.id} className="pd-tc-row">
                    <span className="pd-tc-priority-dot" style={{ background: pc }} />
                    <div className="pd-tc-info">
                      <span className="pd-tc-title">{tc.title}</span>
                      {tc.description && <span className="pd-tc-desc">{tc.description}</span>}
                      {tc.steps && tc.steps.length > 0 && (
                        <span className="pd-tc-steps">{tc.steps.length} step{tc.steps.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="pd-tc-actions">
                      <select
                        className="pd-tc-status-select"
                        value={tc.status}
                        onChange={e => handleTestStatusChange(tc, e.target.value)}
                        style={{ color: sc.color, background: sc.bg }}
                      >
                        {Object.entries(TC_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <button className="pd-row-delete-btn" onClick={() => handleDeleteTest(tc.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════ SPRINTS TAB ════════ */}
      {activeTab === 'sprints' && (
        <div className="pd-tab-content">
          <div className="pd-toolbar">
            <button className="pd-btn-primary" onClick={() => setShowSprintModal(true)}>+ New Sprint</button>
          </div>
          {sprints.length === 0 ? (
            <div className="pd-empty">
              <div className="pd-empty-icon">🏃</div>
              <p>No sprints yet. Create your first sprint to organize work.</p>
              <button className="pd-btn-primary" onClick={() => setShowSprintModal(true)}>+ New Sprint</button>
            </div>
          ) : (
            <div className="pd-sprint-list">
              {sprints.map(sprint => {
                const sc = SPRINT_STATUS_CONFIG[sprint.status] || SPRINT_STATUS_CONFIG.planned;
                const issueCount  = parseInt(sprint.issue_count)  || 0;
                const closedCount = parseInt(sprint.closed_count) || 0;
                const progress    = issueCount > 0 ? Math.round((closedCount / issueCount) * 100) : 0;
                return (
                  <div key={sprint.id} className="pd-sprint-card">
                    <div className="pd-sprint-top">
                      <div className="pd-sprint-info">
                        <span className="pd-sprint-name">{sprint.name}</span>
                        {sprint.goal && <span className="pd-sprint-goal">{sprint.goal}</span>}
                      </div>
                      <div className="pd-sprint-meta">
                        <select
                          className="pd-sprint-status-select"
                          value={sprint.status}
                          onChange={e => handleSprintStatusChange(sprint, e.target.value)}
                          style={{ color: sc.color, background: sc.bg }}
                        >
                          {Object.entries(SPRINT_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button className="pd-row-delete-btn" onClick={() => handleDeleteSprint(sprint.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="pd-sprint-dates">
                      {sprint.start_date && <span>📅 {new Date(sprint.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {sprint.end_date   && <span>→ {new Date(sprint.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                    <div className="pd-sprint-progress-row">
                      <span className="pd-sprint-progress-label">{closedCount}/{issueCount} issues closed</span>
                      <div className="pd-sprint-progress-bar">
                        <div className="pd-sprint-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="pd-sprint-progress-pct">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════ REPORTS TAB ════════ */}
      {activeTab === 'reports' && <ReportsTab projectId={projectId} />}

      {/* ── Modals ── */}
      {showIssueModal && (
        <CreateIssueModal projectId={projectId} members={members} sprints={sprints}
          onClose={() => setShowIssueModal(false)} onCreate={handleCreateIssue} />
      )}
      {showTestModal && (
        <CreateTestModal projectId={projectId}
          onClose={() => setShowTestModal(false)} onCreate={handleCreateTest} />
      )}
      {showSprintModal && (
        <CreateSprintModal onClose={() => setShowSprintModal(false)} onCreate={handleCreateSprint} />
      )}

      {/* ── Issue Drawer ── */}
      {activeIssue && (
        <IssueDrawer
          issue={activeIssue}
          projectId={projectId}
          members={members}
          onClose={() => setActiveIssue(null)}
          onUpdate={handleUpdateIssue}
          onDelete={handleDeleteIssue}
        />
      )}
    </div>
  );
}
