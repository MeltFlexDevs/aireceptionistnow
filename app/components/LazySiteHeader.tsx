"use client";

// The (main) 404 entry is loaded on every English page. A lazy header keeps
// SiteHeader out of that entry, so only a page that shows a 404 loads it.
import dynamic from "next/dynamic";

export default dynamic(() => import("./SiteHeader"));
