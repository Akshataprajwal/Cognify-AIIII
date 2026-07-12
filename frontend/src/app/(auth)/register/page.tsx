import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — Cognify AI",
  description: "Create your free Cognify AI account and start building stunning UIs with AI in seconds.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
