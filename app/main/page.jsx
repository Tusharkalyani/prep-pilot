"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { userProfile } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.role === "recruiter") {
      router.push("/main/recruiter/dashboard");
    } else if (userProfile?.role === "candidate") {
      router.push("/main/candidate/dashboard");
    }
  }, [userProfile, router]);

  return null;
}
