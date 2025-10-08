'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { todoService, Todo } from '@/lib/todos';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Check, X, Trash2, Edit2, LogOut, Settings, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await todoService.getUserTodos(user.id);
      setTodos(response.todos);
    } catch (error) {
      toast.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    try {
      const todo = await todoService.createTodo(newTodo, user.id);
      setTodos([todo, ...todos]);
      setNewTodo('');
      toast.success('Todo added successfully');
    } catch (error) {
      toast.error('Failed to add todo');
    }
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const updated = await todoService.updateTodo(id, { completed: !completed });
      setTodos(todos.map(todo => todo.id === id ? updated : todo));
      toast.success(completed ? 'Todo marked as incomplete' : 'Todo completed!');
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      toast.success('Todo deleted');
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const handleEditTodo = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editingId === null) return;

    try {
      const updated = await todoService.updateTodo(editingId, { todo: editText });
      setTodos(todos.map(todo => todo.id === editingId ? updated : todo));
      setEditingId(null);
      setEditText('');
      toast.success('Todo updated');
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">Todo Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User size={20} />
                  <span className="hidden sm:inline">{user?.firstName} {user?.lastName}</span>
                </div>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-800 transition"
                  title="Settings"
                >
                  <Settings size={20} />
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
                  title="Logout"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </div>

          {/* Add Todo Form */}
          <div className="bg-white rounded-lg shadow mb-6">
            <form onSubmit={handleAddTodo} className="p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Task
                </button>
              </div>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  filter === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  filter === 'active'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  filter === 'completed'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {filter === 'all' ? 'No tasks yet. Create your first task!' : `No ${filter} tasks`}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTodos.map((todo) => (
                  <li key={todo.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTodo(todo.id, todo.completed)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          todo.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {todo.completed && <Check size={16} className="text-white" />}
                      </button>
                      
                      {editingId === todo.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`flex-1 ${
                              todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                            }`}
                          >
                            {todo.todo}
                          </span>
                          <button
                            onClick={() => handleEditTodo(todo.id, todo.todo)}
                            className="text-blue-600 hover:text-blue-700 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
