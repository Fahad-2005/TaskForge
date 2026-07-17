import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import './TaskActivityDrawer.css';

function formatTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function TaskActivityDrawer({ task, workspaceId, onClose, onEdit }) {
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = currentUser.id || currentUser._id;

  const loadDrawer = useCallback(async () => {
    if (!task?._id) return;
    setLoading(true);
    setError('');
    try {
      const [commentData, activityData] = await Promise.all([
        apiFetch(`/comments/task/${task._id}`),
        apiFetch(`/activities/task/${task._id}`),
      ]);
      setComments(commentData);
      setActivities(activityData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [task._id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadDrawer();
  }, [loadDrawer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useWorkspaceSocket(workspaceId, {
    'comment:created': (comment) => {
      if (String(comment.task) !== task._id) return;
      setComments((current) =>
        current.some((item) => item._id === comment._id) ? current : [...current, comment]
      );
    },
    'comment:deleted': ({ _id, task: taskId }) => {
      if (String(taskId) === task._id) {
        setComments((current) => current.filter((item) => item._id !== _id));
      }
    },
    'activity:created': (activity) => {
      if (String(activity.task) !== task._id) return;
      setActivities((current) =>
        current.some((item) => item._id === activity._id) ? current : [activity, ...current]
      );
    },
    connect: loadDrawer,
  });

  const submitComment = async (event) => {
    event.preventDefault();
    const body = commentBody.trim();
    if (!body) return;
    setSubmitting(true);
    setError('');
    try {
      const comment = await apiFetch(`/comments/task/${task._id}`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      setComments((current) =>
        current.some((item) => item._id === comment._id) ? current : [...current, comment]
      );
      setCommentBody('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      setComments((current) => current.filter((item) => item._id !== commentId));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="task-drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="task-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Task activity for ${task.title}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="task-drawer-header">
          <div>
            <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
            <h2>{task.title}</h2>
            <p>{task.description || 'No description provided.'}</p>
          </div>
          <div className="task-drawer-header-actions">
            <button type="button" className="task-drawer-edit" onClick={() => onEdit(task)}>Edit</button>
            <button type="button" className="task-drawer-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </header>

        <div className="task-drawer-summary">
          <span><strong>Status</strong>{task.status}</span>
          <span><strong>Start</strong>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}</span>
          <span><strong>Due</strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
        </div>

        {error && <div className="task-drawer-error">{error}</div>}

        <div className="task-drawer-content">
          <section className="task-drawer-section">
            <div className="task-drawer-section-title">
              <h3>Comments</h3>
              <span>{comments.length}</span>
            </div>

            <form className="comment-composer" onSubmit={submitComment}>
              <textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Write an update for your team..."
                rows="3"
                maxLength="2000"
              />
              <button type="submit" className="btn-primary" disabled={submitting || !commentBody.trim()}>
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </form>

            {loading ? (
              <p className="task-drawer-empty">Loading conversation...</p>
            ) : comments.length === 0 ? (
              <p className="task-drawer-empty">No comments yet. Start the conversation.</p>
            ) : (
              <div className="comment-thread">
                {comments.map((comment) => (
                  <article className="comment-item" key={comment._id}>
                    <div className="comment-avatar">{comment.author?.name?.charAt(0).toUpperCase() || '?'}</div>
                    <div className="comment-main">
                      <div className="comment-meta">
                        <strong>{comment.author?.name || 'Unknown user'}</strong>
                        <span>{formatTime(comment.createdAt)}</span>
                        {String(comment.author?._id) === String(currentUserId) && (
                          <button type="button" onClick={() => deleteComment(comment._id)}>Delete</button>
                        )}
                      </div>
                      <p>{comment.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="task-drawer-section">
            <div className="task-drawer-section-title">
              <h3>Activity</h3>
              <span>{activities.length}</span>
            </div>
            {loading ? (
              <p className="task-drawer-empty">Loading activity...</p>
            ) : activities.length === 0 ? (
              <p className="task-drawer-empty">No activity recorded yet.</p>
            ) : (
              <div className="activity-feed">
                {activities.map((activity) => (
                  <div className="activity-item" key={activity._id}>
                    <span className="activity-dot" />
                    <div>
                      <p><strong>{activity.actor?.name || 'Someone'}</strong> {activity.message}</p>
                      <time>{formatTime(activity.createdAt)}</time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

export default TaskActivityDrawer;
