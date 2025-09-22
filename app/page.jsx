"use client";
import React from "react";
import ActivationGate from "@/components/ActivationGate";  // ✅ fixed path
import "./globals.css";

export default function Page() {
  return <ActivationGate />;
}
