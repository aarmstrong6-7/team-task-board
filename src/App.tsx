import { useEffect, useMemo, useState } from "react";
import type { FilterMode, Task, TaskInput } from "./types/task";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./api/fakeTaskApi";
import { filterTasks, searchTasks } from "./logic/taskFiltering";
import { sortTasksByPriority } from "./logic/taskSorting";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { TaskFilters } from "./components/TaskFilters";
import { TaskSearch } from "./components/TaskSearch";

type Banner = { type: "success" | "error"; text: string } | null;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [query, setQuery] = useState("");
  const [banner, setBanner] = useState<Banner>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTasks()
      .then((loaded) => {
        if (!cancelled) setTasks(loaded);
      })
      .catch(() => {
        if (!cancelled) {
          setBanner({ type: "error", text: "Failed to load tasks." });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(id);
  }, [banner]);

  async function handleCreate(input: TaskInput) {
    setBusy(true);
    try {
      const created = await createTask(input);
      setTasks((prev) => [...prev, created]);
      setBanner({ type: "success", text: "Task added." });
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: "Failed to add task." });
    } finally {
      setBusy(false);
    }
  }

  async function handleEdit(id: string, updates: Partial<Task>) {
    setBusy(true);
    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setBanner({ type: "success", text: "Task updated." });
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: "Failed to update task." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    try {
      const remaining = await deleteTask(id);
      setTasks(remaining);
      setBanner({ type: "success", text: "Task deleted." });
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: "Failed to delete task." });
    } finally {
      setBusy(false);
    }
  }

  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filter);
    const searched = searchTasks(filtered, query);
    return sortTasksByPriority(searched);
  }, [tasks, filter, query]);

  return (
    <div className="app">
      <h1>Team Task Board</h1>
      <p className="subtitle">
        A small shared task list. Add, edit, prioritize, and complete work.
      </p>

      {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

      <div className="card">
        <TaskForm onCreate={handleCreate} disabled={busy} />
      </div>

      <div className="card">
        <div className="toolbar">
          <TaskFilters value={filter} onChange={setFilter} />
          <TaskSearch value={query} onChange={setQuery} />
        </div>
      </div>

      <TaskList
        tasks={visibleTasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
