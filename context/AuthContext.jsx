"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(undefined);
  const router = useRouter();

  // Fetch user profile from DB
  const fetchUserProfile = async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!error && data) {
      setUserProfile(data);
    } else {
      console.error("Failed to fetch profile:", error);
      setUserProfile(null); // ✅ set null so dashboard stops waiting
    }
  };

  // Fetch initial session + subscribe to changes
  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      // ✅ FIX 1: fetch profile right after getting session
      if (session?.user?.email) {
        await fetchUserProfile(session.user.email);
      } else {
        setUserProfile(null); // ✅ no session = no profile, stop loading
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        // ✅ FIX 1: also fetch profile on auth state changes
        if (session?.user?.email) {
          await fetchUserProfile(session.user.email);
        } else {
          setUserProfile(null);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sign in
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: userData, error: profileError } = await supabase
        .from("users")
        .select("role, banned")
        .eq("email", email.toLowerCase())
        .single();

      if (profileError || !userData) {
        toast.error("Could not fetch user profile.");
        return { success: false, error: "Profile not found." };
      }

      if (userData.banned) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Your account has been banned. Please contact support.",
        };
      }

      setUserProfile(userData);
      toast.success("Logged in!");

      // ✅ FIX 2: correct paths
      if (userData.role === "recruiter") {
        router.push("/main/recruiter/dashboard");
      } else if (userData.role === "candidate") {
        router.push("/main/candidate/dashboard");
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // Sign up
  const signUpNewUser = async (email, password, { name, role }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });

      if (authError || !authData?.user?.id) {
        return {
          success: false,
          error: authError?.message || "Signup failed.",
        };
      }

      const { error: insertError } = await supabase.from("users").insert([
        {
          email: email.toLowerCase(),
          name,
          role,
          picture: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          credits: 3,
        },
      ]);

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      return { success: true, user: authData.user };
    } catch (err) {
      return { success: false, error: "Unexpected error occurred." };
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign out failed.");
      return;
    }
    setSession(null);
    setUserProfile(null);
    toast.success("Successfully signed out.");
    router.push("/login");
  };

  // Show loading spinner while checking session
  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Screen. Please Wait..</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ session, userProfile, signInUser, signUpNewUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
