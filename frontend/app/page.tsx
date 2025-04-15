"use client";

import dynamic from "next/dynamic";

const BirthdayClient = dynamic(() => import("./components/Birthday"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center">
      Loading application...
    </div>
  ),
});

export default function Page() {
  return <BirthdayClient />;
}
