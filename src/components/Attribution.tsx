"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Invisible: records first-touch attribution (UTM/referrer/landing page) once
 * per session on first load, so leads can be attributed to their campaign.
 */
export default function Attribution() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
