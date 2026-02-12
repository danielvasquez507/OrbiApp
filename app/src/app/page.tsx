"use client"

import {
  Bell,
  LayoutGrid,
  ListTodo,
  Plus,
  Search,
  ShoppingCart,
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

function TaskItem({ text, context }: { text: string, context: "Casa" | "Trabajo" | "Urgente" }) {
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

export default function Home() {
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
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="projects" className="gap-2">
                <LayoutGrid className="size-4" /> Proyectos
              </TabsTrigger>
              <TabsTrigger value="operations" className="gap-2">
                <ListTodo className="size-4" /> Operativo
              </TabsTrigger>
              <TabsTrigger value="logistics" className="gap-2">
                <ShoppingCart className="size-4" />  Logística
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
                    <ProjectCard title="Renovación Cocina" progress={35} status="active" />
                    <ProjectCard title="Viaje a Japón" progress={10} status="hold" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-blue-500" /> En Progreso
                    </h3>
                    <ProjectCard title="Web Personal v2" progress={65} status="active" />
                    <ProjectCard title="Trámite Pasaporte" progress={80} status="urgent" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" /> Completado
                    </h3>
                    <ProjectCard title="Mudanza" progress={100} status="done" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operations" className="mt-0 pt-4">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Hoy, 12 Feb</h2>
                    <p className="text-muted-foreground">Tienes 5 tareas pendientes para hoy.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Prioritario</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-1 p-2">
                      <TaskItem text="Pagar la luz" context="Urgente" />
                      <TaskItem text="Enviar reporte mensual" context="Trabajo" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Rutinas</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-1 p-2">
                      <TaskItem text="Leer 30 mins" context="Casa" />
                      <TaskItem text="Hacer ejercicio" context="Casa" />
                      <TaskItem text="Revisar correos pendientes" context="Trabajo" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="logistics" className="mt-0 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Supermercado</h3>
                      <Badge variant="secondary">8 items</Badge>
                    </div>
                    <div className="grid gap-2">
                      <ShoppingItem name="Leche Deslactosada" price="$2.50" category="Lácteos" />
                      <ShoppingItem name="Pan Integral" price="$1.80" category="Panadería" />
                      <ShoppingItem name="Huevos (cartón)" price="$4.20" category="Lácteos" />
                      <ShoppingItem name="Manzanas" price="$3.00" category="Frutas" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Hardware Store</h3>
                      <Badge variant="secondary">3 items</Badge>
                    </div>
                    <div className="grid gap-2">
                      <ShoppingItem name="Bombillos LED x4" price="$12.00" category="Hogar" />
                      <ShoppingItem name="Cinta métrica" price="$5.50" category="Herramientas" />
                      <ShoppingItem name="Pilas AA" price="$8.00" category="Varios" />
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
