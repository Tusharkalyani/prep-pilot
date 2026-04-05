"use client";
import { UserAuth } from "@/context/AuthContext";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";

function WelcomeContainer() {
  const { userProfile } = UserAuth();
  const [userData, setUserData] = useState({
    name: userProfile?.name || "User",
    picture: null,
  });

  useEffect(() => {
    if (userProfile?.email) {
      fetchLatestUserData();
    }
  }, [userProfile]);

  const fetchLatestUserData = async () => {
    try {
      const { data: userRecord, error } = await supabase
        .from("users")
        .select("name, picture")
        .eq("email", userProfile.email)
        .single();

      if (!error && userRecord) {
        setUserData({
          name:
            userRecord.name ||
            userProfile?.name ||
            userProfile?.email?.split("@")[0] ||
            "User",
          picture: userRecord.picture || userProfile?.picture,
        });
      } else {
        setUserData({
          name:
            userProfile?.name || userProfile?.email?.split("@")[0] || "User",
          picture: userProfile?.picture,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData({
        name: userProfile?.name || userProfile?.email?.split("@")[0] || "User",
        picture: userProfile?.picture,
      });
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-md flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold">
          Welcome Back, <span className="text-blue-600">{userData.name}</span>
        </h2>
        <h2 className="text-gray-500">
          AI-Driven Interviews, Hassle-Free Hiring
        </h2>
      </div>
      {userData.picture ? (
        <Image
          src={userData.picture}
          alt="userAvatar"
          width={50}
          height={50}
          className="rounded-full"
        />
      ) : (
        <div className="w-[50px] h-[50px] rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-lg font-semibold text-blue-600">
            {userData.name.charAt(0).toUpperaleCase()}
          </span>
        </div>
      )}
    </div>
  );
}

export default WelcomeContainer;
