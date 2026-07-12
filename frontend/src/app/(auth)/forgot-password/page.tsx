import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Cognify AI",
  description: "Reset your Cognify AI password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
