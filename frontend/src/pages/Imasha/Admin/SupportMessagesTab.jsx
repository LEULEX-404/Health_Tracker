import React, { useEffect, useMemo, useState } from 'react';
import { Inbox, MessageSquareWarning, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/Imasha/AuthContext';
import {
  getAllSupportMessages,
  updateSupportMessage,
} from '../../../utils/Imasha/supportApi';

const SupportMessagesTab = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [drafts, setDrafts] = useState({});

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await getAllSupportMessages(token);
      const list = Array.isArray(response?.data) ? response.data : [];
      setMessages(list);
      setDrafts(
        list.reduce((acc, item) => {
          acc[item._id] = item.adminNote || '';
          return acc;
        }, {})
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to load support messages.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMessages();
    }
  }, [token]);

  const summary = useMemo(() => ({
    total: messages.length,
    open: messages.filter((item) => item.status === 'Open').length,
    resolved: messages.filter((item) => item.status === 'Resolved').length,
  }), [messages]);

  const onDraftChange = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const saveMessage = async (messageId, status) => {
    setSavingId(messageId);
    try {
      const response = await updateSupportMessage(token, messageId, {
        status,
        adminNote: drafts[messageId] || '',
      });
      toast.success(response?.message || 'Support message updated.');
      await loadMessages();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to update support message.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="admin-support-tab">
      <div className="admin-support-summary">
        <div className="admin-support-card">
          <div className="admin-support-card__icon total">
            <Inbox size={18} />
          </div>
          <div>
            <span>Total Messages</span>
            <strong>{summary.total}</strong>
          </div>
        </div>
        <div className="admin-support-card">
          <div className="admin-support-card__icon open">
            <MessageSquareWarning size={18} />
          </div>
          <div>
            <span>Open Issues</span>
            <strong>{summary.open}</strong>
          </div>
        </div>
        <div className="admin-support-card">
          <div className="admin-support-card__icon resolved">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span>Resolved</span>
            <strong>{summary.resolved}</strong>
          </div>
        </div>
      </div>

      <div className="admin-module-card">
        <div className="module-header">
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Doctor Support Inbox</h3>
          <p style={{ margin: 0, color: 'var(--admin-text-muted)' }}>
            Review messages sent by doctors and leave an internal response note.
          </p>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: '2rem 1rem' }}>Loading support messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>No doctor support messages yet.</div>
        ) : (
          <div className="admin-support-list">
            {messages.map((item) => (
              <article key={item._id} className="admin-support-item">
                <div className="admin-support-item__top">
                  <div>
                    <h4>{item.subject}</h4>
                    <p>{item.doctorName} | {item.doctorEmail}</p>
                  </div>
                  <span className={`status-pill ${item.status === 'Resolved' ? 'success' : 'warn'}`}>
                    {item.status}
                  </span>
                </div>

                <div className="admin-support-item__meta">
                  <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                  {item.updatedAt ? <span>Updated: {new Date(item.updatedAt).toLocaleString()}</span> : null}
                </div>

                <p className="admin-support-item__message">{item.message}</p>

                <label className="admin-support-item__label" htmlFor={`admin-note-${item._id}`}>
                  Admin Note
                </label>
                <textarea
                  id={`admin-note-${item._id}`}
                  className="admin-support-item__textarea"
                  value={drafts[item._id] || ''}
                  onChange={(e) => onDraftChange(item._id, e.target.value)}
                  rows={4}
                  placeholder="Add a response or internal resolution note for this doctor."
                />

                <div className="admin-support-item__actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    disabled={savingId === item._id}
                    onClick={() => saveMessage(item._id, 'Open')}
                  >
                    Keep Open
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    disabled={savingId === item._id}
                    onClick={() => saveMessage(item._id, 'Resolved')}
                  >
                    <Send size={14} />
                    <span>{savingId === item._id ? 'Saving...' : 'Mark Resolved'}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportMessagesTab;
