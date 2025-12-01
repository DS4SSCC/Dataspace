import { PrismaClient } from '@prisma/client';
import type {RequestHandler} from "@sveltejs/kit";

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    // Fetch all dataset identifiers (or generate a slug if you add one later)
    const datasets = await prisma.dataset.findMany({
        where: {
            is_published: true // optional: only list published datasets
        }
    });

    return new Response(
        JSON.stringify({
            success: true,
            result: datasets
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};
