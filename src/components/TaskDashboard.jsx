import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    color: '#3B82F6',
    collaborators: [],
    checklist: []
  });

  // Get user from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error('Failed to parse user data:', err);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token available for fetching tasks');
        return;
      }
      setLoading(true);
      const response = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 500); // Delay to ensure auth is ready
    return () => clearTimeout(timer);
  }, []);

  // Filter tasks by status
  const getFilteredTasks = () => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.status === activeTab);
  };

  // Calculate task status
  const calculateStatus = (dueDate) => {
    if (!dueDate) return 'upcoming';
    const now = new Date();
    const due = new Date(dueDate);
    return due < now ? 'overdue' : 'upcoming';
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle color change
  const handleColorChange = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Add collaborator
  const addCollaborator = () => {
    setFormData(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, { userId: '', name: '', email: '', avatar: '' }]
    }));
  };

  // Update collaborator
  const updateCollaborator = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
  };

  // Remove collaborator
  const removeCollaborator = (index) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }));
  };

  // Add checklist item
  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { title: '', completed: false }]
    }));
  };

  // Update checklist item
  const updateChecklistItem = (index, value) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => 
        i === index ? { ...item, title: value } : item
      )
    }));
  };

  // Remove checklist item
  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }

      const payload = {
        ...formData,
        userId: user?.id || user?.userId,
        status: calculateStatus(formData.dueDate) || 'upcoming'
      };

      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/tasks', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowCreateModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        color: '#3B82F6',
        collaborators: [],
        checklist: []
      });
      setError(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
      setError(err.response?.data?.error || 'Failed to save task');
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'medium',
      color: task.color || '#3B82F6',
      collaborators: task.collaborators || [],
      checklist: task.checklist || []
    });
    setShowCreateModal(true);
  };

  // Delete task
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }
      await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const filteredTasks = getFilteredTasks();
  const priorityColors = {
    low: '#10B981',
    medium: '#3B82F6',
    high: '#EF4444'
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                color: '#3B82F6',
                collaborators: [],
                checklist: []
              });
              setShowCreateModal(true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Task
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['upcoming', 'in-progress', 'overdue', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
              {tab === 'overdue' && tasks.filter(task => task.status === tab).length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  {tasks.filter(task => task.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        )}

        {/* Task Cards Grid */}
        {!loading && filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <div
                key={task._id}
                className="rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                style={{ borderLeft: `4px solid ${task.color || '#3B82F6'}` }}
              >
                <div className="p-5 bg-white">
                  {/* Card header with actions */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {task.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Due date */}
                  {task.dueDate && (
                    <div className="mb-3 text-sm">
                      <span className="text-gray-600">Due: </span>
                      <span className="font-medium text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Priority badge */}
                  <div className="mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: priorityColors[task.priority] || priorityColors.medium }}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Collaborators */}
                  {task.collaborators && task.collaborators.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Collaborators:</p>
                      <div className="flex -space-x-2">
                        {task.collaborators.map((collab, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                            title={collab.name}
                          >
                            {collab.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checklist */}
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Checklist:</p>
                      <div className="space-y-1">
                        {task.checklist.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={item.completed || false}
                              onChange={(e) => {
                                // Handle checklist item toggle
                              }}
                              className="w-4 h-4"
                            />
                            <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No {activeTab} tasks yet</p>
          </div>
        ) : null}
      </div>

      {/* Create/Edit Task Modal */}
      {showCreateModal && (
        <TaskModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
          formData={formData}
          handleInputChange={handleInputChange}
          handleColorChange={handleColorChange}
          addCollaborator={addCollaborator}
          updateCollaborator={updateCollaborator}
          removeCollaborator={removeCollaborator}
          addChecklistItem={addChecklistItem}
          updateChecklistItem={updateChecklistItem}
          removeChecklistItem={removeChecklistItem}
          handleSubmit={handleSubmit}
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
};

const TaskModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleColorChange,
  addCollaborator,
  updateCollaborator,
  removeCollaborator,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  handleSubmit,
  isEditing
}) => {
  if (!isOpen) return null;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Color
            </label>
            <div className="flex gap-3">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Collaborators */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Collaborators
              </label>
              <button
                type="button"
                onClick={addCollaborator}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.collaborators.map((collab, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={collab.name}
                    onChange={(e) => updateCollaborator(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={collab.email}
                    onChange={(e) => updateCollaborator(idx, 'email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeCollaborator(idx)}
                    className="text-red-600 hover:text-red-700 text-sm px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Checklist Items
              </label>
              <button
                type="button"
                onClick={addChecklistItem}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {formData.checklist.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Checklist item"
                    value={item.title}
                    onChange={(e) => updateChecklistItem(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(idx)}
                    className="text-red-600 hover:text-red-700 text-sm px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDashboard;
