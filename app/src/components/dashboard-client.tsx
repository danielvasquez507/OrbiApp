"use client"

import {
    Bell,
    Check,
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    Globe,
    LayoutGrid,
    ListTodo,
    Lock,
    Plus,
    ShoppingCart,
    Trash2,
    Users,
    Calendar as CalendarIcon,
} from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { ThemeToggle } from "@/components/theme-toggle"
import { QuickCapture } from "@/components/quick-capture"
import { toggleItemStatus, toggleVisibility, deleteItem, createItem } from "@/app/actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// --- Types ---
type ItemData = {
    id: string
    title: string
    description: string | null
    type: string
    status: string
    context: string | null
    progress: number | null
    cost: number | null
    category: string | null
    date: string | null
    isShared: boolean
    visibility: string
    parentId: string | null
    children?: ItemData[]
}

// --- Helper Components ---

function ProjectCard({ item, children, onToggleVisibility, onDelete }: {
    item: ItemData
    children?: ItemData[]
    onToggleVisibility: () => void
    onDelete: () => void
}) {
    const [expanded, setExpanded] = React.useState(false)
    const subtasks = children || []
    const completedSubtasks = subtasks.filter(s => s.status === "done").length

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-1">
                        {subtasks.length > 0 && (
                            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
                                {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </button>
                        )}
                        <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onToggleVisibility}
                            className="text-muted-foreground hover:text-foreground p-1 rounded"
                            title={item.visibility === "shared" ? "Compartido" : "Personal"}
                        >
                            {item.visibility === "shared" ? <Users className="size-3.5 text-blue-500" /> : <Lock className="size-3.5" />}
                        </button>
                        <Badge variant={item.status === "active" ? "default" : item.status === "urgent" ? "destructive" : "secondary"}>
                            {item.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${item.progress || 0}%` }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{item.progress || 0}% Completado</p>
                    {subtasks.length > 0 && (
                        <p className="text-xs text-muted-foreground">{completedSubtasks}/{subtasks.length} subtareas</p>
                    )}
                </div>

                {/* Subtasks */}
                {expanded && subtasks.length > 0 && (
                    <div className="space-y-1 pt-2 border-t">
                        {subtasks.map(sub => (
                            <SubtaskItem key={sub.id} item={sub} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function SubtaskItem({ item }: { item: ItemData }) {
    const [pending, setPending] = React.useState(false)

    async function handleToggle() {
        setPending(true)
        await toggleItemStatus(item.id)
        setPending(false)
    }

    return (
        <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors">
            <Checkbox
                checked={item.status === "done"}
                onCheckedChange={handleToggle}
                disabled={pending}
            />
            <span className={`text-sm flex-1 ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {item.title}
            </span>
        </div>
    )
}

function TaskItem({ item, onToggle, onToggleVisibility }: {
    item: ItemData
    onToggle: () => void
    onToggleVisibility: () => void
}) {
    return (
        <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg group transition-colors">
            <Checkbox
                checked={item.status === "done"}
                onCheckedChange={onToggle}
            />
            <div className="flex-1 space-y-1">
                <span className={`text-sm font-medium leading-none ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                </span>
            </div>
            <button
                onClick={onToggleVisibility}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
                title={item.visibility === "shared" ? "Compartido" : "Personal"}
            >
                {item.visibility === "shared" ? <Users className="size-3.5 text-blue-500" /> : <Lock className="size-3.5" />}
            </button>
            <Badge variant="outline" className={
                item.context === "Urgente" ? "text-destructive border-destructive" :
                    item.context === "Trabajo" ? "text-blue-500 border-blue-500" :
                        "text-green-500 border-green-500"
            }>{item.context || "General"}</Badge>
        </div>
    )
}

function ShoppingItem({ item, onToggle, onToggleVisibility }: {
    item: ItemData
    onToggle: () => void
    onToggleVisibility: () => void
}) {
    return (
        <div className={`flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer ${item.status === "done" ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
                <Checkbox
                    checked={item.status === "done"}
                    onCheckedChange={onToggle}
                />
                <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                </div>
                <div>
                    <p className={`font-medium text-sm ${item.status === "done" ? "line-through" : ""}`}>{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleVisibility}
                    className="text-muted-foreground hover:text-foreground p-1"
                    title={item.visibility === "shared" ? "Compartido" : "Personal"}
                >
                    {item.visibility === "shared" ? <Users className="size-3.5 text-blue-500" /> : <Lock className="size-3.5" />}
                </button>
                <p className="font-mono text-sm">${item.cost?.toFixed(2) || "0.00"}</p>
            </div>
        </div>
    )
}

function AddSubtaskDialog({ parentId }: { parentId: string }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createItem(formData)
        setLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Subtarea agregada")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                    <Plus className="size-3" /> Subtarea
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Nueva Subtarea</DialogTitle>
                    <DialogDescription>Agrega un paso a este proyecto.</DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 pt-2">
                    <input type="hidden" name="type" value="TASK" />
                    <input type="hidden" name="parentId" value={parentId} />
                    <div className="space-y-2">
                        <Label htmlFor="sub-title">Descripción</Label>
                        <Input id="sub-title" name="title" placeholder="Ej: Comprar materiales" required autoFocus />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Guardando..." : "Agregar"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// --- Space Filter ---
function SpaceFilter({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    return (
        <div className="inline-flex items-center rounded-lg border bg-card p-1 gap-1 text-sm">
            <button
                onClick={() => onChange("all")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${value === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
                <Globe className="size-3.5" /> Todo
            </button>
            <button
                onClick={() => onChange("personal")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${value === "personal" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
                <Lock className="size-3.5" /> Personal
            </button>
            <button
                onClick={() => onChange("shared")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${value === "shared" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
                <Users className="size-3.5" /> Compartido
            </button>
        </div>
    )
}

// --- Main Client Dashboard ---

export default function DashboardClient({ initialItems }: { initialItems: ItemData[] }) {
    const [items, setItems] = React.useState(initialItems)
    const [spaceFilter, setSpaceFilter] = React.useState("all")
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    // Re-sync when server revalidates
    React.useEffect(() => {
        setItems(initialItems)
    }, [initialItems])

    // Filter by visibility
    const filteredItems = spaceFilter === "all"
        ? items
        : items.filter(i => i.visibility === spaceFilter)

    const projects = filteredItems.filter(i => i.type === "PROJECT" && !i.parentId)
    const tasks = filteredItems.filter(i => i.type === "TASK" && !i.parentId)
    const shopping = filteredItems.filter(i => i.type === "SHOPPING")
    const events = filteredItems.filter(i => i.type === "EVENT")

    // Get subtasks for a project
    const getChildren = (parentId: string) => items.filter(i => i.parentId === parentId)

    // Shopping total
    const shoppingTotal = shopping.reduce((sum, s) => sum + (s.cost || 0), 0)

    async function handleToggle(id: string) {
        await toggleItemStatus(id)
    }

    async function handleToggleVis(id: string) {
        await toggleVisibility(id)
        toast.success("Visibilidad actualizada")
    }

    async function handleDelete(id: string) {
        await deleteItem(id)
        toast.success("Eliminado")
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b h-14 flex items-center px-4 justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        O
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Orbi</span>
                </div>

                <div className="flex items-center gap-4 w-full max-w-md mx-4">
                    <QuickCapture />
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Bell className="size-4" />
                    </Button>
                    <div className="h-6 w-px bg-border mx-1" />
                    <Avatar className="size-8 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                        <AvatarFallback>D</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <Tabs defaultValue="operations" className="h-full flex flex-col">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
                        <TabsList className="grid grid-cols-4 w-[540px]">
                            <TabsTrigger value="projects" className="gap-2">
                                <LayoutGrid className="size-4" /> Proyectos
                            </TabsTrigger>
                            <TabsTrigger value="operations" className="gap-2">
                                <ListTodo className="size-4" /> Operativo
                            </TabsTrigger>
                            <TabsTrigger value="logistics" className="gap-2">
                                <ShoppingCart className="size-4" /> Logística
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2">
                                <CalendarIcon className="size-4" /> Calendario
                            </TabsTrigger>
                        </TabsList>

                        <SpaceFilter value={spaceFilter} onChange={setSpaceFilter} />
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="container mx-auto px-4 pb-10">

                            {/* === PROJECTS === */}
                            <TabsContent value="projects" className="mt-0 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-yellow-500" /> Planificación
                                        </h3>
                                        {projects.filter(p => p.status === "hold").map(p => (
                                            <div key={p.id} className="space-y-1">
                                                <ProjectCard
                                                    item={p}
                                                    children={getChildren(p.id)}
                                                    onToggleVisibility={() => handleToggleVis(p.id)}
                                                    onDelete={() => handleDelete(p.id)}
                                                />
                                                <AddSubtaskDialog parentId={p.id} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-blue-500" /> En Progreso
                                        </h3>
                                        {projects.filter(p => p.status === "active" || p.status === "urgent").map(p => (
                                            <div key={p.id} className="space-y-1">
                                                <ProjectCard
                                                    item={p}
                                                    children={getChildren(p.id)}
                                                    onToggleVisibility={() => handleToggleVis(p.id)}
                                                    onDelete={() => handleDelete(p.id)}
                                                />
                                                <AddSubtaskDialog parentId={p.id} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500" /> Completado
                                        </h3>
                                        {projects.filter(p => p.status === "done").map(p => (
                                            <div key={p.id} className="space-y-1">
                                                <ProjectCard
                                                    item={p}
                                                    children={getChildren(p.id)}
                                                    onToggleVisibility={() => handleToggleVis(p.id)}
                                                    onDelete={() => handleDelete(p.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* === OPERATIONS === */}
                            <TabsContent value="operations" className="mt-0 pt-4">
                                <div className="max-w-3xl mx-auto space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Hoy, {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                                        </h2>
                                        <p className="text-muted-foreground">
                                            {tasks.filter(t => t.status !== "done").length} tareas pendientes
                                            {spaceFilter !== "all" && ` (${spaceFilter})`}.
                                        </p>
                                    </div>

                                    {tasks.filter(t => t.context === "Urgente").length > 0 && (
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">
                                                    🔴 Prioritario
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-1 p-2">
                                                {tasks.filter(t => t.context === "Urgente").map(t => (
                                                    <TaskItem
                                                        key={t.id}
                                                        item={t}
                                                        onToggle={() => handleToggle(t.id)}
                                                        onToggleVisibility={() => handleToggleVis(t.id)}
                                                    />
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">
                                                📋 Tareas
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-1 p-2">
                                            {tasks.filter(t => t.context !== "Urgente").map(t => (
                                                <TaskItem
                                                    key={t.id}
                                                    item={t}
                                                    onToggle={() => handleToggle(t.id)}
                                                    onToggleVisibility={() => handleToggleVis(t.id)}
                                                />
                                            ))}
                                            {tasks.filter(t => t.context !== "Urgente").length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-4">No hay tareas en esta vista. ¡Usa ⌘K para agregar una!</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* === LOGISTICS === */}
                            <TabsContent value="logistics" className="mt-0 pt-4">
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-semibold tracking-tight">Listas de Compras</h2>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-base px-3 py-1">
                                                Total: <span className="font-mono ml-1">${shoppingTotal.toFixed(2)}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Group by category */}
                                        {Object.entries(
                                            shopping.reduce((acc, s) => {
                                                const cat = s.category || "Sin Categoría"
                                                if (!acc[cat]) acc[cat] = []
                                                acc[cat].push(s)
                                                return acc
                                            }, {} as Record<string, ItemData[]>)
                                        ).map(([cat, items]) => (
                                            <div key={cat} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-lg">{cat}</h3>
                                                    <Badge variant="secondary">{items.length} items</Badge>
                                                </div>
                                                <div className="grid gap-2">
                                                    {items.map(s => (
                                                        <ShoppingItem
                                                            key={s.id}
                                                            item={s}
                                                            onToggle={() => handleToggle(s.id)}
                                                            onToggleVisibility={() => handleToggleVis(s.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* === CALENDAR === */}
                            <TabsContent value="calendar" className="mt-0 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-1">
                                        <Card>
                                            <CardContent className="p-4">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    className="rounded-md border shadow"
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="text-lg font-semibold">
                                            Agenda para{" "}
                                            {date?.toLocaleDateString("es-ES", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                            })}
                                        </h3>
                                        <div className="space-y-3">
                                            {/* Show events */}
                                            {events.length > 0 ? (
                                                events.map(ev => (
                                                    <Card key={ev.id} className="border-l-4 border-l-primary">
                                                        <CardContent className="p-4 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium text-sm">{ev.title}</p>
                                                                <p className="text-xs text-muted-foreground">{ev.context || "Todo el día"}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {ev.visibility === "shared" ? (
                                                                    <Badge variant="outline" className="text-blue-500 border-blue-500">Compartido</Badge>
                                                                ) : (
                                                                    <Badge variant="outline">Personal</Badge>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            ) : (
                                                <Card>
                                                    <CardContent className="p-8 text-center text-muted-foreground">
                                                        <CalendarIcon className="size-10 mx-auto mb-3 opacity-30" />
                                                        <p>No hay eventos para este día.</p>
                                                        <p className="text-xs mt-1">Usa ⌘K → Evento para agregar uno.</p>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Show project deadlines as calendar items */}
                                            {projects.filter(p => p.status === "active").length > 0 && (
                                                <>
                                                    <Separator className="my-4" />
                                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Proyectos Activos</h4>
                                                    {projects.filter(p => p.status === "active").map(p => (
                                                        <Card key={p.id} className="border-l-4 border-l-yellow-500">
                                                            <CardContent className="p-4 flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-medium text-sm">{p.title}</p>
                                                                    <p className="text-xs text-muted-foreground">{p.progress || 0}% completado</p>
                                                                </div>
                                                                <Badge variant="outline">Proyecto</Badge>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </ScrollArea>
                </Tabs>
            </main>
        </div>
    )
}
