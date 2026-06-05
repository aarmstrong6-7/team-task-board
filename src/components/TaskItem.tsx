import { useState } from "react";
import type { Task, TaskPriority } from "../types/task";
import { validateTaskInput } from "../logic/taskValidation";

type Props = {
  task: Task;
  onEdit: (id: string, updates: Partial<Task>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
};

export function TaskItem({ task, onEdit, onDelete }: Props) {
  const [completed, setCompleted] = useState(task.completed);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftPriority, setDraftPriority] = useState<TaskPriority>(
    task.priority
  );
  const [draftDue, setDraftDue] = useState<string>(task.dueDate ?? "");
  const [editError, setEditError] = useState<string | null>(null);

  function handleToggle() {
    setCompleted((prev) => !prev);
    // await onEdit(task.id, { completed: !completed });

  async function handleSaveEdit() {
    setEditError(null);
    const result = validateTaskInput({
      title: draftTitle,
      priority: draftPriority,
      dueDate: draftDue || null,
    });
    if (!result.valid) {
      setEditError(result.error);
      return;
    }
    await onEdit(task.id, {
      title: draftTitle,
      priority: draftPriority,
      dueDate: draftDue || null,
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setDraftTitle(task.title);
    setDraftPriority(task.priority);
    setDraftDue(task.dueDate ?? "");
    setEditError(null);
    setIsEditing(false);
  }

  return (
    <li className={`task-item ${completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        aria-label={`Mark ${task.title} ${completed ? "incomplete" : "complete"}`}
      />
      <div>
        <div className="title">{task.title}</div>
        <div className="meta">
          {task.dueDate ? `Due ${task.dueDate}` : "No due date"}
        </div>
      </div>
      <span className={`priority ${task.priority}`}>{task.priority}</span>
      <button type="button" onClick={() => setIsEditing((v) => !v)}>
        {isEditing ? "Close" : "Edit"}
      </button>
      <button
        type="button"
        className="danger"
        onClick={() => onDelete(task.id)}
      >
        Delete
      </button>
      {isEditing && (
        <div className="edit-row">
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            aria-label="Edit title"
          />
          <select
            value={draftPriority}
            onChange={(e) => setDraftPriority(e.target.value as TaskPriority)}
            aria-label="Edit priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={draftDue}
            onChange={(e) => setDraftDue(e.target.value)}
            aria-label="Edit due date"
          />
          <button type="button" onClick={handleSaveEdit}>
            Save
          </button>
          <button type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
          {editError && (
            <div className="form-error" style={{ gridColumn: "1 / -1" }}>
              {editError}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
