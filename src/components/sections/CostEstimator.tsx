"use client";

import { useState } from "react";
import { automatedCostEstimation, type AutomatedCostEstimationInput, type AutomatedCostEstimationOutput } from "@/ai/flows/automated-cost-estimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Cpu, IndianRupee, Loader2, Wrench, Hammer, Users, Timer } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const materialTypes = ['Steel', 'Aluminum', 'Copper', 'Plastic (PLA)', 'Carbon Fiber'];

export function CostEstimator() {
  const [formState, setFormState] = useState({
    materialType: 'Steel',
    frameLength: '',
    materialCost: '',
    numCuts: '',
    cutTimePerUnit: '',
    cutCostPerUnit: '',
    numWelds: '',
    weldTimePerUnit: '',
    weldCostPerUnit: '',
    numLabours: '',
    labourCostPerHour: ''
  });
  
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<AutomatedCostEstimationOutput | null>(null);
  
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleMaterialChange = (value: string) => {
    setFormState(prevState => ({ ...prevState, materialType: value }));
  };

  const handleEstimate = async () => {
    // Basic validation
    for (const key in formState) {
        if (formState[key as keyof typeof formState] === '') {
            toast({ variant: "destructive", title: "Missing Information", description: `Please fill in all fields. "${key}" is missing.` });
            return;
        }
    }

    setIsEstimating(true);
    setEstimatedCost(null);

    try {
      const input: AutomatedCostEstimationInput = {
          materialType: formState.materialType,
          materialCost: parseFloat(formState.materialCost),
          frameLength: parseFloat(formState.frameLength),
          numCuts: parseInt(formState.numCuts, 10),
          cutCostPerUnit: parseFloat(formState.cutCostPerUnit),
          cutTimePerUnit: parseFloat(formState.cutTimePerUnit),
          numWelds: parseInt(formState.numWelds, 10),
          weldCostPerUnit: parseFloat(formState.weldCostPerUnit),
          weldTimePerUnit: parseFloat(formState.weldTimePerUnit),
          numLabours: parseInt(formState.numLabours, 10),
          labourCostPerHour: parseFloat(formState.labourCostPerHour),
      };

      const result = await automatedCostEstimation(input);
      setEstimatedCost(result);
      toast({ title: "Cost Estimated", description: `Project cost is approximately ₹${result.totalSummary.grandTotalCost.toFixed(2)}` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Estimation Failed", description: "Could not estimate cost. Please check your inputs." });
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wrench /> Material & Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="materialType">Material Type</Label>
                        <Select value={formState.materialType} onValueChange={handleMaterialChange}>
                            <SelectTrigger id="materialType-trigger">
                                <SelectValue placeholder="Select a material" />
                            </SelectTrigger>
                            <SelectContent>
                                {materialTypes.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="frameLength">Material Length (meters)</Label>
                        <Input id="frameLength" type="number" value={formState.frameLength} onChange={handleInputChange} placeholder="e.g., 12.5" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Hammer /> Fabrication Process</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="numCuts">Number of Cuts</Label>
                        <Input id="numCuts" type="number" value={formState.numCuts} onChange={handleInputChange} placeholder="e.g., 20" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numWelds">Number of Welds</Label>
                        <Input id="numWelds" type="number" value={formState.numWelds} onChange={handleInputChange} placeholder="e.g., 15" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cutTimePerUnit">Time per Cut (mins)</Label>
                        <Input id="cutTimePerUnit" type="number" value={formState.cutTimePerUnit} onChange={handleInputChange} placeholder="e.g., 2" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weldTimePerUnit">Time per Weld (mins)</Label>
                        <Input id="weldTimePerUnit" type="number" value={formState.weldTimePerUnit} onChange={handleInputChange} placeholder="e.g., 10" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><IndianRupee /> Cost Per Unit</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="materialCost">Material (₹/meter)</Label>
                        <Input id="materialCost" type="number" value={formState.materialCost} onChange={handleInputChange} placeholder="e.g., 300" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cutCostPerUnit">Per Cut (₹)</Label>
                        <Input id="cutCostPerUnit" type="number" value={formState.cutCostPerUnit} onChange={handleInputChange} placeholder="e.g., 30" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="weldCostPerUnit">Per Weld (₹)</Label>
                        <Input id="weldCostPerUnit" type="number" value={formState.weldCostPerUnit} onChange={handleInputChange} placeholder="e.g., 200" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Labour</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="numLabours">Number of Workers</Label>
                        <Input id="numLabours" type="number" value={formState.numLabours} onChange={handleInputChange} placeholder="e.g., 2" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="labourCostPerHour">Cost per Hour (₹)</Label>
                        <Input id="labourCostPerHour" type="number" value={formState.labourCostPerHour} onChange={handleInputChange} placeholder="e.g., 500" />
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardContent className="pt-6">
                <Button onClick={handleEstimate} disabled={isEstimating} className="w-full bg-accent hover:bg-accent/90 text-lg py-6">
                    {isEstimating ? <Loader2 className="animate-spin" /> : <Cpu className="mr-2" />}
                    Calculate Total Cost
                </Button>
            </CardContent>
        </Card>

        {estimatedCost && (
            <Card>
                <CardHeader>
                    <CardTitle>Estimation Result</CardTitle>
                    <CardDescription>A detailed breakdown of the total estimated cost and time for your project.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <Card className="bg-primary/10">
                            <CardHeader className="pb-2 pt-4">
                                <CardTitle className="text-base flex items-center gap-2"><IndianRupee /> Grand Total</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <p className="text-3xl font-bold">₹{estimatedCost.totalSummary.grandTotalCost.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Timer size={14} /> Total Time: {estimatedCost.totalSummary.totalFabricationTime} minutes</p>
                            </CardContent>
                        </Card>

                        <Accordion type="single" collapsible className="w-full" defaultValue="summary">
                            <AccordionItem value="summary">
                                <AccordionTrigger>📊 Total Summary</AccordionTrigger>
                                <AccordionContent className="space-y-1 pl-2">
                                    <p><strong>Total Material Cost:</strong> ₹{estimatedCost.totalSummary.totalMaterialCost.toFixed(2)}</p>
                                    <p><strong>Total Operations Cost:</strong> ₹{estimatedCost.totalSummary.totalOperationsCost.toFixed(2)}</p>
                                    <p><strong>Total Labour Cost:</strong> ₹{estimatedCost.totalSummary.totalLabourCost.toFixed(2)}</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="material">
                                <AccordionTrigger>🧱 Material Usage</AccordionTrigger>
                                <AccordionContent className="space-y-1 pl-2">
                                    <p><strong>Total Required:</strong> {estimatedCost.materialUsage.totalMaterialRequired}</p>
                                    <p><strong>Total Cost:</strong> ₹{estimatedCost.materialUsage.totalMaterialCost.toFixed(2)}</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="cutting">
                                <AccordionTrigger>✂️ Cutting Details</AccordionTrigger>
                                <AccordionContent className="space-y-1 pl-2">
                                    <p><strong>Total Cuts:</strong> {estimatedCost.cuttingDetails.totalCuts}</p>
                                    <p><strong>Total Cost:</strong> ₹{estimatedCost.cuttingDetails.totalCuttingCost.toFixed(2)}</p>
                                    <p><strong>Total Time:</strong> {estimatedCost.cuttingDetails.totalCuttingTime} minutes</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="welding">
                                <AccordionTrigger>🔩 Welding Details</AccordionTrigger>
                                <AccordionContent className="space-y-1 pl-2">
                                    <p><strong>Total Welds:</strong> {estimatedCost.weldingDetails.totalWeldJoints}</p>
                                    <p><strong>Total Cost:</strong> ₹{estimatedCost.weldingDetails.totalWeldingCost.toFixed(2)}</p>
                                    <p><strong>Total Time:</strong> {estimatedCost.weldingDetails.totalWeldingTime} minutes</p>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="labour">
                                <AccordionTrigger>👷 Labour Details</AccordionTrigger>
                                <AccordionContent className="space-y-1 pl-2">
                                    <p><strong>Total Hours:</strong> {estimatedCost.labourDetails.totalLabourHours.toFixed(2)} hours</p>
                                    <p><strong>Total Cost:</strong> ₹{estimatedCost.labourDetails.totalLabourCost.toFixed(2)}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
