"use server";

import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { Provider } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export const loginAction = async (email: string, password: string) => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const logOutAction = async () => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signOut();
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signUpAction = async (email: string, password: string) => {
  try {
    const { auth } = await createClient();

    const { data, error } = await auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error("Error signing up");

    await prisma.user.create({
      data: {
        id: userId,
        email,
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

const signInWith = (provider: Provider) => async () => {
    const { auth } = await createClient();

    const {data, error} = await auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${process.env.SITE_URL}/api/auth/callback`,
      },
    });
    if (error){
      console.log(error)
    }
    redirect(data.url!)
};
const signInWithGoogle = signInWith('google')
export { signInWithGoogle }