"use client";

import { useState } from "react";
import type { ProjectType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

interface ProjectCalculatorProps {
  project: ProjectType;
  onBack: () => void;
}

export function ProjectCalculator({ project, onBack }: ProjectCalculatorProps) {
  const [numFrames, setNumFrames] = useState(1);
  const [materialCostPerLength, setMaterialCostPerLength] = useState(900);

  const materialCost = project.totalLength * materialCostPerLength;
  const fabricationCostPerFrame = project.labourCost + project.helperCharge + project.consumables;
  const totalCostPerFrame = materialCost + fabricationCostPerFrame;
  const totalCost = totalCostPerFrame * numFrames;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8 mt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            {project.name}
          </h2>
          <p className="text-muted-foreground">
            {project.dimensions}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column for inputs */}
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Adjust the inputs to calculate the total cost.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="num-frames">Number of Frames</Label>
                    <Input 
                        id="num-frames" 
                        type="number" 
                        value={numFrames}
                        onChange={(e) => setNumFrames(Number(e.target.value))}
                        min="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="material-cost">Material Cost per Unit Length</Label>
                    <Input 
                        id="material-cost" 
                        type="number" 
                        value={materialCostPerLength}
                        onChange={(e) => setMaterialCostPerLength(Number(e.target.value))}
                        min="0"
                    />
                </div>
            </CardContent>
        </Card>

        {/* Right column for cost breakdown */}
        <Card className="bg-blue-50/20">
            <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Estimated cost for a single frame.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Material Cost</span>
                    <span className="font-medium">{formatCurrency(materialCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Labour Cost</span>
                    <span className="font-medium">{formatCurrency(project.labourCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Helper Charge (50%)</span>
                    <span className="font-medium">{formatCurrency(project.helperCharge)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Consumables</span>
                    <span className="font-medium">{formatCurrency(project.consumables)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Cost per Frame</span>
                    <span>{formatCurrency(totalCostPerFrame)}</span>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Total cost summary card */}
      <Card className="border-primary border-2 shadow-xl">
        <CardHeader className="text-center">
            <CardDescription className="text-xl">Total Estimated Cost ({numFrames} {numFrames > 1 ? 'Frames' : 'Frame'})</CardDescription>
            <CardTitle className="text-5xl font-bold text-primary tracking-tight">
                {formatCurrency(totalCost)}
            </CardTitle>
        </CardHeader>
      </Card>

    </div>
  );
}
