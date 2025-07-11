
"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
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
    pipeWeightKg: 2,
    totalLength: 2.5,
    totalCutting: 20,
    totalWelding: 14,
    cuttingTime: 25,
    weldingTime: 18,
    labourCost: 86,
    helperCharge: 43,
    consumables: 100,
  },
  {
    id: "double-side-back-light-frame",
    name: "Double Side Back Light Frame",
    dimensions: "6' x 3'",
    sqPipe: '1" x 1" Sq. Pipe',
    pipeWeightKg: 2,
    totalLength: 3,
    totalCutting: 38,
    totalWelding: 44,
    cuttingTime: 30,
    weldingTime: 45,
    labourCost: 150,
    helperCharge: 75,
    consumables: 100,
  },
  {
    id: "slim-board-backlight-frame",
    name: "Slim Board Backlight Frame",
    dimensions: "10' x 4'",
    sqPipe: "Outer: 2'x1', Inner: 1/2'x1/2' Sq. Pipe",
    pipeWeightKg: 3,
    totalLength: 2.25,
    materialDetails: [
      { name: "Outer Pipe (2'x1')", length: 1.5 },
      { name: "Inner Support Pipe (½'x½')", length: 0.75 },
    ],
    totalCutting: 20,
    totalWelding: 12,
    cuttingTime: 13,
    weldingTime: 18,
    labourCost: 62,
    helperCharge: 31,
    consumables: 100,
  },
  {
    id: "non-light-box-frame",
    name: "Non Light Box Frame",
    dimensions: "6' x 4'",
    sqPipe: '1" x 1" Sq. Pipe',
    pipeWeightKg: 2,
    totalLength: 2.5,
    totalCutting: 40,
    totalWelding: 30,
    cuttingTime: 25,
    weldingTime: 35,
    labourCost: 120,
    helperCharge: 60,
    consumables: 100,
    imageUrl: "https://i.ibb.co/GQLQ8m9/NLBF.png",
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
            className="cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col"
            onClick={() => handleSelectProject(project)}
          >
            {project.imageUrl && (
              <div className="overflow-hidden rounded-t-lg">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-auto object-cover aspect-video"
                  data-ai-hint="product frame"
                />
              </div>
            )}
            <CardHeader className="text-center p-8 flex-1">
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
