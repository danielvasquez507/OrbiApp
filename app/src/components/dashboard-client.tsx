"use client"

import {
    Bell,
    CalendarIcon,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Globe,
    LayoutGrid,
    ListTodo,
    Lock,
    Loader2,
    MoreHorizontal,
    Pause,
    Plus,
    ShoppingCart,
    Trash2,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react"
import * as React from "react"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { QuickCapture } from "@/components/quick-capture"
import { toggleItemStatus, toggleVisibility, deleteItem, createItem } from "@/app/actions"
import { toast } from "sonner"

// --- Tipos ---
type ItemData = {
    id: string; title: string; description: string | null; type: string; status: string
    context: string | null; progress: number | null; cost: number | null; category: string | null
    date: string | null; isShared: boolean; visibility: string; parentId: string | null; children?: ItemData[]
}

// === HOOK DE PRESIÓN PROLONGADA ===
function useLongPress(callback: () => void, ms = 500) {
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const callbackRef = React.useRef(callback)
    callbackRef.current = callback

    const start = React.useCallback((e: React.TouchEvent | React.MouseEvent) => {
        // Prevenir el comportamiento por defecto solo en táctil para evitar la selección de texto
        if ('touches' in e) {
            // No prevenir el comportamiento por defecto aquí porque rompe el desplazamiento; manejado vía CSS
        }
        timerRef.current = setTimeout(() => {
            callbackRef.current()
            // Vibrar si está disponible
            if (navigator.vibrate) navigator.vibrate(30)
        }, ms)
    }, [ms])

    const stop = React.useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    return {
        onTouchStart: start,
        onTouchEnd: stop,
        onTouchMove: stop,
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
    }
}

// === SWIPEABLE WRAPPER ===
function SwipeableItem({ children, onDelete, className = "" }: {
    children: React.ReactNode; onDelete: () => void; className?: string
}) {
    const [translateX, setTranslateX] = React.useState(0)
    const [swiping, setSwiping] = React.useState(false)
    const startXRef = React.useRef(0)
    const startYRef = React.useRef(0)
    const isHorizontalRef = React.useRef<boolean | null>(null)

    function handleTouchStart(e: React.TouchEvent) {
        startXRef.current = e.touches[0].clientX
        startYRef.current = e.touches[0].clientY
        isHorizontalRef.current = null
        setSwiping(true)
    }
    function handleTouchMove(e: React.TouchEvent) {
        if (!swiping) return
        const dx = e.touches[0].clientX - startXRef.current
        const dy = e.touches[0].clientY - startYRef.current
        if (isHorizontalRef.current === null) {
            isHorizontalRef.current = Math.abs(dx) > Math.abs(dy)
            if (!isHorizontalRef.current) { setSwiping(false); return }
        }
        if (!isHorizontalRef.current) return
        const clamped = Math.min(0, Math.max(-100, dx))
        setTranslateX(clamped)
    }
    function handleTouchEnd() {
        if (translateX < -70) {
            setTranslateX(-100)
        } else {
            setTranslateX(0)
        }
        setSwiping(false)
    }
    function handleDeleteClick() {
        setTranslateX(0)
        onDelete()
    }

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            {/* Delete action behind */}
            <div className="absolute inset-y-0 right-0 w-[100px] flex items-center justify-center bg-destructive text-destructive-foreground">
                <button onClick={handleDeleteClick} className="flex flex-col items-center gap-0.5 p-2">
                    <Trash2 className="size-5" />
                    <span className="text-[10px] font-semibold">Eliminar</span>
                </button>
            </div>
            {/* Content */}
            <div
                className="relative bg-background"
                style={{ transform: `translateX(${translateX}px)`, transition: swiping ? 'none' : 'transform 0.25s ease-out' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    )
}

// === PULL TO REFRESH ===
function usePullToRefresh() {
    const router = useRouter()
    const [pulling, setPulling] = React.useState(false)
    const [pullY, setPullY] = React.useState(0)
    const [refreshing, setRefreshing] = React.useState(false)
    const startYRef = React.useRef(0)
    const threshold = 80

    const handlers = {
        onTouchStart: (e: React.TouchEvent) => {
            if (window.scrollY === 0) {
                startYRef.current = e.touches[0].clientY
                setPulling(true)
            }
        },
        onTouchMove: (e: React.TouchEvent) => {
            if (!pulling || window.scrollY > 0) return
            const dy = e.touches[0].clientY - startYRef.current
            if (dy > 0) setPullY(Math.min(dy * 0.5, threshold * 1.5))
        },
        onTouchEnd: () => {
            if (pullY >= threshold && !refreshing) {
                setRefreshing(true)
                router.refresh()
                setTimeout(() => { setRefreshing(false); setPullY(0) }, 1000)
            } else {
                setPullY(0)
            }
            setPulling(false)
        },
    }
    return { handlers, pullY, refreshing }
}

// === HOJA DE ACCIÓN DEL ÍTEM (Hoja inferior al presionar prolongadamente) ===
function ItemActionSheet({ item, open, onOpenChange }: {
    item: ItemData | null; open: boolean; onOpenChange: (v: boolean) => void
}) {
    if (!item) return null
    const currentItem = item // capturar para cierres (closures)

    const statuses = [
        { value: "active", label: "Activo", icon: Check, color: "text-emerald-500" },
        { value: "urgent", label: "Urgente", icon: Zap, color: "text-red-500" },
        { value: "hold", label: "En Espera", icon: Pause, color: "text-amber-500" },
        { value: "done", label: "Completado", icon: Check, color: "text-blue-500" },
    ]

    const contexts = [
        { value: "Casa", label: "🏠 Casa" },
        { value: "Trabajo", label: "💼 Trabajo" },
        { value: "Urgente", label: "🔴 Urgente" },
    ]

    async function handleStatusChange(newStatus: string) {
        if (newStatus === "done" && currentItem.status !== "done") {
            await toggleItemStatus(currentItem.id)
        } else if (newStatus !== "done" && currentItem.status === "done") {
            await toggleItemStatus(currentItem.id)
        }
        toast.success(`Estado: ${newStatus}`)
        onOpenChange(false)
    }

    async function handleVisibility() {
        await toggleVisibility(currentItem.id)
        toast.success("Visibilidad cambiada")
        onOpenChange(false)
    }

    async function handleDelete() {
        await deleteItem(currentItem.id)
        toast.success("Eliminado")
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-safe">
                <SheetHeader className="text-left pb-4">
                    <SheetTitle className="text-base truncate pr-8">{item.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                        <span>·</span>
                        <span>{item.visibility === "shared" ? "👫 Compartido" : "🔒 Personal"}</span>
                    </SheetDescription>
                </SheetHeader>

                {/* Status */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</p>
                    <div className="grid grid-cols-2 gap-2">
                        {statuses.map(s => (
                            <button
                                key={s.value}
                                onClick={() => handleStatusChange(s.value)}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${item.status === s.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    }`}
                            >
                                <s.icon className={`size-4 ${item.status === s.value ? "text-primary" : s.color}`} />
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Context / Priority */}
                {(item.type === "TASK" || item.type === "EVENT") && (
                    <div className="space-y-3 mt-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contexto</p>
                        <div className="flex gap-2">
                            {contexts.map(c => (
                                <button
                                    key={c.value}
                                    className={`flex-1 p-3 rounded-xl border text-sm font-medium text-center transition-all ${item.context === c.value
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visibility */}
                <div className="space-y-3 mt-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibilidad</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={item.visibility === "shared" ? handleVisibility : undefined}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${item.visibility === "personal"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                }`}
                        >
                            <Lock className="size-4" /> Personal
                        </button>
                        <button
                            onClick={item.visibility === "personal" ? handleVisibility : undefined}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${item.visibility === "shared"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                }`}
                        >
                            <Users className="size-4" /> Compartido
                        </button>
                    </div>
                </div>

                {/* Delete */}
                <div className="mt-6 pt-4 border-t">
                    <Button variant="destructive" className="w-full gap-2" onClick={handleDelete}>
                        <Trash2 className="size-4" /> Eliminar Item
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// === TARJETA DE ESTADÍSTICAS ===
function StatCard({ label, value, icon: Icon, gradient, delay }: {
    label: string; value: string | number; icon: any; gradient: string; delay: number
}) {
    return (
        <div className={`${gradient} rounded-xl p-3 border animate-fade-in card-hover`} style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-xl font-bold mt-0.5">{value}</p>
                </div>
                <div className="size-8 rounded-lg bg-background/60 flex items-center justify-center">
                    <Icon className="size-4 text-primary" />
                </div>
            </div>
        </div>
    )
}

// === TARJETA DE PROYECTO ===
function ProjectCard({ item, children: subtasks, onLongPress }: {
    item: ItemData; children?: ItemData[]; onLongPress: () => void
}) {
    const longPress = useLongPress(onLongPress)
    const [expanded, setExpanded] = React.useState(false)
    const tasks = subtasks || []
    const done = tasks.filter(s => s.status === "done").length

    return (
        <Card className="card-hover animate-fade-in overflow-hidden touch-manipulation" {...longPress}>
            <CardHeader className="p-3 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {tasks.length > 0 && (
                            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground shrink-0">
                                {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </button>
                        )}
                        <span className="text-sm font-semibold truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {item.visibility === "shared" && <Users className="size-3 text-blue-500" />}
                        <Badge variant={item.status === "active" ? "default" : item.status === "urgent" ? "destructive" : "secondary"} className="text-[10px] h-5">
                            {item.status === "active" ? "Activo" : item.status === "hold" ? "Espera" : item.status === "done" ? "Listo" : item.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-progress" style={{ width: `${item.progress || 0}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>{item.progress || 0}%</span>
                    {tasks.length > 0 && <span>{done}/{tasks.length} pasos</span>}
                </div>

                {expanded && tasks.length > 0 && (
                    <div className="space-y-1 pt-1 border-t">
                        {tasks.map(sub => <SubtaskItem key={sub.id} item={sub} />)}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function SubtaskItem({ item }: { item: ItemData }) {
    const [pending, setPending] = React.useState(false)
    async function handleToggle() { setPending(true); await toggleItemStatus(item.id); setPending(false) }
    return (
        <div className="flex items-center gap-2 py-1.5 px-1">
            <Checkbox checked={item.status === "done"} onCheckedChange={handleToggle} disabled={pending} className="size-4" />
            <span className={`text-xs flex-1 ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>{item.title}</span>
        </div>
    )
}

// === ÍTEM DE TAREA ===
function TaskItem({ item, onToggle, onLongPress }: {
    item: ItemData; onToggle: () => void; onLongPress: () => void
}) {
    const longPress = useLongPress(onLongPress)
    return (
        <div className="flex items-center gap-3 p-3 hover:bg-muted/50 active:bg-muted rounded-xl transition-all animate-fade-in touch-manipulation" {...longPress}>
            <Checkbox checked={item.status === "done"} onCheckedChange={onToggle} className="size-5" />
            <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium block truncate ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {item.visibility === "shared" && <Users className="size-3 text-blue-500" />}
                <Badge variant="outline" className={`text-[10px] h-5 ${item.context === "Urgente" ? "text-red-500 border-red-500/40" :
                    item.context === "Trabajo" ? "text-blue-500 border-blue-500/40" :
                        "text-emerald-500 border-emerald-500/40"
                    }`}>{item.context || "General"}</Badge>
            </div>
        </div>
    )
}

// === ÍTEM DE COMPRA ===
function ShoppingItem({ item, onToggle, onLongPress }: {
    item: ItemData; onToggle: () => void; onLongPress: () => void
}) {
    const longPress = useLongPress(onLongPress)
    return (
        <div className={`flex items-center justify-between p-3 border rounded-xl transition-all animate-fade-in touch-manipulation active:scale-[0.98] ${item.status === "done" ? "opacity-50 bg-muted/20" : "bg-card"}`} {...longPress}>
            <div className="flex items-center gap-3 min-w-0">
                <Checkbox checked={item.status === "done"} onCheckedChange={onToggle} className="size-5" />
                <div className="min-w-0">
                    <p className={`font-medium text-sm truncate ${item.status === "done" ? "line-through" : ""}`}>{item.title}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{item.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {item.visibility === "shared" && <Users className="size-3 text-blue-500" />}
                <p className="font-mono text-sm font-semibold">${item.cost?.toFixed(2) || "0.00"}</p>
            </div>
        </div>
    )
}

// === AGREGAR SUBTAREA ===
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
                <button className="text-xs text-muted-foreground flex items-center gap-1 px-3 py-1 hover:text-foreground transition-colors">
                    <Plus className="size-3" /> Subtarea
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] mx-4">
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
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? "Guardando..." : "Agregar"}</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// === FILTRO DE ESPACIO ===
function SpaceFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="inline-flex items-center rounded-xl border bg-card p-0.5 gap-0.5 text-xs shadow-sm">
            {[
                { key: "all", label: "Todo", icon: Globe },
                { key: "personal", label: "Mío", icon: Lock },
                { key: "shared", label: "Común", icon: Users },
            ].map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium ${value === key ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                        }`}
                >
                    <Icon className="size-3" /> {label}
                </button>
            ))}
        </div>
    )
}

// ============================================
// === PANEL PRINCIPAL (DASHBOARD) ===
// ============================================
export default function DashboardClient({ initialItems }: { initialItems: ItemData[] }) {
    const [items, setItems] = React.useState(initialItems)
    const [spaceFilter, setSpaceFilter] = React.useState("all")
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [activeTab, setActiveTab] = React.useState("operations")
    const [fabOpen, setFabOpen] = React.useState(false)

    // Hoja de acción al presionar prolongadamente
    const [sheetItem, setSheetItem] = React.useState<ItemData | null>(null)
    const [sheetOpen, setSheetOpen] = React.useState(false)

    // Pull-to-refresh
    const { handlers: pullHandlers, pullY, refreshing } = usePullToRefresh()

    function openItemSheet(item: ItemData) {
        setSheetItem(item)
        setSheetOpen(true)
    }

    React.useEffect(() => { setItems(initialItems) }, [initialItems])

    // Filtrados
    const filtered = spaceFilter === "all" ? items : items.filter(i => i.visibility === spaceFilter)
    const projects = filtered.filter(i => i.type === "PROJECT" && !i.parentId)
    const tasks = filtered.filter(i => i.type === "TASK" && !i.parentId)
    const shopping = filtered.filter(i => i.type === "SHOPPING")
    const events = filtered.filter(i => i.type === "EVENT")
    const getChildren = (pid: string) => items.filter(i => i.parentId === pid)

    // Estadísticas
    const shoppingTotal = shopping.reduce((sum, s) => sum + (s.cost || 0), 0)
    const urgentCount = items.filter(i => i.context === "Urgente" && i.status !== "done" && !i.parentId).length

    async function handleToggle(id: string) { await toggleItemStatus(id) }

    async function handleSwipeDelete(id: string) {
        await deleteItem(id)
        toast.success("Eliminado")
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-6" {...pullHandlers}>
            {/* Pull-to-refresh indicator */}
            {(pullY > 0 || refreshing) && (
                <div className="flex justify-center items-center transition-all overflow-hidden sm:hidden" style={{ height: pullY }}>
                    {refreshing
                        ? <Loader2 className="size-5 text-primary animate-spin" />
                        : <span className="text-xs text-muted-foreground">{pullY >= 80 ? "↻ Suelta para refrescar" : "↓ Desliza para refrescar"}</span>
                    }
                </div>
            )}
            {/* === HEADER (compact, mobile-first) === */}
            <header className="border-b h-12 flex items-center px-2 sm:px-3 justify-between bg-card/70 glass sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                        O
                    </div>
                    <span className="font-bold text-base tracking-tight gradient-text">Orbi</span>
                </div>

                <div className="flex-1 mx-3 max-w-lg hidden sm:block">
                    <QuickCapture />
                </div>

                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="text-muted-foreground size-8 relative">
                        <Bell className="size-4" />
                        {urgentCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 size-3.5 bg-destructive text-destructive-foreground rounded-full text-[8px] flex items-center justify-center font-bold">
                                {urgentCount}
                            </span>
                        )}
                    </Button>
                    <Avatar className="size-7 border ml-1">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">D</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            {/* === TABS + FILTER === */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Desktop top tabs — hidden on mobile where bottom tab bar is used */}
                <div className="hidden sm:flex sticky top-12 z-10 bg-background/90 glass border-b px-3 py-2 items-center justify-between gap-2">
                    <TabsList className="h-9 grid grid-cols-4 flex-1 max-w-[400px]">
                        <TabsTrigger value="projects" className="text-xs gap-1 px-2">
                            <LayoutGrid className="size-3.5" /> Proyectos
                        </TabsTrigger>
                        <TabsTrigger value="operations" className="text-xs gap-1 px-2">
                            <ListTodo className="size-3.5" /> Tareas
                        </TabsTrigger>
                        <TabsTrigger value="logistics" className="text-xs gap-1 px-2">
                            <ShoppingCart className="size-3.5" /> Compras
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="text-xs gap-1 px-2">
                            <CalendarIcon className="size-3.5" /> Agenda
                        </TabsTrigger>
                    </TabsList>
                    <SpaceFilter value={spaceFilter} onChange={setSpaceFilter} />
                </div>

                {/* Mobile filter bar */}
                <div className="sm:hidden sticky top-12 z-10 bg-background/90 glass border-b px-2 py-1.5 flex items-center justify-between">
                    <SpaceFilter value={spaceFilter} onChange={setSpaceFilter} />
                </div>

                <div className="px-2 sm:px-4 pt-3 sm:pt-4 max-w-4xl mx-auto">

                    {/* ====== PROJECTS ====== */}
                    <TabsContent value="projects" className="mt-0 space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <StatCard label="Activos" value={projects.filter(p => p.status === "active").length} icon={TrendingUp} gradient="stat-gradient-1" delay={0} />
                            <StatCard label="En Espera" value={projects.filter(p => p.status === "hold").length} icon={Clock} gradient="stat-gradient-3" delay={60} />
                        </div>

                        {/* Active */}
                        {projects.filter(p => p.status === "active" || p.status === "urgent").length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-blue-500" /> En Progreso
                                </p>
                                <div className="space-y-2">
                                    {projects.filter(p => p.status === "active" || p.status === "urgent").map(p => (
                                        <div key={p.id}>
                                            <ProjectCard item={p} children={getChildren(p.id)} onLongPress={() => openItemSheet(p)} />
                                            <AddSubtaskDialog parentId={p.id} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hold */}
                        {projects.filter(p => p.status === "hold").length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-amber-500" /> Planificación
                                </p>
                                <div className="space-y-2">
                                    {projects.filter(p => p.status === "hold").map(p => (
                                        <div key={p.id}>
                                            <ProjectCard item={p} children={getChildren(p.id)} onLongPress={() => openItemSheet(p)} />
                                            <AddSubtaskDialog parentId={p.id} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Done */}
                        {projects.filter(p => p.status === "done").length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-emerald-500" /> Completado
                                </p>
                                <div className="space-y-2">
                                    {projects.filter(p => p.status === "done").map(p => (
                                        <ProjectCard key={p.id} item={p} children={getChildren(p.id)} onLongPress={() => openItemSheet(p)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {projects.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <LayoutGrid className="size-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Sin proyectos. Usa ⌘K para crear uno.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ====== OPERATIONS ====== */}
                    <TabsContent value="operations" className="mt-0 space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <StatCard label="Pendientes" value={tasks.filter(t => t.status !== "done").length} icon={ListTodo} gradient="stat-gradient-1" delay={0} />
                            <StatCard label="Urgentes" value={tasks.filter(t => t.context === "Urgente" && t.status !== "done").length} icon={Zap} gradient="stat-gradient-4" delay={60} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold tracking-tight">
                                Hoy, {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Desliza ← para eliminar · Mantén presionado para editar
                            </p>
                        </div>

                        {/* Urgent */}
                        {tasks.filter(t => t.context === "Urgente" && t.status !== "done").length > 0 && (
                            <Card className="border-red-500/30">
                                <CardHeader className="p-3 pb-1">
                                    <CardTitle className="text-xs font-semibold uppercase text-red-500 tracking-wider flex items-center gap-1.5">
                                        <Zap className="size-3" /> Prioritario
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-1.5 pt-0 space-y-0.5">
                                    {tasks.filter(t => t.context === "Urgente" && t.status !== "done").map(t => (
                                        <SwipeableItem key={t.id} onDelete={() => handleSwipeDelete(t.id)}>
                                            <TaskItem item={t} onToggle={() => handleToggle(t.id)} onLongPress={() => openItemSheet(t)} />
                                        </SwipeableItem>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Regular tasks */}
                        <Card>
                            <CardHeader className="p-3 pb-1">
                                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">📋 Tareas</CardTitle>
                            </CardHeader>
                            <CardContent className="p-1.5 pt-0 space-y-0.5">
                                {tasks.filter(t => t.context !== "Urgente").map(t => (
                                    <SwipeableItem key={t.id} onDelete={() => handleSwipeDelete(t.id)}>
                                        <TaskItem item={t} onToggle={() => handleToggle(t.id)} onLongPress={() => openItemSheet(t)} />
                                    </SwipeableItem>
                                ))}
                                {tasks.filter(t => t.context !== "Urgente").length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-6">
                                        Sin tareas. Presiona <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">⌘K</kbd> para agregar.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Done section */}
                        {tasks.filter(t => t.status === "done").length > 0 && (
                            <details className="group">
                                <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1 py-2">
                                    <ChevronRight className="size-3 group-open:rotate-90 transition-transform" />
                                    {tasks.filter(t => t.status === "done").length} completadas
                                </summary>
                                <div className="space-y-0.5 ml-1">
                                    {tasks.filter(t => t.status === "done").map(t => (
                                        <SwipeableItem key={t.id} onDelete={() => handleSwipeDelete(t.id)}>
                                            <TaskItem item={t} onToggle={() => handleToggle(t.id)} onLongPress={() => openItemSheet(t)} />
                                        </SwipeableItem>
                                    ))}
                                </div>
                            </details>
                        )}
                    </TabsContent>

                    {/* ====== LOGISTICS ====== */}
                    <TabsContent value="logistics" className="mt-0 space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <StatCard label="Pendientes" value={shopping.filter(s => s.status !== "done").length} icon={ShoppingCart} gradient="stat-gradient-1" delay={0} />
                            <StatCard label="Total" value={`$${shoppingTotal.toFixed(0)}`} icon={TrendingUp} gradient="stat-gradient-4" delay={60} />
                        </div>

                        <p className="text-xs text-muted-foreground">Mantén presionado para editar un item.</p>

                        {Object.entries(
                            shopping.reduce((acc, s) => {
                                const cat = s.category || "Otros"
                                if (!acc[cat]) acc[cat] = []
                                acc[cat].push(s)
                                return acc
                            }, {} as Record<string, ItemData[]>)
                        ).map(([cat, catItems], idx) => (
                            <div key={cat} className="space-y-2 animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">{cat}</h3>
                                    <span className="text-[11px] text-muted-foreground font-mono">${catItems.reduce((s, i) => s + (i.cost || 0), 0).toFixed(2)}</span>
                                </div>
                                <div className="space-y-1.5">
                                    {catItems.map(s => (
                                        <SwipeableItem key={s.id} onDelete={() => handleSwipeDelete(s.id)}>
                                            <ShoppingItem item={s} onToggle={() => handleToggle(s.id)} onLongPress={() => openItemSheet(s)} />
                                        </SwipeableItem>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {shopping.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShoppingCart className="size-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Lista vacía. Usa ⌘K para agregar compras.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ====== CALENDAR ====== */}
                    <TabsContent value="calendar" className="mt-0 space-y-3 sm:space-y-4">
                        <Card className="card-hover animate-fade-in">
                            <CardContent className="p-2 flex justify-center">
                                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
                            </CardContent>
                        </Card>

                        <h3 className="text-sm font-bold">
                            {date?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                        </h3>

                        {events.length > 0 ? (
                            <div className="space-y-2">
                                {events.map(ev => (
                                    <Card key={ev.id} className="border-l-4 border-l-primary card-hover" onClick={() => openItemSheet(ev)}>
                                        <CardContent className="p-3 flex justify-between items-center">
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{ev.title}</p>
                                                <p className="text-[11px] text-muted-foreground">{ev.context || "Todo el día"}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] shrink-0">
                                                {ev.visibility === "shared" ? "Común" : "Mío"}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    <CalendarIcon className="size-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Sin eventos hoy.</p>
                                </CardContent>
                            </Card>
                        )}

                        {projects.filter(p => p.status === "active").length > 0 && (
                            <>
                                <Separator />
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Proyectos activos</p>
                                <div className="space-y-2">
                                    {projects.filter(p => p.status === "active").map(p => (
                                        <Card key={p.id} className="border-l-4 border-l-amber-500 card-hover" onClick={() => openItemSheet(p)}>
                                            <CardContent className="p-3 flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-sm">{p.title}</p>
                                                    <p className="text-[11px] text-muted-foreground">{p.progress || 0}%</p>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">Proyecto</Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>

                </div>
            </Tabs>

            {/* === BOTTOM TAB BAR (mobile only) === */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 glass border-t sm:hidden bottom-nav">
                <div className="grid grid-cols-4 h-14">
                    {[
                        { key: "projects", label: "Proyectos", icon: LayoutGrid },
                        { key: "operations", label: "Tareas", icon: ListTodo },
                        { key: "logistics", label: "Compras", icon: ShoppingCart },
                        { key: "calendar", label: "Agenda", icon: CalendarIcon },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex flex-col items-center justify-center gap-0.5 transition-colors touch-manipulation ${activeTab === key ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            <Icon className={`size-5 ${activeTab === key ? "stroke-[2.5]" : ""}`} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </button>
                    ))}
                </div>
                <div className="h-safe" />
            </nav>

            {/* === FAB - Quick Capture (mobile only) === */}
            <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+12px)] right-4 z-30 sm:hidden">
                <QuickCapture fabMode />
            </div>

            {/* === ACTION SHEET (Long press result) === */}
            <ItemActionSheet item={sheetItem} open={sheetOpen} onOpenChange={setSheetOpen} />
        </div>
    )
}
