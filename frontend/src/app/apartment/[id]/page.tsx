import { cookies } from "next/headers";
import { getApartmentById } from "@/services/api";
import { notFound } from "next/navigation";
import ApartmentDetailClient from "@/components/ApartmentDetailClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApartmentPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";

  let apartment = null;

  try {
    apartment = await getApartmentById(id);
  } catch (error) {
    console.error("Failed to fetch apartment:", error);
  }

  if (!apartment) {
    notFound();
  }

  return <ApartmentDetailClient apartment={apartment} theme={theme} />;
}
