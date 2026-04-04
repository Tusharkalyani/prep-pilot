'use client';
import Image from "next/image";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Users, Sparkles, Target, BarChart2, Clock, Zap, Check, Search, FileText, ShieldCheck, Award, Briefcase } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuth } from "@/context/AuthContext"; // ✅ use your actual auth context

export default function Home() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { userProfile } = UserAuth(); // ✅ use userProfile instead of broken useUser

  const handleStartRecruiting = () => {
    router.push('/login');
  };

  useEffect(() => {
    // ✅ Only redirect if userProfile is fully loaded (not undefined)
    if (userProfile === undefined) return; // still loading
    if (userProfile === null) return;      // not logged in, stay on landing page

    // ✅ Fixed paths
    if (userProfile.role === 'recruiter') {
      router.push('/main/recruiter/dashboard');
    } else if (userProfile.role === 'candidate') {
      router.push('/main/candidate/dashboard');
    }
  }, [userProfile, router]);

  const clientLogos = [
    { logo: "/clientLogos/tata.png" },
    { logo: "/clientLogos/techmahindra.png" },
    { logo: "/clientLogos/eeshanya.png" },
    { logo: "/clientLogos/hrh.jpeg" },
    { logo: "/clientLogos/google.png" },
  ];

  const testimonials = [
    {
      quote: "From intuitive front-end design to seamless backend integration, the site is a true showcase of full-stack excellence.",
      author: "Dhanshree",
      image: "/user Photos/Dhanshree.jpeg",
      role: "Full Stack Developer, GreatHire",
      avatar: "/avatar2.jpg"
    },
    {
      quote: "Built with security at its core, the site ensures robust protection against vulnerabilities while maintaining smooth performance.",
      author: "Sujeeth",
      image: "/user Photos/Sujeeth.jpeg",
      role: "Information Security Analyst, GlobalSoft",
      avatar: "/avatar3.jpg"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // rest of your return JSX stays EXACTLY the same — no changes needed below
  return (
    // ... paste your exact existing return JSX here unchanged
  );
}