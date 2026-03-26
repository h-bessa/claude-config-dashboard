"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function authenticate(formData: FormData) {
  const password = formData.get("password") as string;
  const expected = process.env.AUTH_PASSWORD || "hydris";

  if (password === expected) {
    const cookieStore = await cookies();
    cookieStore.set("auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    redirect("/");
  }

  return { error: "Wrong password" };
}
