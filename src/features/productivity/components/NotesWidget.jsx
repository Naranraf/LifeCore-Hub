import React, { useState, useEffect, useRef } from 'react';
import { 
  StickyNote, Plus, Trash2, Palette, Save, X, Loader2, CheckCircle2, Tag, Check 
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import useNotesStore from '../hooks/useNotes';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import './NotesWidget.css';

const NOTE_COLORS = [
  'var(--glass-border)',
  'rgba(239, 68, 68, 0.15)', // Red
  'rgba(245, 158, 11, 0.15)', // Yellow
  'rgba(16, 185, 129, 0.15)', // Green
  'rgba(59, 130, 246, 0.15)', // Blue
  'rgba(168, 85, 247, 0.15)', // Purple
];

/**
 * Advanced NotesWidget — TIER 3 UX Refinement.
 * 
 * Features:
 * - Online editing with Autosave (Debounced).
 * - Real-time saving indicators.
 * - Categorization & Color Palette.
 * - Discard changes fallback.
 */
export default function NotesWidget() {
  const { 
    notes, loading, saving, initListener, createNote, updateNoteDebounced, deleteNote, cleanup 
  } = useNotesStore();

  const [editingId, setEditingId] = useState(null);
  const [localNote, setLocalNote] = useState(null);

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, []);

  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setLocalNote({ ...note });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setLocalNote(null);
  };

  const handleUpdate = (field, value) => {
    const updated = { ...localNote, [field]: value };
    setLocalNote(updated);
    updateNoteDebounced(localNote.id, { [field]: value });
  };

  const handleCreate = async () => {
    const newId = await createNote();
    if (newId) {
      setEditingId(newId);
      // Initialize local state for the new note immediately to prevent null pointer crash
      setLocalNote({
        id: newId,
        title: '',
        content: '',
        color: NOTE_COLORS[0],
        tags: []
      });
    }
  };

  return (
    <div id="widget-notes-advanced" className="notes-widget">
      <div className="prod-widget__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StickyNote size={18} />
          <h3>LyfeCore Notes</h3>
          {saving && (
            <div className="notes-widget__status-pill">
              <Loader2 size={10} className="spin" /> <span>Autosaving...</span>
            </div>
          )}
        </div>
        <Button variant="glass" size="small" onClick={handleCreate} title="Create Note">
          <Plus size={16} /> New Thought
        </Button>
      </div>

      <div className="notes-widget__content">
        {loading && notes.length === 0 ? (
          <div className="prod-widget__empty"><Loader2 className="spin" /> Loading thoughts...</div>
        ) : notes.length === 0 ? (
          <div className="prod-widget__empty">
            <p>Your mind is clear. Capture a new thought!</p>
          </div>
        ) : (
          <div className="notes-widget__grid">
            {notes.map(note => {
              const isEditing = editingId === note.id;
              const displayNote = isEditing ? localNote : note;

              return (
                <Card 
                  key={note.id} 
                  className={`notes-widget__card ${isEditing ? 'is-editing' : ''}`}
                  style={{ background: displayNote.color || NOTE_COLORS[0] }}
                  onClick={() => !isEditing && handleStartEdit(note)}
                >
                  <div className="notes-widget__card-header">
                    {isEditing ? (
                      <input 
                        type="text"
                        value={displayNote.title}
                        onChange={(e) => handleUpdate('title', e.target.value)}
                        placeholder="Thought Title"
                        className="notes-widget__title-input"
                        autoFocus
                      />
                    ) : (
                      <h4 className="notes-widget__card-title">{note.title || 'Untitled Thought'}</h4>
                    )}
                    <div className="notes-widget__card-meta">
                      {isEditing && (
                        <button className="notes-widget__icon-btn save" onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} title="Done Editing">
                          <Check size={14} />
                        </button>
                      )}
                      <button className="notes-widget__icon-btn delete" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="notes-widget__card-body">
                    {isEditing ? (
                      <ReactQuill 
                        theme="snow"
                        value={displayNote.content}
                        onChange={(val) => handleUpdate('content', val)}
                        placeholder="Start typing your ideas..."
                        modules={{
                          toolbar: [
                            ['bold', 'italic'],
                            [{ 'list': 'bullet' }, { 'list': 'ordered' }],
                            ['clean']
                          ]
                        }}
                      />
                    ) : (
                      <div 
                        className="notes-widget__card-text ql-editor" 
                        dangerouslySetInnerHTML={{ __html: note.content || 'No content yet...' }} 
                      />
                    )}
                  </div>

                  {isEditing && (
                    <div className="notes-widget__card-footer">
                      <div className="notes-widget__color-picker">
                        {NOTE_COLORS.map(color => (
                          <button 
                            key={color}
                            className={`color-dot ${displayNote.color === color ? 'active' : ''}`}
                            style={{ background: color }}
                            onClick={() => handleUpdate('color', color)}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="notes-widget__save-indicator">
                          {saving ? <Loader2 size={12} className="spin" /> : <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />}
                          <span>{saving ? 'Saving' : 'Synced'}</span>
                        </div>
                        <Button variant="primary" size="small" onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}>
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
