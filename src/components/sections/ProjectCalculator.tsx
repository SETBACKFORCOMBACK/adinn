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

  const labourRate = 2; // Based on user-provided calculation sheets
  const cuttingLabourCost = project.cuttingTime * labourRate;
  const weldingLabourCost = project.weldingTime * labourRate;
  
  const totalLabourCost = project.labourCost;
  const helperCharge = project.helperCharge;
  const consumables = project.consumables;

  const materialCost = project.totalLength * materialCostPerLength;
  const fabricationCostPerFrame = totalLabourCost + helperCharge + consumables;
  const totalCostPerFrame = materialCost + fabricationCostPerFrame;
  const totalCost = totalCostPerFrame * numFrames;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatCurrencySimple = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
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

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
          <CardDescription>Key details for this project preset.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="font-medium text-muted-foreground">Pipe Measurement</div>
            <div>{project.sqPipe}</div>
            
            <div className="font-medium text-muted-foreground">Pipe Weight</div>
            <div>{project.pipeWeightKg} kg</div>

            <div className="font-medium text-muted-foreground">Total Material Length</div>
            <div>{project.totalLength} units</div>

            <div className="font-medium text-muted-foreground">Total Cuttings</div>
            <div>{project.totalCutting} cuts</div>

            <div className="font-medium text-muted-foreground">Total Weldings</div>
            <div>{project.totalWelding} welds</div>
          </div>
        </CardContent>
      </Card>
      
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
                        onChange={(e) => setNumFrames(Math.max(1, Number(e.target.value)))}
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
                    <div>
                        <p className="text-muted-foreground">Material Cost</p>
                        <p className="text-xs text-muted-foreground">({project.totalLength} units &times; {formatCurrencySimple(materialCostPerLength)})</p>
                    </div>
                    <span className="font-medium">{formatCurrency(materialCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">Cutting Cost</p>
                        <p className="text-xs text-muted-foreground">({project.cuttingTime} min &times; ₹{labourRate}/min)</p>
                    </div>
                    <span className="font-medium">{formatCurrency(cuttingLabourCost)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">Welding Cost</p>
                        <p className="text-xs text-muted-foreground">({project.weldingTime} min &times; ₹{labourRate}/min)</p>
                    </div>
                    <span className="font-medium">{formatCurrency(weldingLabourCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">Helper Charge</p>
                        <p className="text-xs text-muted-foreground">(50% of Labour Cost)</p>
                    </div>
                    <span className="font-medium">{formatCurrency(helperCharge)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Consumables</span>
                    <span className="font-medium">{formatCurrency(consumables)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                    <div>
                        <p>Total Cost per Frame</p>
                        <p className="text-xs font-normal text-muted-foreground">(Material + Labour + Helper + Consumables)</p>
                    </div>
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
