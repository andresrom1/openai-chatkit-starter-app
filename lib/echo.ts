import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

/**
 * Adaptación de la documentación oficial de Laravel Reverb para Next.js.
 * Nota: Se utiliza 'process.env' en lugar de 'import.meta.env' debido a que
 * este proyecto corre sobre Next.js y no sobre Vite puro.
 */
if (typeof window !== 'undefined') {
    (window as any).Pusher = Pusher;
}

export const getEcho = () => {
    if (typeof window === 'undefined') return null;

    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    const host = process.env.NEXT_PUBLIC_REVERB_HOST;
    const port = process.env.NEXT_PUBLIC_REVERB_PORT;
    const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    return new Echo({
        broadcaster: 'reverb', // Según documentación oficial
        key: key,
        wsHost: host,
        wsPort: port ? parseInt(port) : 80,
        wssPort: port ? parseInt(port) : 443,
        forceTLS: scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        // Requerido para la autorización de canales privados en tu backend Laravel
        authEndpoint: `${backendUrl}/api/broadcasting/auth`,
    });
};