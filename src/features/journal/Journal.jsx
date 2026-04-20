import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Requires legacy peer deps on React 19
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, getServerTimestamp } from '../../lib/firebase';
import useAuthStore from '../../hooks/useAuth';
import { Book, Plus, Trash2, Edit3, Save } from 'lucide-react';
import './Journal.css';

export default function Journal() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch entries from Firestore
  useEffect(() => {
    if (!user) return;
    
    // Listen to real-time changes
    const q = query(collection(db, 'users', user.uid, 'journal'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
    }, (error) => {
      console.error("Error fetching journal entries", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Load an entry into editor
  const loadEntry = (entry) => {
    setActiveEntry(entry);
    setTitle(entry.title || '');
    setContent(entry.content || '');
  };

  const handleNewEntry = () => {
    setActiveEntry(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!user || (!title.trim() && !content.trim())) return;
    setIsSaving(true);

    try {
      if (activeEntry) {
        // Update existing
        const docRef = doc(db, 'users', user.uid, 'journal', activeEntry.id);
        await updateDoc(docRef, {
          title,
          content,
          plainTextPreview: content.replace(/<[^>]+>/g, '').substring(0, 100),
          updatedAt: getServerTimestamp(),
        });
      } else {
        // Create new
        const newDocRef = await addDoc(collection(db, 'users', user.uid, 'journal'), {
          title: title || 'Untitled Entry',
          content,
          plainTextPreview: content.replace(/<[^>]+>/g, '').substring(0, 100),
          createdAt: getServerTimestamp(),
          updatedAt: getServerTimestamp(),
        });
        setActiveEntry({ id: newDocRef.id, title, content });
      }
    } catch (e) {
      console.error("Save error", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this entry entirely?")) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journal', id));
      if (activeEntry?.id === id) {
        handleNewEntry();
      }
    } catch(err) {
      console.error("Delete error", err);
    }
  };

  // React Quill Modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="feature-page journal-page">
      <header className="feature-page__header" style={{ marginBottom: '16px' }}>
        <div className="feature-page__icon" style={{ background: 'var(--glass-border)', color: 'var(--accent)' }}>
          <Book size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">Personal Journal</h1>
          <p className="feature-page__desc">Write your thoughts, ideas, and reflections.</p>
        </div>
      </header>

      <div className="journal__layout">
        {/* Sidebar List */}
        <div className="journal__sidebar glass-panel">
          <div className="journal__sidebar-header">
            <h3>Entries</h3>
            <button className="journal__new-btn" onClick={handleNewEntry} title="New Entry">
              <Plus size={16} /> New
            </button>
          </div>
          
          <div className="journal__list">
            {entries.length === 0 ? (
              <p className="journal__empty">No journal entries found.</p>
            ) : (
              entries.map(entry => {
                const date = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString() : 'Just now';
                const time = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div 
                    key={entry.id} 
                    className={`journal__item ${activeEntry?.id === entry.id ? 'journal__item--active' : ''}`}
                    onClick={() => loadEntry(entry)}
                  >
                    <div className="journal__item-content">
                      <h4 className="journal__item-title">{entry.title || 'Untitled'}</h4>
                      <p className="journal__item-preview">{entry.plainTextPreview || 'Empty note...'}</p>
                      <span className="journal__item-date">{date} {time}</span>
                    </div>
                    <button className="journal__item-delete" onClick={(e) => handleDelete(e, entry.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="journal__editor glass-panel">
          <div className="journal__editor-header">
            <input 
              type="text" 
              className="journal__title-input" 
              placeholder="Entry Title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button 
              className="feature-page__cta journal__save-btn" 
              onClick={handleSave}
              disabled={isSaving || (!title && !content)}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="journal__quill-container">
             {/* Note: ReactQuill might throw a React 19 findDOMNode warning, but it functionally works */}
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              placeholder="Write your thoughts here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
