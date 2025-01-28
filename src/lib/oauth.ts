"use server";

import { headers } from "next/headers";
import { createAdminClient } from "./appwrite";
import { OAuthProvider } from "node-appwrite";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
    const { account } = await createAdminClient();
    const origin = (await headers()).get("origin");
    const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Github,
        `${origin}/oauth`,
        `${origin}/sign-up`,
    );

    return redirect(redirectUrl);
}

export async function signInWithGoogle() {
    const { account } = await createAdminClient();
    const origin = (await headers()).get("origin");
    const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        `${origin}/oauth`,
        `${origin}/sign-up`,
    );

    return redirect(redirectUrl);
}