"use client";

import { useState } from "react";
import TaskForm from "./taskform";
import TaskItem from "./task-item";
import { Task } from "@/db/schema";

type ClientDashboardProps = {
  ownedTasks: Task[];
  collabTasks: { tasks: Task }[];
};


export default function ClientDashboard({ ownedTasks, collabTasks }: ClientDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(ownedTasks);

  function handleTaskCreated(newTask: Task) {
    setTasks((prev) => [...prev, newTask]); 
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks((prev: Task[]) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }

  function handleTaskDeleted(taskId: number) {
    setTasks((prev: Task[]) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <TaskForm onTaskCreated={handleTaskCreated} />

      <section className="mt-6">
        <h2 className="font-semibold text-xl mb-2">Your Tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskUpdatedAction={handleTaskUpdated}
              onTaskDeletedAction={handleTaskDeleted}
            />
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-xl mb-2">Collaborating Tasks</h2>
        <ul className="space-y-2">
          {collabTasks.map(({ tasks: task }) => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskUpdatedAction={handleTaskUpdated}
              onTaskDeletedAction={handleTaskDeleted}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}