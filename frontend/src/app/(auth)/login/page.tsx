import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Cognify AI",
  description: "Sign in to your Cognify AI account and start generating beautiful interfaces with AI.",
};

export default function LoginPage() {
  return <LoginForm />;
}
