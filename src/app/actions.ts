'use server';

import { firestore } from '../lib/firebase';
import { admin } from '../lib/firebaseAdmin';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { TaskStatus } from './components/TaskCard';
import { getGeminiResponse } from '../lib/gemini';

// --- Действия для администратора ---

/**
 * Получает всех пользователей из Firebase Auth и их роли из Firestore.
 */
export async function getAllUsers() {
    try {
        const authUsers = await admin.auth().listUsers();
        const usersWithRoles = await Promise.all(authUsers.users.map(async (user) => {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            const role = userDoc.exists() ? userDoc.data().role : 'no-role';
            return {
                uid: user.uid,
                email: user.email,
                role: role,
                disabled: user.disabled,
                lastSignInTime: user.metadata.lastSignInTime,
            };
        }));
        return { success: true, users: usersWithRoles };
    } catch (error: unknown) {
        console.error("Error getting all users:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Обновляет роль пользователя в Firestore.
 */
export async function updateUserRole(uid: string, newRole: string) {
    try {
        const userDocRef = doc(firestore, 'users', uid);
        await updateDoc(userDocRef, { role: newRole });
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating user role:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Включает или отключает пользователя в Firebase Auth.
 */
export async function toggleUserStatus(uid: string, disabled: boolean) {
    try {
        await admin.auth().updateUser(uid, { disabled });
        return { success: true };
    } catch (error: unknown) {
        console.error("Error toggling user status:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}


// --- Действия для логирования --- 
type ActivityStatus = 'success' | 'info' | 'warning' | 'danger';
interface LogActivityOptions {
  user: string;
  action: string;
  status: ActivityStatus;
}
export async function logActivity(options: LogActivityOptions) {
  try {
    await addDoc(collection(firestore, 'activity_log'), {
      user: options.user,
      action: options.action,
      status: options.status,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to log activity." };
  }
}

// --- Действие для обновления статуса задачи ---
export async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
  try {
    const taskRef = doc(firestore, 'tasks', taskId);
    await updateDoc(taskRef, { status: newStatus });
    await logActivity({
        user: 'Система (Водитель)',
        action: `Задача ${taskId} теперь в статусе '${newStatus}'`,
        status: 'info'
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update task status." };
  }
}

// --- Действие для создания задачи ---
interface CreateTaskOptions {
    title: string;
    description: string;
    assignedTo: string; 
    assignedBy: string;
    priority?: 'low' | 'medium' | 'high';
}
export async function createTask(options: CreateTaskOptions) {
    try {
        await addDoc(collection(firestore, 'tasks'), {
            title: options.title,
            description: options.description,
            assignedTo: options.assignedTo,
            status: 'pending', 
            priority: options.priority || 'medium',
            createdAt: serverTimestamp(),
        });

        await logActivity({
            user: options.assignedBy,
            action: `Создана новая задача: "${options.title}"`,
            status: 'success'
        });

        return { success: true };
    } catch {
        return { success: false, error: "Failed to create task." };
    }
}

// --- Новое действие для получения списка водителей ---
export async function getDrivers() {
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('role', '==', 'driver'));
        const querySnapshot = await getDocs(q);
        
        const drivers = querySnapshot.docs.map(doc => ({
            uid: doc.id,
            email: doc.data().email, // Предполагаем, что у водителя есть email
        }));

        return { success: true, drivers };
    } catch (error: unknown) {
        console.error("Error getting drivers: ", error);
        return { success: false, error: "Failed to get drivers.", drivers: [] };
    }
}

/**
 * Вызывает Gemini API с заданным промптом.
 */
export async function queryGemini(prompt: string) {
    return await getGeminiResponse(prompt);
}
