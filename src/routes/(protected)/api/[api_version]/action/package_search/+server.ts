import type { RequestHandler } from "@sveltejs/kit";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const q = body.q || '';
    const limit = Math.min(100, body.rows || 20);
    const offset = body.start || 0;

    const datasets = await prisma.dataset.findMany({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { identifier: { contains: q, mode: 'insensitive' } }
            ]
        },
        include: { catalog: true },
        take: limit,
        skip: offset
    });

    const results = datasets.map(d => ({
        id: d.id,
        name: d.identifier.replace(/[^a-z0-9_-]/g, '_').toLowerCase(),
        title: d.title,
        // ... (same as above)
    }));

    return new Response(
        JSON.stringify({
            success: true,
            result: {
                count: results.length,
                results
            }
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
};
