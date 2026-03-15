import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = new URLSearchParams(searchParams);

  try {
    const response = await fetch(
      `http://localhost:8000/api/apartments/?${params}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return Response.json(
      { error: "Failed to fetch apartments" },
      { status: 500 },
    );
  }
}
