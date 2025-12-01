import {prisma} from "$lib/server/configurations/prisma.config";

export const PolicyRepository = {
    list: () => prisma.policy.findMany({
        select: {
            id: true,
            active: true,
            name: true,
            raw: true,
            description: true,
            datasets: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                }
            }
        },
    }),
    create: (policy: { name: string, description?: string, raw: string, datasets: { id: string }[], package: string }) =>
        prisma.policy.create({
            data: {
                name: policy.name,
                description: policy.description,
                package: policy.package,
                raw: policy.raw,
                datasets: {
                    connect: policy.datasets.map(({id}) => ({id}))
                }
            }
        }),
    update: (update: { id: string, raw?: string, description?: string, name?: string }) => prisma.policy.update({
        where: {
            id: update.id,
        },
        data: {
            name: update.name,
            description: update.description,
            raw: update.raw,
        }
    })

}
