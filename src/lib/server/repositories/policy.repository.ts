import {prisma} from "$lib/server/configurations/prisma.config";

export const PolicyRepository = {
    list: () => prisma.policy.findMany({
        select: {
            id: true,
            active: true,
            name: true,
            description: true
        }
    })
}
