// src/index.ts
import { addDataset, updateDataset } from './dataset-service.js';

async function main() {
    const ds = {
        id: 'https://your-dataspace.example/datasets/energy-stats-2025',
        title: 'Energy Statistics 2025',
        modified: new Date().toISOString()
    };

    try {
        await addDataset(ds);
    } catch (err) {
        console.error('[Main] Failed to add dataset:', err);
        return; // of log en ga door, afhankelijk van strategie
    }

    // Gebruik setTimeout met ingekapselde async functie die fouten afvangt
    setTimeout(async () => {
        const updated = { ...ds, modified: new Date().toISOString() };
        try {
            await updateDataset(updated);
        } catch (err) {
            console.error('[Main] Failed to update dataset:', err);
            // Applicatie blijft draaien — geen throw
        }
    }, 2000);
}

// Start en vang top-level fouten op
main().catch((err) => {
    console.error('[Top-level] Unhandled error in main:', err);
    // Optioneel: process.exit(1) als je WEL wilt stoppen bij kritieke fout
    // Maar in jouw geval: laat gewoon draaien
});
