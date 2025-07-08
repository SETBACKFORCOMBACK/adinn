"use client";

import { Header } from "@/components/layout/Header";
import { CostEstimator } from "@/components/sections/CostEstimator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <CostEstimator />
      </main>
    </div>
  );
}
