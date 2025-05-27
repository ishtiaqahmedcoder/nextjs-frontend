'use client';

import { useEffect, useState } from 'react';
import { getTasks, createTask, deleteTask } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const defaultForm = {
  title: '',
  description: '',
  status: 'todo',
  due_date: '',
};

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ ...defaultForm });
  const [editId, setEditId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

  const loadTasks = async (page = 1) => {
    try {
      const res = await getTasks(page);
      setTasks(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
      });
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openModal = (task: any = null) => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        due_date: task.due_date || '',
      });
      setEditId(task.id);
    } else {
      setForm({ ...defaultForm });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setForm({ ...defaultForm });
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId !== null) {
        await fetch(`http://127.0.0.1:8000/api/tasks/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(form),
        });
        toast.success('Task updated');
      } else {
        await createTask(form);
        toast.success('Task created');
      }
      closeModal();
      loadTasks(pagination.current_page);
    } catch (err) {
      toast.error('Failed to submit task');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      loadTasks(pagination.current_page);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📝 Task Dashboard</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow"
          >
            <Plus size={18} /> Add Task
          </button>
        </div>

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full max-w-sm border px-4 py-2 rounded-md shadow-sm"
        />

        <div className="grid gap-4">
          {tasks
            .filter((task: any) =>
              task.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((task: any) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{task.title}</h2>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <div className="text-xs text-gray-400 mt-1">Status: {task.status}</div>
                    <div className="text-xs text-gray-400">Due: {task.due_date || '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(task)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => loadTasks(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            onClick={() => loadTasks(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">
                {editId ? 'Edit Task' : 'Add Task'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border px-3 py-2 rounded-md"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
