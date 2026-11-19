"use client";

import { useParams } from "next/navigation";
import { JoinScreen } from "@/components/onboarding/JoinScreen";

export default function JoinPage() {
  const params = useParams<{ code: string }>();
  return <JoinScreen code={params.code} />;
}
