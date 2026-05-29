import { useState, useEffect, useRef } from 'react';
import { issueService } from '../services/api';
import Avatar from './ui/Avatar';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  ISSUE_STATUSES, ISSUE_PRIORITIES, ISSUE_SEVERITIES, ISSUE_TYPES,
} from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import '../styles/issue-drawer.css';

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = (val) => {
    const t = val.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };

  return (
    <div className="tag-input-wrap">
      {tags.map(t => (
        <span key={t} className="tag-chip">
          {t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input); }
          if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1));
        }}
        placeholder={tags.length === 0 ? 'Add tags…' : ''}
      />
    </div>
  );
}

export default function IssueDrawer({ issue: initialIssue, projectId, onClose, onUpdate, onDelete, members = [] }) {
  const [issue, setIssue]           = useState(initialIssue);
  const [title, setTitle]           = useState(initialIssue.title);
  const [desc, setDesc]             = useState(initialIssue.description || '');
  const [tags, setTags]             = useState(initialIssue.tags || []);
  const [saving, setSaving]         = useState(false);
  const [comments, setComments]     = useState([]);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const titleRef = useRef(null);

  useEffect(() => { loadComments(); }, [initialIssue.id]);

  const loadComments = async () => {
    try {
      const res = await issueService.getComments(projectId, initialIssue.id);
      setComments(res.data);
    } catch {}
  };

  const patch = async (updates) => {
    setSaving(true);
    try {
      const res = await issueService.update(projectId, issue.id, updates);
      const updated = { ...issue, ...res.data.issue };
      setIssue(updated);
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  };

  const saveText = async () => {
    if (title.trim() === issue.title && desc === (issue.description || '')) return;
    await patch({ title: title.trim(), description: desc });
  };

  const saveTags = async (newTags) => {
    setTags(newTags);
    await patch({ tags: newTags });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setAddingComment(true);
    try {
      await issueService.addComment(projectId, issue.id, newComment.trim());
      setNewComment('');
      loadComments();
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await issueService.deleteComment(projectId, issue.id, commentId);
    setComments(cs => cs.filter(c => c.id !== commentId));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue? This cannot be undone.')) return;
    await issueService.delete(projectId, issue.id);
    onDelete(issue.id);
    onClose();
  };

  const sc = STATUS_CONFIG[issue.status]   || STATUS_CONFIG.open;
  const pc = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.medium;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="issue-drawer">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <span className="drawer-issue-type">{TYPE_CONFIG[issue.type]?.icon || '🐛'}</span>
            <span className="drawer-issue-id">#{issue.id.slice(0, 8).toUpperCase()}</span>
            {saving && <span className="drawer-saving">Saving…</span>}
          </div>
          <div className="drawer-header-actions">
            <button className="drawer-delete-btn" onClick={handleDelete} title="Delete issue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
            <button className="drawer-close-btn" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="drawer-title-wrap">
          <textarea
            ref={titleRef}
            className="drawer-title-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveText}
            rows={1}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />
        </div>

        {/* Status row */}
        <div className="drawer-status-row">
          {ISSUE_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                className={`drawer-status-btn${issue.status === s ? ' active' : ''}`}
                style={issue.status === s ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                onClick={() => patch({ status: s })}
              >{cfg.label}</button>
            );
          })}
        </div>

        {/* Section tabs */}
        <div className="drawer-section-tabs">
          <button className={activeSection === 'details'  ? 'active' : ''} onClick={() => setActiveSection('details')}>Details</button>
          <button className={activeSection === 'comments' ? 'active' : ''} onClick={() => setActiveSection('comments')}>
            Comments {comments.length > 0 && <span className="drawer-comment-count">{comments.length}</span>}
          </button>
        </div>

        <div className="drawer-body">
          {activeSection === 'details' && (
            <>
              <div className="drawer-meta-grid">
                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Priority</span>
                  <select
                    className="drawer-meta-select"
                    value={issue.priority}
                    onChange={e => patch({ priority: e.target.value })}
                    style={{ borderLeftColor: pc.color }}
                  >
                    {ISSUE_PRIORITIES.map(p => (
                      <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                    ))}
                  </select>
                </div>

                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Severity</span>
                  <select
                    className="drawer-meta-select"
                    value={issue.severity || 'medium'}
                    onChange={e => patch({ severity: e.target.value })}
                  >
                    {ISSUE_SEVERITIES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Type</span>
                  <select
                    className="drawer-meta-select"
                    value={issue.type || 'bug'}
                    onChange={e => patch({ type: e.target.value })}
                  >
                    {ISSUE_TYPES.map(t => (
                      <option key={t} value={t}>{TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}</option>
                    ))}
                  </select>
                </div>

                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Assignee</span>
                  <select
                    className="drawer-meta-select"
                    value={issue.assignee_id || ''}
                    onChange={e => patch({ assignee_id: e.target.value || null })}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Reported by</span>
                  <div className="drawer-meta-value-row">
                    <Avatar name={issue.created_by_name} size={20} />
                    <span className="drawer-meta-text">{issue.created_by_name || 'Unknown'}</span>
                  </div>
                </div>

                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Created</span>
                  <span className="drawer-meta-text">{formatDate(issue.created_at)} {formatTime(issue.created_at)}</span>
                </div>

                <div className="drawer-meta-row">
                  <span className="drawer-meta-label">Updated</span>
                  <span className="drawer-meta-text">{formatDate(issue.updated_at)}</span>
                </div>
              </div>

              <div className="drawer-field">
                <label className="drawer-field-label">Tags</label>
                <TagInput tags={tags} onChange={saveTags} />
              </div>

              <div className="drawer-field">
                <label className="drawer-field-label">Description</label>
                <textarea
                  className="drawer-desc-input"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  onBlur={saveText}
                  placeholder="Add a description…"
                  rows={5}
                />
              </div>
            </>
          )}

          {activeSection === 'comments' && (
            <div className="drawer-comments">
              <form onSubmit={handleAddComment} className="drawer-comment-form">
                <textarea
                  className="drawer-comment-input"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                  rows={3}
                />
                <button type="submit" className="drawer-comment-submit" disabled={addingComment || !newComment.trim()}>
                  {addingComment ? 'Posting…' : 'Post Comment'}
                </button>
              </form>

              {comments.length === 0 ? (
                <div className="drawer-empty-comments">No comments yet. Be the first to comment.</div>
              ) : (
                <div className="drawer-comment-list">
                  {comments.map(c => (
                    <div key={c.id} className="drawer-comment-item">
                      <Avatar name={c.name} size={32} />
                      <div className="drawer-comment-body">
                        <div className="drawer-comment-meta">
                          <span className="drawer-comment-author">{c.name}</span>
                          <span className="drawer-comment-time">{formatDate(c.created_at)} at {formatTime(c.created_at)}</span>
                          <button className="drawer-comment-delete" onClick={() => handleDeleteComment(c.id)}>Delete</button>
                        </div>
                        <p className="drawer-comment-text">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
