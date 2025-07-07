"use client";

import React, { useState, useEffect } from "react";
import type { ProjectType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download } from "lucide-react";

interface ProjectCalculatorProps {
  project: ProjectType;
  onBack: () => void;
}

export function ProjectCalculator({ project, onBack }: ProjectCalculatorProps) {
  const [numFrames, setNumFrames] = useState(1);
  const [materialCosts, setMaterialCosts] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialCosts: Record<string, number> = {};
    if (project.materialDetails && project.materialDetails.length > 0) {
      project.materialDetails.forEach(detail => {
        initialCosts[detail.name] = 900;
      });
    } else {
      initialCosts['default'] = 900;
    }
    setMaterialCosts(initialCosts);
  }, [project]);

  const handleMaterialCostChange = (key: string, value: number) => {
    setMaterialCosts(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const labourRate = 2; // Based on user-provided calculation sheets
  const cuttingLabourCost = project.cuttingTime * labourRate;
  const weldingLabourCost = project.weldingTime * labourRate;
  
  const totalLabourCost = project.labourCost;
  const helperCharge = project.helperCharge;
  const consumables = project.consumables;

  const materialCost = project.materialDetails && project.materialDetails.length > 0
    ? project.materialDetails.reduce((total, detail) => {
        return total + (detail.length * (materialCosts[detail.name] || 0));
      }, 0)
    : project.totalLength * (materialCosts['default'] || 0);

  const fabricationCostPerFrame = totalLabourCost + helperCharge + consumables;
  const totalCostPerFrame = materialCost + fabricationCostPerFrame;
  const totalCost = totalCostPerFrame * numFrames;
  
  const timePerFrame = project.cuttingTime + project.weldingTime;
  const totalTime = timePerFrame * numFrames;

  const totalMaterialCost = materialCost * numFrames;
  const totalCuttingLabourCost = cuttingLabourCost * numFrames;
  const totalWeldingLabourCost = weldingLabourCost * numFrames;
  const totalHelperCharge = helperCharge * numFrames;
  const totalConsumables = consumables * numFrames;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatCurrencySimple = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    if (minutes < 1440) { // Less than 24 hours
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`.trim();
    }
    const days = Math.floor(minutes / 1440);
    const remainingMinutesAfterDays = minutes % 1440;
    const hours = Math.floor(remainingMinutesAfterDays / 60);
    const remainingMinutes = remainingMinutesAfterDays % 60;
    
    let result = `${days}d`;
    if (hours > 0) {
        result += ` ${hours}h`;
    }
    if (remainingMinutes > 0) {
        result += ` ${remainingMinutes}m`;
    }
    return result.trim();
  }

  const handleDownloadSummary = () => {
    let summary = `Fabrication Project Summary\n`;
    summary += `===========================\n\n`;
    summary += `Project: ${project.name} (${project.dimensions})\n`;
    summary += `Number of Frames: ${numFrames}\n\n`;

    summary += `--- TOTAL ESTIMATE FOR ${numFrames} ${numFrames > 1 ? 'FRAMES' : 'FRAME'} ---\n\n`;

    // Total Lengths
    if (project.materialDetails && project.materialDetails.length > 0) {
      project.materialDetails.forEach(detail => {
        summary += `Total ${detail.name} Length: ${detail.length * numFrames} length\n`;
        summary += `(${detail.length} length/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n\n`;
      })
    } else {
      summary += `Total Material Length: ${project.totalLength * numFrames} length\n`;
      summary += `(${project.totalLength} length/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n\n`;
    }
    
    summary += `--- COST BREAKDOWN ---\n`;
    // Total Material Costs
    if (project.materialDetails && project.materialDetails.length > 0) {
        project.materialDetails.forEach(detail => {
            summary += `Total ${detail.name} Cost: ${formatCurrency(detail.length * (materialCosts[detail.name] || 0) * numFrames)}\n`;
            summary += `(${detail.length} length × ${formatCurrencySimple(materialCosts[detail.name] || 0)}/length × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n`;
        })
    } else {
        summary += `Total Material Cost: ${formatCurrency(totalMaterialCost)}\n`;
        summary += `(${project.totalLength} length × ${formatCurrencySimple(materialCosts['default'] || 0)}/length × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n`;
    }

    summary += `Total Cutting Cost: ${formatCurrency(totalCuttingLabourCost)}\n`;
    summary += `(${formatCurrency(cuttingLabourCost)}/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n`;
    
    summary += `Total Welding Cost: ${formatCurrency(totalWeldingLabourCost)}\n`;
    summary += `(${formatCurrency(weldingLabourCost)}/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n`;
    
    summary += `Total Helper Charge: ${formatCurrency(totalHelperCharge)}\n`;
    summary += `(${formatCurrency(helperCharge)}/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n`;
    
    summary += `Total Consumables: ${formatCurrency(totalConsumables)}\n`;
    summary += `(${formatCurrency(consumables)}/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n\n`;
    
    summary += `--- GRAND TOTALS ---\n\n`;
    summary += `Grand Total Cost: ${formatCurrency(totalCost)}\n`;
    summary += `(${formatCurrency(totalCostPerFrame)}/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n\n`;
    
    summary += `Grand Total Time: ${formatTime(totalTime)}\n`;
    summary += `(${formatTime(timePerFrame)}/frame × ${numFrames} ${numFrames > 1 ? 'frames' : 'frame'})\n`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.id}-estimate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

            {project.materialDetails && project.materialDetails.length > 0 ? (
                project.materialDetails.map(detail => (
                    <React.Fragment key={detail.name}>
                        <div className="font-medium text-muted-foreground">{detail.name} Length</div>
                        <div>{detail.length} length</div>
                    </React.Fragment>
                ))
            ) : (
                <>
                    <div className="font-medium text-muted-foreground">Total Material Length</div>
                    <div>{project.totalLength} length</div>
                </>
            )}

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

                {project.materialDetails && project.materialDetails.length > 0 ? (
                    project.materialDetails.map(detail => (
                        <div key={detail.name} className="space-y-2">
                            <Label htmlFor={`material-cost-${detail.name}`}>Cost for {detail.name} (per length)</Label>
                            <Input
                                id={`material-cost-${detail.name}`}
                                type="number"
                                value={materialCosts[detail.name] || ''}
                                onChange={(e) => handleMaterialCostChange(detail.name, Number(e.target.value))}
                                min="0"
                            />
                        </div>
                    ))
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="material-cost">Material Cost per length</Label>
                        <Input 
                            id="material-cost" 
                            type="number" 
                            value={materialCosts['default'] || ''}
                            onChange={(e) => handleMaterialCostChange('default', Number(e.target.value))}
                            min="0"
                        />
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Right column for cost breakdown */}
        <Card className="bg-blue-50/20">
            <CardHeader>
                <CardTitle>Breakdown per Frame</CardTitle>
                <CardDescription>Estimated cost and time for a single frame.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                
                {project.materialDetails && project.materialDetails.length > 0 ? (
                    project.materialDetails.map(detail => (
                        <div key={detail.name} className="flex justify-between items-center">
                            <div>
                                <p className="text-muted-foreground">{detail.name} Cost</p>
                                <p className="text-xs text-muted-foreground">({detail.length} length &times; {formatCurrencySimple(materialCosts[detail.name] || 0)}/length)</p>
                            </div>
                            <span className="font-medium">{formatCurrency(detail.length * (materialCosts[detail.name] || 0))}</span>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground">Material Cost</p>
                            <p className="text-xs text-muted-foreground">({project.totalLength} length &times; {formatCurrencySimple(materialCosts['default'] || 0)}/length)</p>
                        </div>
                        <span className="font-medium">{formatCurrency(materialCost)}</span>
                    </div>
                )}


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
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold">
                    <div>
                        <p>Total Time per Frame</p>
                        <p className="text-xs font-normal text-muted-foreground">(Cutting Time + Welding Time)</p>
                    </div>
                    <span>{formatTime(timePerFrame)}</span>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Total cost summary card */}
      <Card className="border-primary border-2 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Total Estimate for {numFrames} {numFrames > 1 ? 'Frames' : 'Frame'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
            {project.materialDetails && project.materialDetails.length > 0 ? (
                project.materialDetails.map(detail => (
                    <div key={detail.name} className="flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground">Total {detail.name} Length</p>
                            <p className="text-xs text-muted-foreground">({detail.length} length/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                        </div>
                        <span className="font-medium">{detail.length * numFrames} length</span>
                    </div>
                ))
            ) : (
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">Total Material Length</p>
                        <p className="text-xs text-muted-foreground">({project.totalLength} length/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                    </div>
                    <span className="font-medium">{project.totalLength * numFrames} length</span>
                </div>
            )}
            <Separator />
            {project.materialDetails && project.materialDetails.length > 0 ? (
                project.materialDetails.map(detail => (
                    <div key={detail.name} className="flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground">Total {detail.name} Cost</p>
                            <p className="text-xs text-muted-foreground">({detail.length} length &times; {formatCurrencySimple(materialCosts[detail.name] || 0)}/length &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                        </div>
                        <span className="font-medium">{formatCurrency(detail.length * (materialCosts[detail.name] || 0) * numFrames)}</span>
                    </div>
                ))
            ) : (
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">Total Material Cost</p>
                        <p className="text-xs text-muted-foreground">({project.totalLength} length &times; {formatCurrencySimple(materialCosts['default'] || 0)}/length &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                    </div>
                    <span className="font-medium">{formatCurrency(totalMaterialCost)}</span>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">Total Cutting Cost</p>
                    <p className="text-xs text-muted-foreground">({formatCurrency(cuttingLabourCost)}/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                </div>
                <span className="font-medium">{formatCurrency(totalCuttingLabourCost)}</span>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">Total Welding Cost</p>
                    <p className="text-xs text-muted-foreground">({formatCurrency(weldingLabourCost)}/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                </div>
                <span className="font-medium">{formatCurrency(totalWeldingLabourCost)}</span>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">Total Helper Charge</p>
                    <p className="text-xs text-muted-foreground">({formatCurrency(helperCharge)}/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                </div>
                <span className="font-medium">{formatCurrency(totalHelperCharge)}</span>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">Total Consumables</p>
                    <p className="text-xs text-muted-foreground">({formatCurrency(consumables)}/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                </div>
                <span className="font-medium">{formatCurrency(totalConsumables)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-2xl font-bold">
                <div>
                    <p>Grand Total Cost</p>
                    <p className="text-xs font-normal text-muted-foreground">({formatCurrency(totalCostPerFrame)}/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                </div>
                <span className="text-primary">{formatCurrency(totalCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-2xl font-bold">
                <div>
                    <p>Grand Total Time</p>
                    <p className="text-xs font-normal text-muted-foreground">({formatTime(timePerFrame)}/frame &times; {numFrames} {numFrames > 1 ? 'frames' : 'frame'})</p>
                </div>
                <span className="text-primary">{formatTime(totalTime)}</span>
            </div>
            <div className="pt-6 flex justify-center">
                <Button onClick={handleDownloadSummary}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Summary
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
