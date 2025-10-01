"use client";

import { useState } from "react";
import {updateTaskStatus, editTask, addCollaborator, deleteTask} from "@/app/actions/task-actions";
import { Task } from "@/db/schema";

type TaskItemProps = {
  task: Task;
  onTaskUpdatedAction?: (task: Task) => void;
  onTaskDeletedAction?: (taskId: number) => void;
};

export default function TaskItem({
  task,
  onTaskUpdatedAction,
  onTaskDeletedAction,
}: TaskItemProps) {
  const [title, setTitle] = useState(task.title);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.toISOString().split("T")[0] : "");
  const [priority, setPriority] = useState<Task["priority"]>((task.priority ?? "medium")as "low" | "medium" | "high");
  const [collabEmail, setCollabEmail] = useState("");

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Task["status"];
    try {
      const updatedTask = await updateTaskStatus({
        taskId: task.id,
        status: newStatus,
      });
      setStatus(newStatus);
      onTaskUpdatedAction?.(updatedTask);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function handleSave() {
    try {
      const updatedTask = await editTask({
        taskId: task.id,
        title,
        dueDate,
        priority: priority as "low" | "medium" | "high",
      });
      setEditing(false);
      onTaskUpdatedAction?.(updatedTask);
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  }

  async function handleAddCollaborator() {
    if (!collabEmail.trim()) return;
    try {
      await addCollaborator({ taskId: task.id, email: collabEmail });
      setCollabEmail("");
      alert("Collaborator added!");
    } catch (err) {
      console.error("Failed to add collaborator:", err);
    }
  }

  async function handleDelete() {
    try {
      await deleteTask({ taskId: task.id });
      onTaskDeletedAction?.(task.id);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  return (
    <li className="p-2 border rounded flex flex-col gap-2">
      <div className="capitalize flex justify-between items-center">
        {editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-1  rounded flex-1 "
            />
            <button
              onClick={handleSave}
              className="bg-green-500 text-white p-1 rounded ml-2"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <span>{title}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-400"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white p-1 rounded hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={status}
          onChange={handleStatusChange}
          className="border p-1 rounded "
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {editing && (
          <>
            <input
              type="date"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-1 rounded"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="border p-1 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </>
        )}

        <input
          value={collabEmail}
          onChange={(e) => setCollabEmail(e.target.value)}
          placeholder="Add collaborator email"
          className="border p-1 rounded flex-1 "
        />
        <button
          onClick={handleAddCollaborator}
          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-400"
        >
          Add
        </button>
      </div>

      {!editing && (
        <div className="capitalize flex gap-4 text-sm text-black-600 ">
          <span>Due: {dueDate || "None"}</span>
          <span>Priority: {priority}</span>
        </div>
      )}
    </li>
  );
}
