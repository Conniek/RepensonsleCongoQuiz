import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import type { Metadata } from "next";
import OnboardingClient from "./onboarding-client";
import "./onboarding.css";

export async function generateStaticParams() {
  return LANGUES.map((langue) => ({ langue }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}): Promise<Metadata> {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).onboarding.titre, robots: { index: false } };
}

export default async function Onboarding({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();

  return <OnboardingClient langue={langue} />;
}
