import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, knowledgeBaseService } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import '../styles/knowledge-base.css';

const SOURCES = [
  {
    id: 'requirements',
    label: 'Requirements',
    items: [
      { id: 'upload_docs',    label: 'Upload Docs',   type: 'link',     color: '#f59e0b' },
      { id: 'architecture',   label: 'Architecture',  type: 'link',     color: '#6b7280' },
      { id: 'user_flow',      label: 'User Flow',     type: 'link',     color: '#10b981' },
      { id: 'db_schema',      label: 'DB Schema',     type: 'link',     color: '#3b82f6' },
      { id: 'meeting_notes',  label: 'Meeting notes', type: 'link',     color: '#8b5cf6' },
      { id: 'api_docs',       label: 'API Docs',      type: 'link',     color: '#059669' },
      { id: 'custom_files',   label: 'Custom Files',  type: 'document', color: '#6b7280' },
    ],
  },
  {
    id: 'project_management',
    label: 'Project Management',
    items: [
      { id: 'jira',   label: 'Jira',   type: 'integration', color: '#0052CC' },
      { id: 'asana',  label: 'Asana',  type: 'integration', color: '#FC636B' },
      { id: 'zoho',   label: 'Zoho',   type: 'integration', color: '#E42527' },
      { id: 'github', label: 'Github', type: 'integration', color: '#24292f' },
    ],
  },
  {
    id: 'designs',
    label: 'Designs',
    items: [
      { id: 'figma',      label: 'Figma',      type: 'integration', color: '#F24E1E' },
      { id: 'wireframes', label: 'Wireframes', type: 'integration', color: '#f97316' },
      { id: 'designs',    label: 'Designs',    type: 'integration', color: '#8b5cf6' },
      { id: 'flows',      label: 'Flows',      type: 'integration', color: '#06b6d4' },
    ],
  },
];

/* ── Icons ── */
const IconChevron = ({ expanded }) => (
  <svg className={`kb-chevron${expanded ? ' expanded' : ''}`} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconDoc = ({ color }) => (
  <svg viewBox="0 0 18 18" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <rect x="1" y="1" width="16" height="16" rx="3" fill={color + '22'} stroke={color} strokeWidth="1.5"/>
    <line x1="4" y1="6" x2="14" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="4" y1="9" x2="11" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="4" y1="12" x2="13" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function EmptyState() {
  return (
    <div className="kb-empty">
      <div className="kb-empty-cards">
        <div className="kb-empty-card">
          <span className="kb-empty-symbol">?</span>
        </div>
        <div className="kb-empty-card kb-empty-card-link">
          <IconLink />
        </div>
      </div>
    </div>
  );
}

function IntegrationConnect({ item }) {
  return (
    <div className="kb-integration">
      <div className="kb-integration-graphic">
        <div className="kb-integration-logo kb-logo-left">B</div>
        <div className="kb-integration-connector">
          <div className="kb-connector-line" />
          <div className="kb-connector-dot" />
          <div className="kb-connector-line" />
        </div>
        <div className="kb-integration-logo kb-logo-right" style={{ background: item.color }}>
          {item.label[0]}
        </div>
      </div>
      <button className="btn btn-primary kb-connect-btn" onClick={() => alert('Integration coming soon!')}>
        Connect
      </button>
    </div>
  );
}

function KnowledgeBase() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [expandedSections, setExpanded] = useState({ requirements: true, project_management: false, designs: false });
  const [selected, setSelected]         = useState({ sectionId: 'requirements', item: SOURCES[0].items[0] });
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ title: '', url: '', content: '' });
  const [formError, setFormError]       = useState('');

  const type = selected?.item?.type;
  const isDocType = type === 'link' || type === 'document';

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectService.getById(projectId).then(r => r.data),
  });

  const kbQueryKey = queryKeys.knowledgeBase(projectId, selected?.sectionId, selected?.item?.id);

  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: kbQueryKey,
    queryFn: () => knowledgeBaseService.getAll(projectId, selected.sectionId, selected.item.id).then(r => r.data),
    enabled: isDocType,
  });

  const createMutation = useMutation({
    mutationFn: (data) => knowledgeBaseService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kbQueryKey });
      setForm({ title: '', url: '', content: '' });
      setShowForm(false);
      setFormError('');
    },
    onError: () => setFormError('Failed to save. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => knowledgeBaseService.delete(projectId, docId),
    onSuccess: (_, docId) => {
      queryClient.setQueryData(kbQueryKey, old => old?.filter(d => d.id !== docId) ?? []);
    },
    onError: () => alert('Failed to delete.'),
  });

  const handleSelect = (sectionId, item) => {
    setSelected({ sectionId, item });
    setShowForm(false);
    setForm({ title: '', url: '', content: '' });
    setFormError('');
  };

  const handleToggleSection = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setFormError('');
    createMutation.mutate({
      category:    selected.sectionId,
      subcategory: selected.item.id,
      title:       form.title.trim(),
      url:         form.url.trim() || null,
      content:     form.content.trim() || null,
      doc_type:    selected.item.type,
    });
  };

  const handleDelete = (docId) => {
    if (!window.confirm('Delete this entry?')) return;
    deleteMutation.mutate(docId);
  };

  if (projectLoading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const currentSection = SOURCES.find(s => s.id === selected?.sectionId);

  return (
    <div className="page-wrapper kb-page">
      {/* Top bar */}
      <div className="kb-topbar">
        <button className="kb-back-btn" onClick={() => navigate(`/apps/${projectId}`)}>
          <IconBack />
          <span>{project?.name || 'Project'}</span>
        </button>
      </div>

      {/* Header banner */}
      <div className="kb-banner">
        <div className="kb-banner-text">
          <h1>Knowledge Base</h1>
          <p>Create a common shared understanding</p>
        </div>
        <div className="kb-banner-art" aria-hidden="true">
          <svg width="180" height="80" viewBox="0 0 180 80" fill="none">
            <rect x="10" y="8"  width="40" height="52" rx="5" fill="#c7d2fe" opacity=".8"/>
            <rect x="16" y="15" width="28" height="4"  rx="2" fill="#818cf8"/>
            <rect x="16" y="23" width="20" height="3"  rx="1.5" fill="#a5b4fc"/>
            <rect x="16" y="30" width="24" height="3"  rx="1.5" fill="#a5b4fc"/>
            <rect x="60" y="2"  width="36" height="46" rx="5" fill="#fde68a" opacity=".85"/>
            <rect x="66" y="10" width="24" height="4"  rx="2" fill="#f59e0b"/>
            <rect x="66" y="18" width="18" height="3"  rx="1.5" fill="#fbbf24"/>
            <rect x="66" y="25" width="22" height="3"  rx="1.5" fill="#fbbf24"/>
            <rect x="106" y="14" width="34" height="44" rx="5" fill="#ddd6fe" opacity=".85"/>
            <rect x="112" y="21" width="22" height="4"  rx="2" fill="#8b5cf6"/>
            <rect x="112" y="29" width="16" height="3"  rx="1.5" fill="#a78bfa"/>
            <rect x="112" y="36" width="20" height="3"  rx="1.5" fill="#a78bfa"/>
            <rect x="146" y="6"  width="30" height="40" rx="5" fill="#bbf7d0" opacity=".8"/>
            <rect x="152" y="14" width="18" height="4"  rx="2" fill="#10b981"/>
            <rect x="152" y="22" width="12" height="3"  rx="1.5" fill="#34d399"/>
            <line x1="30"  y1="60" x2="80"  y2="8"  stroke="#818cf8" strokeWidth="1" opacity=".3"/>
            <line x1="80"  y1="48" x2="123" y2="14" stroke="#f59e0b" strokeWidth="1" opacity=".3"/>
            <line x1="123" y1="58" x2="161" y2="6"  stroke="#8b5cf6" strokeWidth="1" opacity=".3"/>
          </svg>
        </div>
      </div>

      {/* Two-panel body */}
      <div className="kb-body">
        {/* ── Left: Sources panel ── */}
        <div className="kb-sources-panel">
          <div className="kb-sources-title">
            <IconFolder />
            <span>Sources</span>
          </div>

          {SOURCES.map(section => (
            <div key={section.id} className="kb-section">
              <button
                className="kb-section-toggle"
                onClick={() => handleToggleSection(section.id)}
              >
                <span className="kb-section-icon-wrap">
                  {section.id === 'requirements'       && <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><rect x="1" y="1" width="14" height="14" rx="3" fill="#6366f122"/><line x1="4" y1="5" x2="12" y2="5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="8" x2="10" y2="8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="11" x2="11" y2="11" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  {section.id === 'project_management' && <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><path d="M14 13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3l1.5 2H13a1 1 0 0 1 1 1v6z" fill="#0d9488" opacity=".2" stroke="#0d9488" strokeWidth="1.2"/></svg>}
                  {section.id === 'designs'            && <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><circle cx="8" cy="8" r="6" fill="#f9a8d422" stroke="#ec4899" strokeWidth="1.2"/><circle cx="8" cy="8" r="2.5" fill="#ec4899"/></svg>}
                </span>
                <span className="kb-section-label">{section.label}</span>
                <IconChevron expanded={expandedSections[section.id]} />
              </button>

              {expandedSections[section.id] && (
                <div className="kb-section-items">
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      className={`kb-source-item${selected?.item?.id === item.id && selected?.sectionId === section.id ? ' active' : ''}`}
                      onClick={() => handleSelect(section.id, item)}
                    >
                      <IconDoc color={item.color} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Right: Content panel ── */}
        <div className="kb-content-panel">
          {selected && (
            <>
              <div className="kb-content-header">
                <div className="kb-breadcrumb">
                  <IconFolder />
                  <span className="kb-breadcrumb-section">{currentSection?.label}</span>
                  <span className="kb-breadcrumb-sep">/</span>
                  <strong className="kb-breadcrumb-item">{selected.item.label}</strong>
                </div>

                {type === 'link' && (
                  <button className="btn btn-primary kb-add-btn" onClick={() => setShowForm(v => !v)}>
                    + Add
                  </button>
                )}
                {type === 'document' && (
                  <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
                    New Document
                  </button>
                )}
              </div>

              {formError && <div className="alert alert-error" style={{ margin: '12px 0' }}>{formError}</div>}

              {type === 'integration' && <IntegrationConnect item={selected.item} />}

              {isDocType && (
                <div className="kb-content-body">
                  {showForm && (
                    <div className="card kb-form-card">
                      <form onSubmit={handleSubmit}>
                        <div className="input-group">
                          <label>Title</label>
                          <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder={type === 'document' ? 'Document title' : 'Entry title'}
                            required
                            autoFocus
                          />
                        </div>

                        {type === 'link' && (
                          <div className="input-group">
                            <label>URL</label>
                            <input
                              type="url"
                              value={form.url}
                              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                              placeholder="https://..."
                            />
                          </div>
                        )}

                        {type === 'document' && (
                          <div className="input-group">
                            <label>Content</label>
                            <textarea
                              value={form.content}
                              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                              placeholder="Write your document content here..."
                              rows={6}
                            />
                          </div>
                        )}

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving…' : 'Save'}
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {docsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" />
                    </div>
                  ) : docs.length === 0 && !showForm ? (
                    <EmptyState />
                  ) : (
                    <div className="kb-docs-list">
                      {docs.map(doc => (
                        <div key={doc.id} className="kb-doc-item">
                          <div className="kb-doc-main">
                            <div className="kb-doc-title">{doc.title}</div>
                            {doc.url && (
                              <a className="kb-doc-url" href={doc.url} target="_blank" rel="noopener noreferrer">
                                <IconLink /> {doc.url}
                              </a>
                            )}
                            {doc.content && (
                              <p className="kb-doc-content">{doc.content}</p>
                            )}
                          </div>
                          <button className="btn-delete" onClick={() => handleDelete(doc.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;
