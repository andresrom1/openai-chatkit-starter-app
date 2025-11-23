export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const cookieHeader = request.headers.get("cookie");
    const userId = getCookieValue(cookieHeader, "chatkit_session_id");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el thread más reciente del usuario
    const apiUrl = `https://api.openai.com/v1/chatkit/threads?user=${userId}&limit=1&order=desc`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const currentThread = data.data?.[0] || null;

    return new Response(
      JSON.stringify({ 
        thread_id: currentThread?.id || null,
        thread: currentThread 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching current thread:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch current thread" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function getCookieValue(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.split("=");
    if (!rawName || rest.length === 0) continue;
    if (rawName.trim() === name) {
      return rest.join("=").trim();
    }
  }
  return null;
}