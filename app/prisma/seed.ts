import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding database...")

    // Create User
    const user = await prisma.user.create({
        data: {
            email: "dany@orbi.app",
            name: "Dany",
            items: {
                create: [
                    {
                        title: "Renovación Cocina",
                        type: "PROJECT",
                        status: "active",
                        progress: 35,
                        context: "Casa"
                    },
                    {
                        title: "Viaje a Japón",
                        type: "PROJECT",
                        status: "hold",
                        progress: 10,
                        context: "Casa"
                    },
                    {
                        title: "Pagar la luz",
                        type: "TASK",
                        status: "active",
                        context: "Urgente"
                    },
                    {
                        title: "Enviar reporte mensual",
                        type: "TASK",
                        status: "active",
                        context: "Trabajo"
                    },
                    {
                        title: "Leche Deslactosada",
                        type: "SHOPPING",
                        status: "active",
                        cost: 2.50,
                        category: "Lácteos"
                    },
                    {
                        title: "Bombillos LED x4",
                        type: "SHOPPING",
                        status: "active",
                        cost: 12.00,
                        category: "Hogar"
                    }
                ]
            }
        }
    })

    console.log(`Created user with id: ${user.id} and initial items.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
