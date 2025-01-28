import { AUTH_COOKIE_KEY } from "@/features/auth/constans";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!userId || !secret) {
        return new NextResponse("Missing fields", { status: 400 });
    }

    const { account } = await createAdminClient();
    const session = await account.createSession(userId, secret);

    (await cookies()).set(AUTH_COOKIE_KEY, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
}