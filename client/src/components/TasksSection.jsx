import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Skeleton from './Skeleton';
import Alert from './Alert';
import Modal from './Modal';
import { Plus, Check, Edit2, Trash2, Calendar } from 'lucide-react';

const TasksSection = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.tasks.list();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    setNotification('');
    setIsSubmitting(true);
    try {
      const newTask = await api.tasks.create({
        title,
        description,
        dueDate,
      });
      setTasks((prev) => [newTask, ...prev]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setNotification('Task created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setError('');
    setNotification('');
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
    try {
      await api.tasks.update(task._id, { isCompleted: !task.isCompleted });
    } catch (err) {
      setTasks(originalTasks);
      setError(err.message || 'Failed to update completeness status.');
    }
  };

  const handleEditClick = (task) => {
    setEditId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setError('');
    setNotification('');
    setIsSubmitting(true);
    try {
      const updated = await api.tasks.update(editId, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
      });
      setTasks((prev) => prev.map((t) => (t._id === editId ? updated : t)));
      setIsEditOpen(false);
      setNotification('Task updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setNotification('');
    try {
      await api.tasks.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setNotification('Task deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="dashboard-card" style={{ padding: '24px' }}>
      <h3 className="dashboard-card-title" style={{ marginBottom: '16px' }}>
        <span>Personal Task Planner</span>
      </h3>

      {error && <Alert type="error" message={error} style={{ marginBottom: '16px' }} />}
      {notification && <Alert type="success" message={notification} style={{ marginBottom: '16px' }} />}

      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="Task Title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div>
          <textarea
            placeholder="Task Description"
            className="form-input"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            style={{ resize: 'vertical' }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={isSubmitting}
        >
          <Plus size={16} /> Add Task
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton height="80px" />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
              No tasks scheduled. Create one above to get started.
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '16px',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: task.isCompleted ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  opacity: task.isCompleted ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleComplete(task)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '2px solid var(--color-primary)',
                        backgroundColor: task.isCompleted ? 'var(--color-primary)' : 'transparent',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {task.isCompleted && <Check size={14} />}
                    </button>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        color: task.isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                      }}
                    >
                      {task.title}
                    </h4>
                  </div>
                  {task.description && (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginTop: '6px',
                        marginLeft: '28px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '8px',
                        marginLeft: '28px',
                      }}
                    >
                      <Calendar size={12} />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(task)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task" size="md">
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={isSubmitting}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksSection;
