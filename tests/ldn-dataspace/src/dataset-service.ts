// src/dataset-service.ts
import type { Dataset, Subscriber } from './types';
import { sendLDNCreate, sendLDNUpdate } from './ldn-sender.js';

const subscribers: Subscriber[] = [
    { name: 'Alpha', inboxUrl: 'https://alpha.example/inbox' },
    { name: 'Test', inboxUrl: 'http://localhost:3001/inbox' }
];

const actorId = 'https://your-dataspace.example';
const datasetStore = new Map<string, Dataset>();

export async function addDataset(dataset: Dataset): Promise<void> {
    // Eerst opslaan (kritieke operatie)
    datasetStore.set(dataset.id, { ...dataset });
    console.log(`[Dataset] Added ${dataset.id}`);

    // Dan notificatie (best-effort, non-blocking)
    // Geen await nodig als je niet hoeft te wachten — maar we await wel voor logging
    try {
        await sendLDNCreate(dataset, actorId, subscribers);
    } catch (err) {
        // Dit zou nooit moeten gebeuren dankzij Promise.allSettled,
        // maar voor de zekerheid:
        console.error('[LDN] Unexpected error in sendLDNCreate:', err);
    }
}

export async function updateDataset(dataset: Dataset): Promise<void> {
    if (!datasetStore.has(dataset.id)) {
        throw new Error(`Dataset ${dataset.id} does not exist`);
    }

    datasetStore.set(dataset.id, { ...dataset });
    console.log(`[Dataset] Updated ${dataset.id}`);

    try {
        await sendLDNUpdate(dataset, actorId, subscribers);
    } catch (err) {
        console.error('[LDN] Unexpected error in sendLDNUpdate:', err);
    }
}
