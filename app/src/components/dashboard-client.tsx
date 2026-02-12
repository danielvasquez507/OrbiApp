"use client"

import {
    Bell,
    CalendarIcon,
    Check,
    ChevronDown,
    ChevronRight,
    Globe,
    LayoutGrid,
    ListTodo,
    Lock,
    MoreHorizontal,
    Plus,
    ShoppingCart,
    Trash2,
    TrendingUp,
    Users,
    Zap,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { QuickCapture } from "@/components/quick-capture"
import { toggleItemStatus, toggleVisibility, deleteItem, createItem } from "@/app/actions"
import { toast } from "sonner"

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

// === STAT CARD ===
function StatCard({ label, value, icon: Icon, gradient, delay }: {
    label: string; value: string | number; icon: any; gradient: string; delay: number
}) {
    return (
        <div
            className={`${gradient} rounded-xl p-4 border animate-fade-in card-hover`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className="size-10 rounded-lg bg-background/60 flex items-center justify-center">
                    <Icon className="size-5 text-primary" />
                </div>
            </div>
        </div>
    )
}

// === PROJECT CARD ===
function ProjectCard({ item, children: subtasks, onToggleVisibility, onDelete }: {
    item: ItemData; children?: ItemData[]; onToggleVisibility: () => void; onDelete: () => void
}) {
    const [expanded, setExpanded] = React.useState(false)
    const tasks = subtasks || []
    const done = tasks.filter(s => s.status === "done").length

    return (
        <Card className="card-hover animate-fade-in overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {tasks.length > 0 && (
                            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
                                {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </button>
                        )}
                        <CardTitle className="text-base font-semibold truncate">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={onToggleVisibility}
                            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                            title={item.visibility === "shared" ? "Compartido" : "Personal"}
                        >
                            {item.visibility === "shared" ? <Users className="size-3.5 text-blue-500" /> : <Lock className="size-3.5" />}
                        </button>
                        <Badge
                            variant={item.status === "active" ? "default" : item.status === "urgent" ? "destructive" : "secondary"}
                            className="text-[10px]"
                        >
                            {item.status === "active" ? "Activo" : item.status === "hold" ? "Pendiente" : item.status === "done" ? "Listo" : item.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                                    <MoreHorizontal className="size-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onToggleVisibility}>
                                    {item.visibility === "shared" ? "Hacer Personal" : "Compartir"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                                    <Trash2 className="size-4 mr-2" /> Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-progress transition-all duration-700" style={{ width: `${item.progress || 0}%` }} />
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{item.progress || 0}%</span>
                    {tasks.length > 0 && <span>{done}/{tasks.length} subtareas</span>}
                </div>

                {expanded && tasks.length > 0 && (
                    <div className="space-y-1 pt-2 border-t stagger-children">
                        {tasks.map(sub => (
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
            <Checkbox checked={item.status === "done"} onCheckedChange={handleToggle} disabled={pending} />
            <span className={`text-sm flex-1 ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {item.title}
            </span>
        </div>
    )
}

// === TASK ITEM ===
function TaskItem({ item, onToggle, onToggleVisibility, onDelete }: {
    item: ItemData; onToggle: () => void; onToggleVisibility: () => void; onDelete: () => void
}) {
    return (
        <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg group transition-all animate-fade-in">
            <Checkbox checked={item.status === "done"} onCheckedChange={onToggle} />
            <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium leading-none block truncate ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={onToggleVisibility} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1" title={item.visibility === "shared" ? "Compartido" : "Personal"}>
                    {item.visibility === "shared" ? <Users className="size-3.5 text-blue-500" /> : <Lock className="size-3.5" />}
                </button>
                <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="size-3.5" />
                </button>
                <Badge variant="outline" className={`text-[10px] ${item.context === "Urgente" ? "text-destructive border-destructive/50" :
                        item.context === "Trabajo" ? "text-blue-500 border-blue-500/50" :
                            "text-emerald-500 border-emerald-500/50"
                    }`}>{item.context || "General"}</Badge>
            </div>
        </div>
    )
}

// === SHOPPING ITEM ===
function ShoppingItem({ item, onToggle, onToggleVisibility, onDelete }: {
    item: ItemData; onToggle: () => void; onToggleVisibility: () => void; onDelete: () => void
}) {
    return (
        <div className={`flex items-center justify-between p-3 border rounded-xl card-hover transition-all animate-fade-in ${item.status === "done" ? "opacity-50 bg-muted/30" : "bg-card"}`}>
            <div className="flex items-center gap-3 min-w-0">
                <Checkbox checked={item.status === "done"} onCheckedChange={onToggle} />
                <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className={`font-medium text-sm truncate ${item.status === "done" ? "line-through" : ""}`}>{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button onClick={onToggleVisibility} className="text-muted-foreground hover:text-foreground p-1 transition-colors" title={item.visibility === "shared" ? "Compartido" : "Personal"}>
                    {item.visibility === "shared" ? <Users className="size-3.5 text-blue-500" /> : <Lock className="size-3.5" />}
                </button>
                <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
                    <Trash2 className="size-3.5" />
                </button>
                <p className="font-mono text-sm font-semibold min-w-[4rem] text-right">${item.cost?.toFixed(2) || "0.00"}</p>
            </div>
        </div>
    )
}

// === ADD SUBTASK ===
function AddSubtaskDialog({ parentId }: { parentId: string }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createItem(formData)
        setLoading(false)
        if (result.error) { toast.error(result.error) } else { toast.success("Subtarea agregada"); setOpen(false) }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground h-7">
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

// === SPACE FILTER ===
function SpaceFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="inline-flex items-center rounded-xl border bg-card p-1 gap-0.5 text-sm shadow-sm">
            {[
                { key: "all", label: "Todo", icon: Globe },
                { key: "personal", label: "Personal", icon: Lock },
                { key: "shared", label: "Compartido", icon: Users },
            ].map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium ${value === key
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                >
                    <Icon className="size-3.5" /> <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    )
}

// === MAIN DASHBOARD ===
export default function DashboardClient({ initialItems }: { initialItems: ItemData[] }) {
    const [items, setItems] = React.useState(initialItems)
    const [spaceFilter, setSpaceFilter] = React.useState("all")
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    React.useEffect(() => { setItems(initialItems) }, [initialItems])

    // Filtered items
    const filtered = spaceFilter === "all" ? items : items.filter(i => i.visibility === spaceFilter)
    const projects = filtered.filter(i => i.type === "PROJECT" && !i.parentId)
    const tasks = filtered.filter(i => i.type === "TASK" && !i.parentId)
    const shopping = filtered.filter(i => i.type === "SHOPPING")
    const events = filtered.filter(i => i.type === "EVENT")
    const getChildren = (parentId: string) => items.filter(i => i.parentId === parentId)

    // Stats
    const totalActive = items.filter(i => i.status === "active" && !i.parentId).length
    const totalDone = items.filter(i => i.status === "done" && !i.parentId).length
    const shoppingTotal = shopping.reduce((sum, s) => sum + (s.cost || 0), 0)
    const urgentCount = items.filter(i => i.context === "Urgente" && i.status !== "done" && !i.parentId).length

    async function handleToggle(id: string) { await toggleItemStatus(id) }
    async function handleToggleVis(id: string) { await toggleVisibility(id); toast.success("Visibilidad actualizada") }
    async function handleDelete(id: string) { await deleteItem(id); toast.success("Eliminado") }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* === HEADER === */}
            <header className="border-b h-14 flex items-center px-4 justify-between bg-card/70 glass sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                        O
                    </div>
                    <span className="font-bold text-lg tracking-tight gradient-text hidden sm:block">Orbi</span>
                </div>

                <div className="flex items-center w-full max-w-md mx-4">
                    <QuickCapture />
                </div>

                <div className="flex items-center gap-1.5">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                        <Bell className="size-4" />
                        {urgentCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 size-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse-glow">
                                {urgentCount}
                            </span>
                        )}
                    </Button>
                    <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
                    <Avatar className="size-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">D</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            {/* === CONTENT === */}
            <main className="flex-1 overflow-hidden">
                <Tabs defaultValue="operations" className="h-full flex flex-col">
                    {/* Tab bar */}
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                        <TabsList className="grid grid-cols-4 w-full sm:w-[520px]">
                            <TabsTrigger value="projects" className="gap-1.5 text-xs sm:text-sm">
                                <LayoutGrid className="size-4" /> <span className="hidden sm:inline">Proyectos</span>
                            </TabsTrigger>
                            <TabsTrigger value="operations" className="gap-1.5 text-xs sm:text-sm">
                                <ListTodo className="size-4" /> <span className="hidden sm:inline">Operativo</span>
                            </TabsTrigger>
                            <TabsTrigger value="logistics" className="gap-1.5 text-xs sm:text-sm">
                                <ShoppingCart className="size-4" /> <span className="hidden sm:inline">Logística</span>
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-1.5 text-xs sm:text-sm">
                                <CalendarIcon className="size-4" /> <span className="hidden sm:inline">Calendario</span>
                            </TabsTrigger>
                        </TabsList>
                        <SpaceFilter value={spaceFilter} onChange={setSpaceFilter} />
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="container mx-auto px-4 pb-10">

                            {/* ====== PROJECTS ====== */}
                            <TabsContent value="projects" className="mt-0 space-y-6">
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                    <StatCard label="Proyectos" value={projects.length} icon={LayoutGrid} gradient="stat-gradient-1" delay={0} />
                                    <StatCard label="Activos" value={projects.filter(p => p.status === "active").length} icon={TrendingUp} gradient="stat-gradient-2" delay={60} />
                                    <StatCard label="Planificación" value={projects.filter(p => p.status === "hold").length} icon={CalendarIcon} gradient="stat-gradient-3" delay={120} />
                                    <StatCard label="Completados" value={projects.filter(p => p.status === "done").length} icon={Check} gradient="stat-gradient-4" delay={180} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Planificación */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                            <span className="size-2 rounded-full bg-amber-500" /> Planificación
                                        </h3>
                                        <div className="stagger-children space-y-3">
                                            {projects.filter(p => p.status === "hold").map(p => (
                                                <div key={p.id} className="space-y-1">
                                                    <ProjectCard item={p} children={getChildren(p.id)} onToggleVisibility={() => handleToggleVis(p.id)} onDelete={() => handleDelete(p.id)} />
                                                    <AddSubtaskDialog parentId={p.id} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* En Progreso */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                            <span className="size-2 rounded-full bg-blue-500" /> En Progreso
                                        </h3>
                                        <div className="stagger-children space-y-3">
                                            {projects.filter(p => p.status === "active" || p.status === "urgent").map(p => (
                                                <div key={p.id} className="space-y-1">
                                                    <ProjectCard item={p} children={getChildren(p.id)} onToggleVisibility={() => handleToggleVis(p.id)} onDelete={() => handleDelete(p.id)} />
                                                    <AddSubtaskDialog parentId={p.id} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Completado */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                            <span className="size-2 rounded-full bg-emerald-500" /> Completado
                                        </h3>
                                        <div className="stagger-children space-y-3">
                                            {projects.filter(p => p.status === "done").map(p => (
                                                <div key={p.id}>
                                                    <ProjectCard item={p} children={getChildren(p.id)} onToggleVisibility={() => handleToggleVis(p.id)} onDelete={() => handleDelete(p.id)} />
                                                </div>
                                            ))}
                                            {projects.filter(p => p.status === "done").length === 0 && (
                                                <div className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-xl">
                                                    <Check className="size-8 mx-auto mb-2 opacity-20" />
                                                    Los proyectos completados aparecerán aquí.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ====== OPERATIONS ====== */}
                            <TabsContent value="operations" className="mt-0 pt-2">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <StatCard label="Pendientes" value={tasks.filter(t => t.status !== "done").length} icon={ListTodo} gradient="stat-gradient-1" delay={0} />
                                        <StatCard label="Completadas" value={tasks.filter(t => t.status === "done").length} icon={Check} gradient="stat-gradient-2" delay={60} />
                                        <StatCard label="Urgentes" value={tasks.filter(t => t.context === "Urgente" && t.status !== "done").length} icon={Zap} gradient="stat-gradient-4" delay={120} />
                                        <StatCard label="Total" value={tasks.length} icon={TrendingUp} gradient="stat-gradient-3" delay={180} />
                                    </div>

                                    <div className="space-y-2 animate-fade-in">
                                        <h2 className="text-2xl font-bold tracking-tight">
                                            Hoy, {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                                        </h2>
                                        <p className="text-muted-foreground text-sm">
                                            {tasks.filter(t => t.status !== "done").length} tareas pendientes
                                            {spaceFilter !== "all" && ` · ${spaceFilter === "personal" ? "🔒 Personal" : "👫 Compartido"}`}
                                        </p>
                                    </div>

                                    {tasks.filter(t => t.context === "Urgente" && t.status !== "done").length > 0 && (
                                        <Card className="border-destructive/30 animate-fade-in">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium uppercase text-destructive tracking-wider flex items-center gap-2">
                                                    <Zap className="size-4" /> Prioritario
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-0.5 p-2">
                                                {tasks.filter(t => t.context === "Urgente" && t.status !== "done").map(t => (
                                                    <TaskItem key={t.id} item={t} onToggle={() => handleToggle(t.id)} onToggleVisibility={() => handleToggleVis(t.id)} onDelete={() => handleDelete(t.id)} />
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">📋 Tareas</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-0.5 p-2">
                                            {tasks.filter(t => t.context !== "Urgente").map(t => (
                                                <TaskItem key={t.id} item={t} onToggle={() => handleToggle(t.id)} onToggleVisibility={() => handleToggleVis(t.id)} onDelete={() => handleDelete(t.id)} />
                                            ))}
                                            {tasks.filter(t => t.context !== "Urgente").length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-6">
                                                    Sin tareas aquí. Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">⌘K</kbd> para agregar una.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* ====== LOGISTICS ====== */}
                            <TabsContent value="logistics" className="mt-0 pt-2">
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <StatCard label="Items" value={shopping.length} icon={ShoppingCart} gradient="stat-gradient-1" delay={0} />
                                        <StatCard label="Comprados" value={shopping.filter(s => s.status === "done").length} icon={Check} gradient="stat-gradient-2" delay={60} />
                                        <StatCard label="Pendientes" value={shopping.filter(s => s.status !== "done").length} icon={ListTodo} gradient="stat-gradient-3" delay={120} />
                                        <StatCard label="Total Est." value={`$${shoppingTotal.toFixed(0)}`} icon={TrendingUp} gradient="stat-gradient-4" delay={180} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(
                                            shopping.reduce((acc, s) => {
                                                const cat = s.category || "Sin Categoría"
                                                if (!acc[cat]) acc[cat] = []
                                                acc[cat].push(s)
                                                return acc
                                            }, {} as Record<string, ItemData[]>)
                                        ).map(([cat, catItems], idx) => (
                                            <div key={cat} className="space-y-3 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold">{cat}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            ${catItems.reduce((s, i) => s + (i.cost || 0), 0).toFixed(2)}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs">{catItems.length}</Badge>
                                                    </div>
                                                </div>
                                                <div className="grid gap-2 stagger-children">
                                                    {catItems.map(s => (
                                                        <ShoppingItem key={s.id} item={s} onToggle={() => handleToggle(s.id)} onToggleVisibility={() => handleToggleVis(s.id)} onDelete={() => handleDelete(s.id)} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ====== CALENDAR ====== */}
                            <TabsContent value="calendar" className="mt-0 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 animate-fade-in">
                                        <Card className="card-hover">
                                            <CardContent className="p-4 flex justify-center">
                                                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="md:col-span-2 space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
                                        <h3 className="text-lg font-bold">
                                            {date?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                                        </h3>

                                        {events.length > 0 ? (
                                            <div className="space-y-3 stagger-children">
                                                {events.map(ev => (
                                                    <Card key={ev.id} className="border-l-4 border-l-primary card-hover">
                                                        <CardContent className="p-4 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium text-sm">{ev.title}</p>
                                                                <p className="text-xs text-muted-foreground">{ev.context || "Todo el día"}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className={ev.visibility === "shared" ? "text-blue-500 border-blue-500/50" : ""}>
                                                                    {ev.visibility === "shared" ? "Compartido" : "Personal"}
                                                                </Badge>
                                                                <button onClick={() => handleDelete(ev.id)} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card className="animate-fade-in">
                                                <CardContent className="p-10 text-center text-muted-foreground">
                                                    <CalendarIcon className="size-10 mx-auto mb-3 opacity-20" />
                                                    <p className="font-medium">Sin eventos</p>
                                                    <p className="text-xs mt-1">Usa <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">⌘K</kbd> → Evento para agregar uno.</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {projects.filter(p => p.status === "active").length > 0 && (
                                            <>
                                                <Separator className="my-4" />
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Proyectos Activos</h4>
                                                <div className="space-y-2 stagger-children">
                                                    {projects.filter(p => p.status === "active").map(p => (
                                                        <Card key={p.id} className="border-l-4 border-l-amber-500 card-hover">
                                                            <CardContent className="p-4 flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-medium text-sm">{p.title}</p>
                                                                    <p className="text-xs text-muted-foreground">{p.progress || 0}% completado</p>
                                                                </div>
                                                                <Badge variant="outline">Proyecto</Badge>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </>
                                        )}
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
