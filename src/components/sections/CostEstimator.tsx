"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectType } from "@/types";
import { ProjectCalculator } from "./ProjectCalculator";

const projectTypes: ProjectType[] = [
  {
    id: "back-lighting-frame",
    name: "Back Lighting Frame",
    dimensions: "10' x 6'",
    sqPipe: '1" x 1/2" Sq. Pipe',
    pipeWeightKg: 2,
    totalLength: 4,
    totalCutting: 70,
    totalWelding: 58,
    cuttingTime: 10,
    weldingTime: 15,
    labourCost: 50,
    helperCharge: 25,
    consumables: 100,
  },
  {
    id: "non-light-single-frame",
    name: "Non Light Single Frame",
    dimensions: "10' x 5'",
    sqPipe: '1" x 1" Sq. Pipe',
    pipeWeightKg: 2.5,
    totalLength: 5,
    totalCutting: 60,
    totalWelding: 50,
    cuttingTime: 8,
    weldingTime: 12,
    labourCost: 40,
    helperCharge: 20,
    consumables: 80,
  },
  {
    id: "double-side-back-light-frame",
    name: "Double Side Back Light Frame",
    dimensions: "6' x 3'",
    sqPipe: '1" x 1/2" Sq. Pipe',
    pipeWeightKg: 3,
    totalLength: 6,
    totalCutting: 80,
    totalWelding: 70,
    cuttingTime: 12,
    weldingTime: 18,
    labourCost: 60,
    helperCharge: 30,
    consumables: 120,
  },
  {
    id: "slim-board-backlight-frame",
    name: "Slim Board Backlight Frame",
    dimensions: "10' x 4'",
    sqPipe: '3/4" x 1/2" Sq. Pipe',
    pipeWeightKg: 1.8,
    totalLength: 3.5,
    totalCutting: 65,
    totalWelding: 55,
    cuttingTime: 9,
    weldingTime: 14,
    labourCost: 46,
    helperCharge: 23,
    consumables: 90,
  },
  {
    id: "non-light-box-frame",
    name: "Non Light Box Frame",
    dimensions: "6' x 4'",
    sqPipe: '1" x 1" Sq. Pipe',
    pipeWeightKg: 2.8,
    totalLength: 5.5,
    totalCutting: 75,
    totalWelding: 65,
    cuttingTime: 11,
    weldingTime: 16,
    labourCost: 54,
    helperCharge: 27,
    consumables: 110,
  },
];

export function CostEstimator() {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  const handleSelectProject = (project: ProjectType) => {
    setSelectedProject(project);
  };
  
  const handleBack = () => {
    setSelectedProject(null);
  }

  if (selectedProject) {
    return <ProjectCalculator project={selectedProject} onBack={handleBack} />;
  }

  return (
    <div className="space-y-8 mt-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Select Your Project Type
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose a project preset to get started with your estimate.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {projectTypes.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            onClick={() => handleSelectProject(project)}
          >
            <CardHeader className="text-center p-8">
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription className="text-base pt-1">
                {project.dimensions}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
