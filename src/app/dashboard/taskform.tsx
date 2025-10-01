"use client";

import { useState } from "react";
import { createTask } from "@/app/actions/task-actions";
import type { Task } from "@/db/schema";

interface TaskFormProps {
  onTaskCreated?: (newTask: Task) => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newTask = await createTask({ title, dueDate, priority });
      setTitle(""); 

      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Could not create task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="border p-2 rounded w-full"
          disabled={loading}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
          className="border p-2 rounded"
        >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 "
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
