"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { userProfile } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) return; // ⛔ WAIT until data loads

    if (userProfile.role === "recruiter") {
      router.push("/main/recruiter/dashboard");
    } else if (userProfile.role === "candidate") {
      router.push("/main/candidate/dashboard");
    }
  }, [userProfile, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading dashboard...</p>
    </div>
  );
}
