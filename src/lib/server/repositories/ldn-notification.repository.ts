// src/lib/server/repositories/ldn-notification.repository.ts

import { prisma } from '$lib/server/configurations/prisma.config';
import type { LDNNotification } from '@prisma/client';

type CreateLDNNotificationData = Omit<
    LDNNotification,
    'id' | 'created_at' | 'delivered_at'
>;

export const LDNNotificationRepository = {
    /**
     * Creates a new LDN notification record (e.g. after attempting delivery).
     */
    create: (data: CreateLDNNotificationData): Promise<LDNNotification> =>
        prisma.lDNNotification.create({
            data: {
                ...data,
                // Ensure delivered_at is set only if delivered
                delivered_at: data.delivered ? new Date() : null
            }
        }),

    /**
     * Retrieves all notifications for a specific dataset (for debugging/audit).
     */
    getByDatasetId: (dataset_id: string): Promise<LDNNotification[]> =>
        prisma.lDNNotification.findMany({
            where: { dataset_id },
            orderBy: { created_at: 'desc' }
        }),

    /**
     * Marks a notification as delivered (e.g. after retry).
     */
    markAsDelivered: (id: string): Promise<LDNNotification> =>
        prisma.lDNNotification.update({
            where: { id },
            data: {
                delivered: true,
                delivered_at: new Date()
            }
        }),

    /**
     * Returns undelivered notifications (for retry logic).
     */
    getUndelivered: (): Promise<LDNNotification[]> =>
        prisma.lDNNotification.findMany({
            where: { delivered: false },
            orderBy: { created_at: 'asc' }
        })
};
