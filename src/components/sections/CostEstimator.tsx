"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

const projectTypes = [
  { name: "Back Lighting Frame", dimensions: "10' x 6'" },
  { name: "Non Light Single Frame", dimensions: "10' x 5'" },
  { name: "Double Side Back Light Frame", dimensions: "6' x 3'" },
  { name: "Slim Board Backlight Frame", dimensions: "10' x 4'" },
  { name: "Non Light Box Frame", dimensions: "6' x 4'" },
];

export function CostEstimator() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleSelectProject = (projectName: string) => {
    setSelectedProject(projectName);
    // Future logic for what happens on selection will go here.
    console.log("Selected Project:", projectName);
  };

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
            key={project.name}
            className="cursor-pointer hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            onClick={() => handleSelectProject(project.name)}
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
