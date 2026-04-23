import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

/**
 * 受保护目录 —— 禁止通过 URL 直接访问的路径
 * 即使 Nginx/Cloudflare 配置错误暴露了这些目录，middleware 也会拦截
 */
const BLOCKED_PATHS = ["/private-assets", "/scripts", "/_posts"];

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const blocked of BLOCKED_PATHS) {
    if (pathname.startsWith(blocked)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
