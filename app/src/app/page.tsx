import { prisma } from "@/lib/db";
import DashboardClient from "@/components/dashboard-client";

export default async function Home() {
  // Fetch items from the database
  const items = await prisma.item.findMany({
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return <DashboardClient initialItems={items} />;
}
