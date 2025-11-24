import { prisma } from '$lib/server/configurations/prisma.config';
import type { Application } from '@prisma/client';
import {randomUUID} from "node:crypto";

export const ApplicationRepository = {
    /**
     * Creates a new application (e.g. external consumer) with an API key and inbox.
     */
    create: (data: {
        name: string
        description: string,
        inbox_url: string,
        api_key: string
        owner: {
            id: string
        }}) =>
        prisma.application.create({
            data:{
                name: data.name,
                description: data.description,
                inbox_url: data.inbox_url,
                api_key: data.api_key,
                owner: {
                    connect: {
                        id: data.owner.id
                    }
                }
            }
        }),

    /**
     * Finds an application by its API key (used for authentication).
     */
    getByApiKey: (api_key: string): Promise<Application | null> =>
        prisma.application.findUnique({
            where: { api_key }
        }),

    /**
     * Get all applications from user.
     */
    getAllFromUser: (owner_id: string): Promise<Application[] | null> =>
        prisma.application.findMany({
            where: { owner_id }
        }),

    /**
     * Finds an application by ID.
     */
    getById: (id: string): Promise<Application | null> =>
        prisma.application.findUnique({
            where: { id }
        }),

    /**
     * Returns all active applications (used for LDN broadcasting).
     */
    getAllActive: (): Promise<Application[]> =>
        prisma.application.findMany({
            where: { is_active: true }
        }),

    /**
     * Updates an application (e.g. rotate key, change inbox, deactivate).
     */
    update: (id: string, data: Partial<Application>): Promise<Application> =>
        prisma.application.update({
            where: { id },
            data
        }),

    /**
     * Deletes an application (revokes access permanently).
     */
    delete: (id: string): Promise<Application> =>
        prisma.application.delete({
            where: { id }
        })
};
