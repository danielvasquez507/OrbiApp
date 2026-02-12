import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Limpiando base de datos...")
    await prisma.item.deleteMany()
    await prisma.user.deleteMany()

    console.log("Seeding database...")

    const user = await prisma.user.create({
        data: {
            email: "dany@orbi.app",
            name: "Dany",
        }
    })

    // --- Projects with subtasks ---
    const projectReno = await prisma.item.create({
        data: {
            title: "Renovación Cocina",
            type: "PROJECT",
            status: "active",
            progress: 35,
            context: "Casa",
            visibility: "shared",
            isShared: true,
            ownerId: user.id,
        }
    })

    await prisma.item.createMany({
        data: [
            { title: "Comprar azulejos", type: "TASK", status: "done", parentId: projectReno.id, ownerId: user.id, visibility: "shared", isShared: true },
            { title: "Contratar plomero", type: "TASK", status: "active", parentId: projectReno.id, ownerId: user.id, visibility: "shared", isShared: true },
            { title: "Elegir gabinetes", type: "TASK", status: "active", parentId: projectReno.id, ownerId: user.id, visibility: "shared", isShared: true },
        ]
    })

    const projectJapon = await prisma.item.create({
        data: {
            title: "Viaje a Japón",
            type: "PROJECT",
            status: "hold",
            progress: 10,
            context: "Casa",
            visibility: "shared",
            isShared: true,
            ownerId: user.id,
        }
    })

    await prisma.item.createMany({
        data: [
            { title: "Investigar vuelos", type: "TASK", status: "active", parentId: projectJapon.id, ownerId: user.id, visibility: "shared", isShared: true },
            { title: "Reservar hotel", type: "TASK", status: "active", parentId: projectJapon.id, ownerId: user.id, visibility: "shared", isShared: true },
        ]
    })

    // --- Personal project ---
    await prisma.item.create({
        data: {
            title: "Curso de Machine Learning",
            type: "PROJECT",
            status: "active",
            progress: 60,
            context: "Trabajo",
            visibility: "personal",
            isShared: false,
            ownerId: user.id,
        }
    })

    // --- Tasks (mixed visibility) ---
    await prisma.item.createMany({
        data: [
            { title: "Pagar la luz", type: "TASK", status: "active", context: "Urgente", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Enviar reporte mensual", type: "TASK", status: "active", context: "Trabajo", visibility: "personal", isShared: false, ownerId: user.id },
            { title: "Llamar al dentista", type: "TASK", status: "active", context: "Casa", visibility: "personal", isShared: false, ownerId: user.id },
            { title: "Comprar regalo de cumpleaños", type: "TASK", status: "active", context: "Urgente", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Recoger paquete en correos", type: "TASK", status: "done", context: "Casa", visibility: "personal", isShared: false, ownerId: user.id },
        ]
    })

    // --- Shopping (mostly shared) ---
    await prisma.item.createMany({
        data: [
            { title: "Leche Deslactosada", type: "SHOPPING", status: "active", cost: 2.5, category: "Lácteos", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Pan Integral", type: "SHOPPING", status: "active", cost: 3.0, category: "Panadería", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Bombillos LED x4", type: "SHOPPING", status: "active", cost: 12.0, category: "Hogar", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Cafe Molido 500g", type: "SHOPPING", status: "active", cost: 8.5, category: "Varios", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Creatina (suplemento)", type: "SHOPPING", status: "active", cost: 25.0, category: "Varios", visibility: "personal", isShared: false, ownerId: user.id },
        ]
    })

    // --- Events ---
    await prisma.item.createMany({
        data: [
            { title: "Cena con los abuelos", type: "EVENT", status: "active", context: "Casa", visibility: "shared", isShared: true, ownerId: user.id },
            { title: "Reunión de Sincronización", type: "EVENT", status: "active", context: "Trabajo", visibility: "personal", isShared: false, ownerId: user.id },
        ]
    })

    console.log(`✅ Seed completado. Usuario: ${user.name} (${user.id})`)
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
