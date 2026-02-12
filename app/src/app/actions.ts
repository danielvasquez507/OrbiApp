"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// --- Quick Capture: Create any type of item ---
export async function createItem(formData: FormData) {
    const title = formData.get("title") as string
    const type = formData.get("type") as string
    const context = formData.get("context") as string | null
    const visibility = formData.get("visibility") as string | null
    const category = formData.get("category") as string | null
    const costStr = formData.get("cost") as string | null
    const parentId = formData.get("parentId") as string | null

    if (!title || !type) return { error: "Título y tipo son requeridos" }

    // For now, use the first user (single-user mode until auth is added)
    const user = await prisma.user.findFirst()
    if (!user) return { error: "No hay usuario registrado" }

    await prisma.item.create({
        data: {
            title,
            type,
            context: context || undefined,
            visibility: visibility || "personal",
            isShared: visibility === "shared",
            category: category || undefined,
            cost: costStr ? parseFloat(costStr) : undefined,
            progress: type === "PROJECT" ? 0 : undefined,
            parentId: parentId || undefined,
            ownerId: user.id,
        },
    })

    revalidatePath("/")
    return { success: true }
}

// --- Toggle item status ---
export async function toggleItemStatus(id: string) {
    const item = await prisma.item.findUnique({ where: { id } })
    if (!item) return { error: "Ítem no encontrado" }

    await prisma.item.update({
        where: { id },
        data: {
            status: item.status === "done" ? "active" : "done",
        },
    })

    revalidatePath("/")
    return { success: true }
}

// --- Update project progress ---
export async function updateProgress(id: string, progress: number) {
    await prisma.item.update({
        where: { id },
        data: {
            progress: Math.max(0, Math.min(100, progress)),
            status: progress >= 100 ? "done" : "active",
        },
    })

    revalidatePath("/")
    return { success: true }
}

// --- Delete item ---
export async function deleteItem(id: string) {
    // Delete children first (subtasks)
    await prisma.item.deleteMany({ where: { parentId: id } })
    await prisma.item.delete({ where: { id } })

    revalidatePath("/")
    return { success: true }
}

// --- Toggle visibility (personal <-> shared) ---
export async function toggleVisibility(id: string) {
    const item = await prisma.item.findUnique({ where: { id } })
    if (!item) return { error: "Ítem no encontrado" }

    const newVisibility = item.visibility === "personal" ? "shared" : "personal"

    await prisma.item.update({
        where: { id },
        data: {
            visibility: newVisibility,
            isShared: newVisibility === "shared",
        },
    })

    revalidatePath("/")
    return { success: true }
}
