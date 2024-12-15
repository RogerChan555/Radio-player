import { NextResponse } from "next/server";
import { verifySession } from "./lib/dal";

const protectedRoutes = ["/admin", "/admin/*"];
const publicRoutes = ["/auth/*", "/"];

export default async function middleware(req) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("admin-url", req.url);

    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const session = await verifySession();

    if (isProtectedRoute && !session?.isAuth) {
        return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
    }

    if (req.nextUrl.pathname === "/admin" && session?.isAuth) {
        return NextResponse.redirect(new URL("/admin/station", req.nextUrl));
    }

    if (
        req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/auth") ||
        req.nextUrl.pathname.startsWith("/api")
    ) {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
