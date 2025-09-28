import type {PasswordDefinition} from "$lib/server/helpers/password.helper";
import {prisma} from "$lib/server/configurations/prisma.config";

export const UserRepository = {
    getSessionUserFormat: (id: string) => prisma.user.findUniqueOrThrow({
        where: {id},
        select: {id: true, full_name: true, email: true, created_at: true},
    }),
    create: (user: { email: string, full_name: string } & PasswordDefinition) =>
        prisma.user.create({
            data: user
        }),
    getByEmail: (email: string) =>
        prisma.user.findUnique({
            where: {
                email
            }
        })
}
