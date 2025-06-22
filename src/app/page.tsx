"use client";

import { Header } from "@/components/layout/Header";
import { CostEstimator } from "@/components/sections/CostEstimator";
import { ProjectHistory } from "@/components/sections/ProjectHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, History } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <Tabs defaultValue="estimator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
            <TabsTrigger value="estimator">
              <Box className="mr-2" />
              Cost Estimator
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2" />
              Project History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="estimator">
            <CostEstimator />
          </TabsContent>
          <TabsContent value="history">
            <ProjectHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
