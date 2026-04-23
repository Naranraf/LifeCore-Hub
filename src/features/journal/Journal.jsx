/**
 * Journal Page — Private Reflection and AI Analysis module.
 * 
 * Purpose: Provides a rich-text environment for personal writing, with integrated AI sentiment analysis.
 * Features:
 * - Rich text editing via React Quill.
 * - Real-time sync with Firestore.
 * - AI Insights powered by Gemini (mood, themes, suggestions).
 * - XSS protection via DOMPurify.
 */
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Requires legacy peer deps on React 19
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../lib/firebase';
import useAuthStore from '../../hooks/useAuth';
import { Book, Plus, Trash2, Edit3, Save, Sparkles, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import './Journal.css';

export default function Journal() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

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
    setAiInsights(null); // Reset insights when changing entries
  };

  const handleNewEntry = () => {
    setActiveEntry(null);
    setTitle('');
    setContent('');
    setAiInsights(null);
  };

  const handleSave = async () => {
    if (!user || (!title.trim() && !content.trim())) return;
    setIsSaving(true);
    
    // Sanitize rich text against XSS before saving to DB
    const cleanContent = DOMPurify.sanitize(content);

    try {
      if (activeEntry) {
        // Update existing
        const docRef = doc(db, 'users', user.uid, 'journal', activeEntry.id);
        await updateDoc(docRef, {
          title,
          content: cleanContent,
          plainTextPreview: cleanContent.replace(/<[^>]+>/g, '').substring(0, 100),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new
        const newDocRef = await addDoc(collection(db, 'users', user.uid, 'journal'), {
          title: title || 'Untitled Entry',
          content: cleanContent,
          plainTextPreview: cleanContent.replace(/<[^>]+>/g, '').substring(0, 100),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setActiveEntry({ id: newDocRef.id, title, content });
      }
    } catch (e) {
      console.error("Save error", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiInsights(null);
    try {
      const analyzeFn = httpsCallable(functions, 'chatWithGemini');
      const plainText = content.replace(/<[^>]+>/g, '');
      const prompt = `Act as a wellness coach and psychologist. Analyze this personal journal entry. Provide:
1. Expected mood or sentiment.
2. 2-3 key themes/topics discussed.
3. One short encouraging thought or reflection question for the user. Keep it brief. 
Entry:\n"${plainText}"`;
      
      const res = await analyzeFn({ prompt });
      setAiInsights(res.data.text);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAiInsights("Error: Could not retrieve AI insights. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
    <div id="page-journal" className="feature-page journal-page">
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
                let dateStr = 'Just now';
                let timeStr = '';
                if (entry.createdAt) {
                  const d = new Date(entry.createdAt);
                  if (!isNaN(d)) {
                    dateStr = d.toLocaleDateString();
                    timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (entry.createdAt.toDate) { // Fallback for old Firebase timestamps
                    dateStr = entry.createdAt.toDate().toLocaleDateString();
                    timeStr = entry.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                }

                return (
                  <div 
                    key={entry.id} 
                    className={`journal__item ${activeEntry?.id === entry.id ? 'journal__item--active' : ''}`}
                    onClick={() => loadEntry(entry)}
                  >
                    <div className="journal__item-content">
                      <h4 className="journal__item-title">{entry.title || 'Untitled'}</h4>
                      <p className="journal__item-preview">{entry.plainTextPreview || 'Empty note...'}</p>
                      <span className="journal__item-date">{dateStr} {timeStr}</span>
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="feature-page__cta journal__analyze-btn" 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim()}
                style={{ background: 'var(--accent-secondary)' }}
              >
                {isAnalyzing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                {isAnalyzing ? ' Analyzing...' : ' Analyze with AI'}
              </button>
              <button 
                className="feature-page__cta journal__save-btn" 
                onClick={handleSave}
                disabled={isSaving || (!title && !content)}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div className="journal__quill-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', overflowY: 'auto' }}>
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                placeholder="Write your thoughts here..."
                style={{ height: 'calc(100% - 42px)' }}
              />
            </div>
            {aiInsights && (
              <div className="journal__insights glass-panel" style={{ padding: '16px', background: 'var(--glass-border)', borderRadius: '12px', borderLeft: '4px solid var(--accent-secondary)', marginTop: '8px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-secondary)' }}>
                  <Sparkles size={18} /> AI Insight
                </h4>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {aiInsights}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
