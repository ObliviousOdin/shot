import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "shot";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "shot — screenshots for chat" },
      {
        name: "description",
        content:
          "A 6KB POSIX screenshot tool for AI chats. Image for visual apps, path for your coding agent. One-line install.",
      },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#0c0c0d" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "shot — screenshots for chat" },
      {
        property: "og:description",
        content: "Capture. Dual clipboard. Paste into chat. One command to install.",
      },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-bg px-6 text-fg">
      <div className="text-center">
        <p className="font-mono text-xs text-subtle">404</p>
        <h1 className="mt-2 text-xl font-medium">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-muted hover:text-fg">
          Back to shot
        </Link>
      </div>
    </main>
  ),
  component: () => (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            className:
              "!bg-elevated !text-fg !border-border !font-sans !shadow-none",
          }}
        />
        <Scripts />
      </body>
    </html>
  ),
});
