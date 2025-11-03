import type { Dataset, Subscriber } from './types';

const LDN_CONTEXT = [
    'https://www.w3.org/ns/activitystreams',
    'https://www.w3.org/ns/ldn'
];

function createNotification(
    type: 'Create' | 'Update',
    dataset: Dataset,
    actor: string
) {
    return {
        '@context': LDN_CONTEXT,
        id: `${actor}/notifications/${Date.now()}`,
        type,
        actor,
        object: {
            id: dataset.id,
            type: 'dcat:Dataset',
            'dct:title': dataset.title,
            'dct:modified': dataset.modified
        },
        published: new Date().toISOString()
    };
}

async function sendToInbox(
    inboxUrl: string,
    notification: unknown,
    subscriberName: string
): Promise<void> {
    const TIMEOUT_MS = 5000; // 5 seconden
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
        res = await fetch(inboxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ld+json'
            },
            body: JSON.stringify(notification, null, 2),
            signal: controller.signal
        });

        if (!res.ok) {
            console.warn(
                `[LDN] ${subscriberName} responded with ${res.status} ${res.statusText}`
            );
        } else {
            console.log(`[LDN] Successfully notified ${subscriberName}`);
        }
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.error(
                `[LDN] Timeout (${TIMEOUT_MS}ms) while notifying ${subscriberName} at ${inboxUrl}`
            );
        } else {
            console.error(
                `[LDN] Failed to notify ${subscriberName} at ${inboxUrl}:`,
                err instanceof Error ? err.message : String(err)
            );
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function sendLDNCreate(
    dataset: Dataset,
    actor: string,
    subscribers: Subscriber[]
): Promise<void> {
    const notification = createNotification('Create', dataset, actor);

    // Gebruik Promise.allSettled of een for-loop om elke inbox afzonderlijk te proberen
    await Promise.allSettled(
        subscribers.map((sub) =>
            sendToInbox(sub.inboxUrl, notification, sub.name)
        )
    );
}

export async function sendLDNUpdate(
    dataset: Dataset,
    actor: string,
    subscribers: Subscriber[]
): Promise<void> {
    const notification = createNotification('Update', dataset, actor);

    await Promise.allSettled(
        subscribers.map((sub) =>
            sendToInbox(sub.inboxUrl, notification, sub.name)
        )
    );
}
