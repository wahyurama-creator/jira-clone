"use server";

// import { headers } from "next/headers";
import { createAdminClient } from "./appwrite";
import { OAuthProvider } from "node-appwrite";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
    const { account } = await createAdminClient();
    // const header = await headers();
    // const origin = header.get("origin");
    const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Github,
        `${process.env.NEXT_PUBLIC_APP_URL}/oauth`,
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    );

    return redirect(redirectUrl);
}

export async function signInWithGoogle() {
    const { account } = await createAdminClient();

    const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        `${process.env.NEXT_PUBLIC_APP_URL}/oauth`,
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    );

    return redirect(redirectUrl);
}