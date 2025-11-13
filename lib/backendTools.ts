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
    save_vehicle_data: "/tools/save-vehicle-data",
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
    if (isDev) {
      console.log(`🔧 Llamando a ${backendUrl}${endpoint}`, params);
    }

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

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