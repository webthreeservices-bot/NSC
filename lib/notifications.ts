// Notification logic for users and admins
import { create } from '@/lib/db-queries'

export async function notifyUser(userId: string, title: string, message: string, type: string = 'INFO') {
  await create('Notification', {
    data: {
      id: crypto.randomUUID(),
      userId,
      title,
      message,
      type,
      createdAt: new Date(),
      read: false,
    },
  })
}

export async function notifyAdmin(title: string, message: string, type: string = 'INFO') {
  // You can extend this to notify all admins or a specific admin
  await create('Notification', {
    data: {
      id: crypto.randomUUID(),
      userId: null,
      title,
      message,
      type,
      createdAt: new Date(),
      read: false,
    },
  })
}
