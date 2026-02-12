"use client"

import * as React from "react"
import {
    CalendarIcon,
    LayoutGrid,
    ListTodo,
    Plus,
    ShoppingCart,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createItem } from "@/app/actions"
import { toast } from "sonner"

export function QuickCapture({ fabMode = false }: { fabMode?: boolean }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    // Escuchar Cmd+K / Ctrl+K
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setOpen(true)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createItem(formData)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("¡Capturado!")
            setOpen(false)
        }
    }

    const fabTrigger = (
        <button
            onClick={() => setOpen(true)}
            className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform fab-pulse touch-manipulation"
        >
            <Plus className="size-6" />
        </button>
    )

    const inlineTrigger = (
        <div className="relative w-full cursor-pointer" onClick={() => setOpen(true)}>
            <Zap className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                readOnly
                placeholder="Captura rápida... (⌘K)"
                className="w-full bg-muted/50 pl-9 h-9 cursor-pointer focus-visible:ring-1"
            />
            <div className="absolute right-1.5 top-1.5 flex gap-1">
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {fabMode ? fabTrigger : inlineTrigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="size-5 text-primary" />
                        Captura Rápida
                    </DialogTitle>
                    <DialogDescription>
                        Registra una idea, tarea, compra o evento al instante.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="task" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="task" className="gap-1.5 text-xs">
                            <ListTodo className="size-3.5" /> Tarea
                        </TabsTrigger>
                        <TabsTrigger value="project" className="gap-1.5 text-xs">
                            <LayoutGrid className="size-3.5" /> Proyecto
                        </TabsTrigger>
                        <TabsTrigger value="shopping" className="gap-1.5 text-xs">
                            <ShoppingCart className="size-3.5" /> Compra
                        </TabsTrigger>
                        <TabsTrigger value="event" className="gap-1.5 text-xs">
                            <CalendarIcon className="size-3.5" /> Evento
                        </TabsTrigger>
                    </TabsList>

                    {/* --- TASK --- */}
                    <TabsContent value="task">
                        <form action={handleSubmit} className="space-y-4 pt-4">
                            <input type="hidden" name="type" value="TASK" />
                            <div className="space-y-2">
                                <Label htmlFor="task-title">¿Qué necesitas hacer?</Label>
                                <Input id="task-title" name="title" placeholder="Ej: Llamar al dentista" autoFocus required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="task-context">Contexto</Label>
                                    <select
                                        id="task-context"
                                        name="context"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="Casa">🏠 Casa</option>
                                        <option value="Trabajo">💼 Trabajo</option>
                                        <option value="Urgente">🔴 Urgente</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="task-visibility">Visibilidad</Label>
                                    <select
                                        id="task-visibility"
                                        name="visibility"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="personal">🔒 Personal</option>
                                        <option value="shared">👫 Compartido</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full gap-2" disabled={loading}>
                                <Plus className="size-4" /> {loading ? "Guardando..." : "Capturar Tarea"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* --- PROJECT --- */}
                    <TabsContent value="project">
                        <form action={handleSubmit} className="space-y-4 pt-4">
                            <input type="hidden" name="type" value="PROJECT" />
                            <div className="space-y-2">
                                <Label htmlFor="proj-title">Nombre del Proyecto</Label>
                                <Input id="proj-title" name="title" placeholder="Ej: Remodelación del Baño" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="proj-visibility">Visibilidad</Label>
                                <select
                                    id="proj-visibility"
                                    name="visibility"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                >
                                    <option value="personal">🔒 Personal</option>
                                    <option value="shared">👫 Compartido</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full gap-2" disabled={loading}>
                                <Plus className="size-4" /> {loading ? "Guardando..." : "Crear Proyecto"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* --- SHOPPING --- */}
                    <TabsContent value="shopping">
                        <form action={handleSubmit} className="space-y-4 pt-4">
                            <input type="hidden" name="type" value="SHOPPING" />
                            <div className="space-y-2">
                                <Label htmlFor="shop-title">¿Qué necesitas comprar?</Label>
                                <Input id="shop-title" name="title" placeholder="Ej: Detergente" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="shop-category">Categoría</Label>
                                    <select
                                        id="shop-category"
                                        name="category"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="Lácteos">🥛 Lácteos</option>
                                        <option value="Frutas">🍎 Frutas</option>
                                        <option value="Panadería">🍞 Panadería</option>
                                        <option value="Carnes">🥩 Carnes</option>
                                        <option value="Hogar">🏠 Hogar</option>
                                        <option value="Herramientas">🔧 Herramientas</option>
                                        <option value="Varios">📦 Varios</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shop-cost">Costo Estimado ($)</Label>
                                    <Input id="shop-cost" name="cost" type="number" step="0.01" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shop-visibility">Visibilidad</Label>
                                <select
                                    id="shop-visibility"
                                    name="visibility"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                >
                                    <option value="shared">👫 Compartido</option>
                                    <option value="personal">🔒 Personal</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full gap-2" disabled={loading}>
                                <Plus className="size-4" /> {loading ? "Guardando..." : "Agregar a Lista"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* --- EVENT --- */}
                    <TabsContent value="event">
                        <form action={handleSubmit} className="space-y-4 pt-4">
                            <input type="hidden" name="type" value="EVENT" />
                            <div className="space-y-2">
                                <Label htmlFor="event-title">Nombre del Evento</Label>
                                <Input id="event-title" name="title" placeholder="Ej: Cena con los abuelos" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="event-context">Contexto</Label>
                                    <select
                                        id="event-context"
                                        name="context"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="Casa">🏠 Casa</option>
                                        <option value="Trabajo">💼 Trabajo</option>
                                        <option value="Urgente">🔴 Urgente</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="event-visibility">Visibilidad</Label>
                                    <select
                                        id="event-visibility"
                                        name="visibility"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="shared">👫 Compartido</option>
                                        <option value="personal">🔒 Personal</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full gap-2" disabled={loading}>
                                <Plus className="size-4" /> {loading ? "Guardando..." : "Agregar Evento"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
