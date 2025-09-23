import type {PasswordDefinition} from "$lib/server/helpers/password.helper";
import {prisma} from "$lib/server/configurations/prisma.config";

export const UserRepository = {
    create: (user: { email: string } & PasswordDefinition) =>
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
