import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, ListTodo, Plus, Trash2 } from 'lucide-react';

const priorities = ['Low', 'Medium', 'High'];

const getToday = () => {
  const today = new Date();
  const localOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - localOffset).toISOString().slice(0, 10);
};

const isTaskList = (value) => (
  Array.isArray(value) &&
  value.every((task) => (
    task &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    priorities.includes(task.priority) &&
    (task.dueDate === '' || typeof task.dueDate === 'string')
  ))
);

export default function TaskList({ userId }) {
  const storageKey = userId ? `routine-track-tasks:${userId}` : null;
  const [tasks, setTasks] = useState([]);
  const [loadedStorageKey, setLoadedStorageKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('All');
  const storageReady = Boolean(storageKey && loadedStorageKey === storageKey);

  useEffect(() => {
    setTasks([]);
    setLoadedStorageKey(null);
    setErrorMessage('');

    if (!storageKey) return;

    try {
      const savedTasks = window.localStorage.getItem(storageKey);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (!isTaskList(parsedTasks)) {
          throw new Error('Saved tasks have an unexpected format.');
        }
        setTasks(parsedTasks);
      }
      setLoadedStorageKey(storageKey);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setErrorMessage('Could not load your saved tasks. Your browser storage may be unavailable or the saved data may be invalid.');
    }
  }, [storageKey]);

  const saveTasks = (updatedTasks) => {
    if (!storageKey || !storageReady) return false;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      setErrorMessage('');
      return true;
    } catch (error) {
      console.error('Failed to save tasks:', error);
      setErrorMessage('Could not save your task. Check that browser storage is available and try again.');
      return false;
    }
  };

  const visibleTasks = useMemo(() => {
    const filteredTasks = tasks.filter((task) => {
      if (filter === 'Active') return !task.completed;
      if (filter === 'Completed') return task.completed;
      return true;
    });

    return filteredTasks.sort((first, second) => {
      if (first.completed !== second.completed) return Number(first.completed) - Number(second.completed);
      if (!first.dueDate) return second.dueDate ? 1 : 0;
      if (!second.dueDate) return -1;
      return first.dueDate.localeCompare(second.dueDate);
    });
  }, [filter, tasks]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !storageReady) return;

    const saved = saveTasks([
      {
        id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: trimmedTitle,
        priority,
        dueDate,
        completed: false
      },
      ...tasks
    ]);

    if (saved) {
      setTitle('');
      setPriority('Medium');
      setDueDate('');
    }
  };

  const toggleTask = (taskId) => {
    saveTasks(tasks.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )));
  };

  const deleteTask = (taskId) => {
    saveTasks(tasks.filter((task) => task.id !== taskId));
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const today = getToday();

  return (
    <section className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-indigo-400" />
            Today&apos;s Tasks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800" aria-label="Filter tasks">
          {['All', 'Active', 'Completed'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition ${
                filter === option ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
        <label className="sm:col-span-5">
          <span className="sr-only">Task title</span>
          <input
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task..."
            disabled={!storageReady}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="sr-only">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            disabled={!storageReady}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          >
            {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="sm:col-span-3">
          <span className="sr-only">Due date</span>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={!storageReady}
            aria-label="Due date"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </label>
        <button
          type="submit"
          disabled={!storageReady || !title.trim()}
          className="sm:col-span-2 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl px-3 py-2.5 transition"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {!storageReady ? (
        <p className="text-center py-6 text-xs text-slate-500">
          {storageKey ? 'Loading your tasks...' : 'Waiting for your account details...'}
        </p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-center py-6 text-xs text-slate-500">
          {tasks.length === 0 ? 'No tasks yet. Add one to get started.' : `No ${filter.toLowerCase()} tasks.`}
        </p>
      ) : (
        <ul className="divide-y divide-slate-800/70">
          {visibleTasks.map((task) => {
            const isOverdue = task.dueDate && task.dueDate < today && !task.completed;
            const priorityStyle = {
              High: 'text-rose-400 bg-rose-500/10',
              Medium: 'text-amber-400 bg-amber-500/10',
              Low: 'text-slate-400 bg-slate-800'
            }[task.priority];

            return (
              <li key={task.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}
                  className="mt-0.5 shrink-0 text-slate-500 hover:text-indigo-400 transition"
                >
                  {task.completed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    : <span className="block w-4 h-4 rounded-full border border-slate-600" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs break-words ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityStyle}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
                        <CalendarDays className="w-3 h-3" />
                        {isOverdue ? 'Overdue · ' : 'Due '}
                        {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                  className="shrink-0 text-slate-600 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
