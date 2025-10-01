"use server";

import { auth } from "@/lib/auth"
import { headers } from "next/headers";

export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
            email,
            password,
        }
    })
    return {
        success: true,
        message: "Signed in successfully"
    }

    } catch (error) {
        const e = error as Error

        return {
            success: false,
            message: { error: e.message || "An unknown error occured"}
        }
    }
}

export const signUp = async (email: string, password: string, name: string ) => {
    try {
            await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        }
    })

        return {
            sucess: true,
            message: "Signed up successfully"
        }
    } catch (error) {
        const e = error as Error

        return {
            success: false,
            message: e.message || "An unknown error occured"
        }
    }
}


export const signOut = async () => {
    const result = await auth.api.signOut({ headers: await headers()});
    return result;
};