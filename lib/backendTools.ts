const isDev = process.env.NODE_ENV !== "production";

export async function executeBackendTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    console.error("❌ NEXT_PUBLIC_BACKEND_URL no está configurado");
    return {
      success: false,
      error: "Backend URL not configured",
    };
  }

  // Mapeo de tool names a endpoints del backend
  const endpointMap: Record<string, string> = {
    test_backend_connection: "/tools/test",
    identify_customer: "/tools/identify-customer",
    identify_vehicle: "/tools/identify-vehicle",
    // save_vehicle_data: "/tools/save-vehicle-data", reemplazada por 'identify_vehicle'
    get_coverage_options: "/tools/get-coverage-options",
    save_coverage_selection: "/tools/save-coverage-selection",
    create_pending_quote: "/tools/create-pending-quote",
    show_data_form: "/tools/show-data-form",
    show_vehicle_photos_form: "/tools/show-vehicle-photos-form",
    show_payment_form: "/tools/show-payment-form",
    finalize_policy: "/tools/finalize-policy",
  };

  const endpoint = endpointMap[toolName];

  if (!endpoint) {
    console.warn(`⚠️ Tool "${toolName}" no tiene endpoint configurado`);
    return {
      success: false,
      error: `Tool "${toolName}" not implemented`,
    };
  }

  try { 
      // Obtener el user ID (siempre disponible)
      const openaiUserId = typeof window !== 'undefined' 
        ? window.localStorage.getItem('openai_user_id') 
        : null;

      console.log('🔧 Backend tool:', toolName);
      console.log('👤 OpenAI User ID:', openaiUserId);

    // Obtener el thread_id actual
    const threadResponse = await fetch("/api/current-thread");
    let threadId = null;
    
    if (threadResponse.ok) {
      const threadData = await threadResponse.json();
      threadId = threadData.thread_id;
    }

    if (isDev) {
      console.log(`🧵 Thread ID:`, threadId);
    }

    if (isDev) {
      console.log(`🔧 Llamando a ${backendUrl}${endpoint}`, params);
    }

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        thread_id: threadId,
        ai_provider: "openai-chatkit",
        openai_user_id: openaiUserId ? openaiUserId : "user", //to be implemented 
      }),
    });

    console.log(`RESPONSE: `, response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      );
    }
    
    const data = await response.json();
    console.log(`✅ Respuesta del backend:`, data);

    if (isDev) {
      console.log(`✅ Respuesta del backend:`, data);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error llamando al backend:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}