import { prisma } from "@/lib/db";
import DashboardClient from "@/components/dashboard-client";

export default async function Home() {
  const items = await prisma.item.findMany({
    include: {
      children: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Serialize dates for client component
  const serialized = items.map(item => ({
    ...item,
    date: item.date?.toISOString() || null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    children: item.children?.map(child => ({
      ...child,
      date: child.date?.toISOString() || null,
      createdAt: child.createdAt.toISOString(),
      updatedAt: child.updatedAt.toISOString(),
    })),
  }));

  return <DashboardClient initialItems={serialized as any} />;
}
