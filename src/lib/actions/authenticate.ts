"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      console.log(error);
      switch (error.message) {
        case "CredentialsSignin":
          return "メールアドレスまたはパスワードが正しくありません";
        default:
          return "エラーが発生しました。";
      }
    }
    throw error;
  }
}
