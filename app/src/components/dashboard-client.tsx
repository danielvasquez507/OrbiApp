"use client"

import {
    Bell,
    LayoutGrid,
    ListTodo,
    Plus,
    Search,
    ShoppingCart,
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
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar } from "@/components/ui/calendar"

// --- Helper Components ---

function ProjectCard({ title, progress, status }: { title: string, progress: number, status: string }) {
    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{title}</CardTitle>
                    <Badge variant={status === "active" ? "default" : status === "urgent" ? "destructive" : "secondary"}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{progress}% Completado</p>
            </CardContent>
        </Card>
    )
}

function TaskItem({ text, context }: { text: string, context: string }) {
    return (
        <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg group transition-colors">
            <Checkbox id={text} />
            <div className="flex-1 space-y-1">
                <label
                    htmlFor={text}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {text}
                </label>
            </div>
            <Badge variant="outline" className={
                context === "Urgente" ? "text-destructive border-destructive" :
                    context === "Trabajo" ? "text-blue-500 border-blue-500" :
                        "text-green-500 border-green-500"
            }>{context}</Badge>
        </div>
    )
}

function ShoppingItem({ name, price, category }: { name: string, price: string, category: string }) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{category}</p>
                </div>
            </div>
            <p className="font-mono text-sm">{price}</p>
        </div>
    )
}

// --- Main Client Dashboard ---

export default function DashboardClient({ initialItems }: { initialItems: any[] }) {
    const [items] = React.useState(initialItems);
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    const projects = items.filter(i => i.type === "PROJECT");
    const tasks = items.filter(i => i.type === "TASK");
    const shopping = items.filter(i => i.type === "SHOPPING");

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
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Captura rápida (Idea, Tarea, Compra)..."
                            className="w-full bg-muted/50 pl-9 h-9 focus-visible:ring-1"
                        />
                        <div className="absolute right-1.5 top-1.5 flex gap-1">
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
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
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between overflow-x-auto">
                        <TabsList className="grid grid-cols-4 w-[540px]">
                            <TabsTrigger value="projects" className="gap-2">
                                <LayoutGrid className="size-4" /> Proyectos
                            </TabsTrigger>
                            <TabsTrigger value="operations" className="gap-2">
                                <ListTodo className="size-4" /> Operativo
                            </TabsTrigger>
                            <TabsTrigger value="logistics" className="gap-2">
                                <ShoppingCart className="size-4" />  Logística
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2">
                                <CalendarIcon className="size-4" /> Calendario
                            </TabsTrigger>
                        </TabsList>

                        <Button size="sm" className="gap-1">
                            <Plus className="size-4" /> Nuevo Item
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="container mx-auto px-4 pb-10">

                            <TabsContent value="projects" className="mt-0 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-yellow-500" /> Planificación
                                        </h3>
                                        {projects.filter(p => p.status === "hold").map(p => (
                                            <ProjectCard key={p.id} title={p.title} progress={p.progress || 0} status={p.status} />
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-blue-500" /> En Progreso
                                        </h3>
                                        {projects.filter(p => p.status === "active" || p.status === "urgent").map(p => (
                                            <ProjectCard key={p.id} title={p.title} progress={p.progress || 0} status={p.status} />
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500" /> Completado
                                        </h3>
                                        {projects.filter(p => p.status === "done").map(p => (
                                            <ProjectCard key={p.id} title={p.title} progress={p.progress || 0} status={p.status} />
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="operations" className="mt-0 pt-4">
                                <div className="max-w-3xl mx-auto space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-semibold tracking-tight">Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</h2>
                                        <p className="text-muted-foreground">Tienes {tasks.length} tareas pendientes.</p>
                                    </div>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Prioritario</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-1 p-2">
                                            {tasks.filter(t => t.context === "Urgente").map(t => (
                                                <TaskItem key={t.id} text={t.title} context={t.context} />
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Resto de Tareas</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-1 p-2">
                                            {tasks.filter(t => t.context !== "Urgente").map(t => (
                                                <TaskItem key={t.id} text={t.title} context={t.context} />
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="logistics" className="mt-0 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">Supermercado</h3>
                                            <Badge variant="secondary">{shopping.filter(s => s.category !== "Hogar").length} items</Badge>
                                        </div>
                                        <div className="grid gap-2">
                                            {shopping.filter(s => s.category !== "Hogar").map(s => (
                                                <ShoppingItem key={s.id} name={s.title} price={`$${s.cost?.toFixed(2)}`} category={s.category} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">Hogar / Hardware</h3>
                                            <Badge variant="secondary">{shopping.filter(s => s.category === "Hogar").length} items</Badge>
                                        </div>
                                        <div className="grid gap-2">
                                            {shopping.filter(s => s.category === "Hogar").map(s => (
                                                <ShoppingItem key={s.id} name={s.title} price={`$${s.cost?.toFixed(2)}`} category={s.category} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

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
                                        <h3 className="text-lg font-semibold">Agenda para {date?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                                        <div className="space-y-3">
                                            <Card className="border-l-4 border-l-primary">
                                                <CardContent className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-sm">Reunión de Sincronización</p>
                                                        <p className="text-xs text-muted-foreground">09:00 AM - 10:00 AM</p>
                                                    </div>
                                                    <Badge>Trabajo</Badge>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-l-4 border-l-yellow-500">
                                                <CardContent className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-sm">Fecha límite: Renovación Cocina</p>
                                                        <p className="text-xs text-muted-foreground">Todo el día</p>
                                                    </div>
                                                    <Badge variant="outline">Proyecto</Badge>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </ScrollArea>
                </Tabs>
            </main>
        </div>
    );
}
