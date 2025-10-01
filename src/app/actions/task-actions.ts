"use server";
import { db } from "@/db";
import { tasks, taskCollaborators, user } from "@/db/schema";
import { getServerSession } from "@/lib/get-session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";



export async function createTask({ title, dueDate, priority }: { title: string; dueDate?: string; priority?: "low" | "medium" | "high" }) {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;
  const dueDateValue = dueDate ? new Date(dueDate) : null;

  const [newTask] = await db
    .insert(tasks)
    .values({
      title,
      ownerId: userId,
      status: "todo",
      dueDate: dueDateValue,
      priority: priority ?? "low", // default if not provided
    })
    .returning();

  return newTask;
}


// Update task status
export async function updateTaskStatus({
  taskId,
  status,
}: {
  taskId: number;
  status: string;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  // Only owner or collaborator can update
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task) throw new Error("Task not found");

  if (task.ownerId !== userId) {
    // check if collaborator
    const [collab] = await db
      .select()
      .from(taskCollaborators)
      .where(
        and(eq(taskCollaborators.taskId, taskId), eq(taskCollaborators.userId, userId))
      )
      .limit(1);

    if (!collab) throw new Error("Not authorized");
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({ status })
    .where(eq(tasks.id, taskId))
    .returning();

  return updatedTask;
}

// Edit task title
export async function editTask({ taskId, title, dueDate, priority,}: {taskId: number; title?: string; dueDate?: string; priority?: "low" | "medium" | "high";
}) {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task || task.ownerId !== userId) throw new Error("Not authorized");

  const dueDateValue = dueDate ? new Date(dueDate) : null;

  const [updatedTask] = await db
    .update(tasks)
    .set({
      ...(title !== undefined && { title }),
      dueDate: dueDateValue,
      priority: priority ?? task.priority,
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return updatedTask;
}



// Add collaborator by email
export async function addCollaborator({
  taskId,
  email,
}: {
  taskId: number;
  email: string;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  // Only owner can add collaborators
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task || task.ownerId !== userId) throw new Error("Not authorized");

  // Find user by email
  const [collabUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!collabUser) throw new Error("User not found");

  // Insert into taskCollaborators (ignore duplicates)
  await db
    .insert(taskCollaborators)
    .values({ taskId, userId: collabUser.id, role: "collaborator" })
    .onConflictDoNothing(); // prevents duplicate collaborators

  // Return task + collaborator info
  return {
    ...task,
    collaborator: { id: collabUser.id, email: collabUser.email },
  };
}


export async function toggleTaskComplete({ taskId, isCompleted }: { taskId: number; isCompleted: boolean }) {
  await db.update(tasks).set({ isCompleted }).where(eq(tasks.id, taskId));
  revalidatePath("/dashboard");
}

export async function deleteTask({ taskId }: { taskId: number }) {
  await db.delete(tasks).where(eq(tasks.id, taskId));
  return { success: true };
}