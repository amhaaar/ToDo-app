import { db } from "@/db";
import { tasks, taskCollaborators, Task } from "@/db/schema";
import { getServerSession } from "@/lib/get-session";
import TaskForm from "./taskform";
import TaskItem from "./task-item";
import { eq } from "drizzle-orm";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session || !session.user?.id) {
    return <p className="p-6">Please log in to see your dashboard.</p>;
  }

  const userId = session.user.id;

  // Owned tasks
  const ownedTasks: Task[] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.ownerId, userId));

  // Collaborator tasks (map to { tasks: Task } shape)
  const collabTasksRaw = await db
    .select()
    .from(tasks)
    .innerJoin(taskCollaborators, eq(taskCollaborators.taskId, tasks.id))
    .where(eq(taskCollaborators.userId, userId));

  const collabTasks: { tasks: Task }[] = collabTasksRaw.map((row) => ({
    tasks: row.tasks,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <TaskForm />

      <section className="mt-6">
        <h2 className="font-semibold text-xl mb-2">Your Tasks</h2>
        <ul className="space-y-2 grid grid-cols-2 gap-4">
          {ownedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-xl mb-2">Collaborating Tasks</h2>
        <ul className="space-y-2 grid grid-cols-2 gap-4">
          {collabTasks.map(({ tasks }) => (
            <TaskItem key={tasks.id} task={tasks} />
          ))}
        </ul>
      </section>
    </div>
  );
}
