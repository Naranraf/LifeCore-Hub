import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';
import { StickyNote, Plus, Trash2, Palette } from 'lucide-react';

const NOTE_COLORS = [
  'var(--glass-border)', // Default
  'rgba(239, 68, 68, 0.15)', // Red
  'rgba(245, 158, 11, 0.15)', // Yellow
  'rgba(16, 185, 129, 0.15)', // Green
  'rgba(59, 130, 246, 0.15)', // Blue
];

export default function NotesWidget() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  
  // UI State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user || (!title.trim() && !content.trim())) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'notes'), {
        title,
        content,
        color: selectedColor,
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
      setSelectedColor(NOTE_COLORS[0]);
      setIsAdding(false);
    } catch(err) {
      console.error("Failed to add note", err);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
    } catch(err) {
      console.error("Failed to delete note", err);
    }
  };

  return (
    <div className="notes-widget">
      <div className="prod-widget__header">
        <h3><StickyNote size={18} /> LyfeCore Notes</h3>
        <button 
          className="notes-widget__add-btn" 
          onClick={() => setIsAdding(!isAdding)}
          title="New Note"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="notes-widget__content">
        {/* Note Creator */}
        {isAdding && (
          <form className="notes-widget__creator glass-panel" onSubmit={handleCreate} style={{ background: selectedColor }}>
            <input 
              type="text" 
              placeholder="Title" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="notes-widget__input"
            />
            <textarea 
              placeholder="Take a note..." 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="notes-widget__textarea"
              autoFocus
            />
            <div className="notes-widget__actions">
              <div className="notes-widget__colors">
                {NOTE_COLORS.map(color => (
                  <button 
                    key={color}
                    type="button"
                    className={`notes-widget__color-btn ${selectedColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <button type="submit" className="feature-page__cta">Save</button>
            </div>
          </form>
        )}

        {/* Notes Grid */}
        {notes.length === 0 && !isAdding ? (
          <p className="prod-widget__empty">No notes yet. Add your first thought!</p>
        ) : (
          <div className="notes-widget__grid">
            {notes.map(note => (
              <div key={note.id} className="notes-widget__card" style={{ background: note.color || NOTE_COLORS[0] }}>
                {note.title && <h4 className="notes-widget__card-title">{note.title}</h4>}
                {note.content && <p className="notes-widget__card-text">{note.content}</p>}
                
                <button 
                  className="notes-widget__delete" 
                  onClick={() => handleDelete(note.id)}
                  title="Delete Note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
