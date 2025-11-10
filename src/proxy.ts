import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Named export for Next.js proxy convention
export const proxy = createMiddleware(routing);

// Keep matcher config identical to previous middleware
export const config = {
  matcher: ["/", "/(es|en)/:path*"],
};

// Default export for compatibility
export default proxy;
