"use server";
import bcryptjs from "bcryptjs";

import { registerSchema } from "@/validations/contact";
import { prisma } from "../prisma";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
};

// バリデーションエラー処理
function handleValidationError(error: any): ActionState {
  const { fieldErrors, formErrors } = error.flatten();
  // zodの仕様でパスワード一致確認のエラーは formErrorsで渡ってくる
  // formErrorsがある場合は、confirmPasswordフィールドにエラーを追加
  if (formErrors.length > 0) {
    return {
      success: false,
      errors: { ...fieldErrors, confirmPassword: formErrors },
    };
  }
  return { success: false, errors: fieldErrors };
}
// カスタムエラー処理
function handleError(customErrors: Record<string, string[]>): ActionState {
  return { success: false, errors: customErrors };
}

export async function CreateUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  //formから返ってきた値を取得
  const rawFormData = Object.fromEntries(
    ["name", "email", "password", "confirmPassword"].map((filed) => [
      filed,
      formData.get(filed),
    ])
  ) as Record<string, string>;

  //バリデーション
  const validationResult = registerSchema.safeParse(rawFormData);
  if (!validationResult.success) {
    return handleValidationError(validationResult.error);
  }

  //DBにメールアドレスが登録されているか確認
  const existingUser = await prisma.user.findUnique({
    where: { email: rawFormData.email },
  });
  if (existingUser) {
    return handleError({
      email: ["このメールアドレスはすでに使用されています。"],
    });
  }

  //DBに登録
  const hashedPassword = await bcryptjs.hash(rawFormData.password, 12);
  await prisma.user.create({
    data: {
      name: rawFormData.name,
      email: rawFormData.email,
      password: hashedPassword,
    },
  });

  //dashboardにリダイレクト
  await signIn("credentials", {
    ...Object.fromEntries(formData),
    redirect: false,
  });
  redirect("/dashboard");
}
