"use server";

type ActionState = {
  success: boolean;
  error: Record<string, string[]>;
};

export async function CreateUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {}
