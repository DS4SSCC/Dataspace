// src/lib/server/repositories/ldn-notification.repository.ts

import { prisma } from '$lib/server/configurations/prisma.config';
import type {Application, LDNNotification} from '@prisma/client';

type CreateLDNNotificationData = Omit<
    LDNNotification,
    'id' | 'created_at' | 'delivered_at'
>;

export const LdnRepository = {
    /**
     * Creates a new LDN notification record (e.g. after attempting delivery).
     */
    create: (data: {

    }): Promise<LDNNotification> =>
        prisma.lDNNotification.create({
            data: {
                ...data,
                // Ensure delivered_at is set only if delivered
                delivered_at: data ? new Date() : null
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
        }),

    /**
     * Broadcasts an LDN notification to all active applications with a valid inbox_url.
     * Stores a delivery record for each attempt.
     * Never throws — failures are logged and recorded.
     */
    broadcast: async (
        dataset_id: string,
        notificationPayload: object,
        type: string
    ): Promise<void> => {
        // Fetch all active apps with an inbox URL
        const apps: Pick<Application, 'id' | 'name' | 'inbox_url'>[] =
            await prisma.application.findMany({
                where: {
                    is_active: true,
                    inbox_url: { not: null }
                },
                select: { id: true, name: true, inbox_url: true }
            });

        if (apps.length === 0) {
            console.debug('[LDN] No active applications with inbox URLs. Skipping broadcast.');
            return;
        }

        console.debug(`[LDN] Broadcasting to ${apps.length} application(s)...`);

        // Send notification to each app concurrently
        await Promise.allSettled(
            apps.map(async (app) => {
                const inboxUrl = app.inbox_url!;

                // Send notification (non-blocking, safe)
                const result = await LdnRepository.sendNotification(inboxUrl, notificationPayload);

                // Store attempt in DB
                await LdnRepository.create({
                    dataset_id,
                    content: notificationPayload as any, // Prisma.JsonObject
                    type,
                    delivered: result.success
                });

                if (!result.success) {
                    console.warn(
                        `[LDN] Failed to deliver to app "${app.name}" (${inboxUrl}): ${result.error}`
                    );
                }
            })
        );

        console.debug(`[LDN] Broadcast completed.`);
    },


    sendNotification: async (inboxUrl: string, notification: object, timeout: number = 5000)=> {
        const timestamp = new Date();

        // Serialize payload
        let body: string;
        try {
            body = JSON.stringify(notification);
        } catch (err) {
            return {
                success: false,
                error: `Failed to serialize notification: ${(err as Error).message}`,
                timestamp
            };
        }

        // Set timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(inboxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/ld+json'
                },
                body,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return {
                    success: true,
                    status: response.status,
                    timestamp
                };
            } else {
                return {
                    success: false,
                    status: response.status,
                    error: `HTTP ${response.status} ${response.statusText}`,
                    timestamp
                };
            }
        } catch (err: any) {
            clearTimeout(timeoutId);

            let errorMsg = err.message || 'Unknown error';
            if (err.name === 'AbortError') {
                errorMsg = 'Request timed out (5s)';
            }

            // Log for debugging (non-blocking)
            console.warn(`[LDN] Delivery failed to ${inboxUrl}:`, errorMsg);

            return {
                success: false,
                error: errorMsg,
                timestamp
            };
        }
    }
};
