"use client";

import { useState } from "react";
import { estimateFromImage, type EstimateFromImageOutput } from "@/ai/flows/automated-cost-estimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Cpu, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { calculateFabricationCosts, type CalculatedOutput } from "@/lib/cost-calculator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export function CostEstimator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [geminiResult, setGeminiResult] = useState<EstimateFromImageOutput | null>(null);
  const [calculatedResult, setCalculatedResult] = useState<CalculatedOutput | null>(null);
  
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setGeminiResult(null);
      setCalculatedResult(null);
    }
  };
  
  const handleEstimate = async () => {
    if (!imageFile) {
      toast({ variant: "destructive", title: "No Image Selected", description: "Please upload an image with project details." });
      return;
    }

    setIsEstimating(true);
    setGeminiResult(null);
    setCalculatedResult(null);

    try {
      if (!imagePreview) {
          throw new Error("Image preview is not available.");
      }
      
      const result = await estimateFromImage({ imageDataUri: imagePreview });
      setGeminiResult(result);
      
      const calculated = await calculateFabricationCosts(result);
      setCalculatedResult(calculated);

      toast({ title: "Estimation Complete", description: "The project details have been extracted and calculated." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Estimation Failed", description: "Could not process the image. Please try another one." });
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="space-y-6 mt-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Project Details</CardTitle>
          <CardDescription>Upload an image (e.g., a photo of a spec sheet, a diagram) containing the fabrication details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label htmlFor="image-upload" className="block w-full cursor-pointer">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 hover:bg-muted/50 transition-colors">
              {imagePreview ? (
                <Image src={imagePreview} alt="Project preview" width={400} height={400} className="max-h-64 w-auto rounded-md object-contain" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-2 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          
          <Button onClick={handleEstimate} disabled={isEstimating || !imageFile} className="w-full bg-accent hover:bg-accent/90 text-lg py-6 mt-4">
            {isEstimating ? <Loader2 className="animate-spin" /> : <Cpu className="mr-2" />}
            Generate Estimate from Image
          </Button>
        </CardContent>
      </Card>

      {isEstimating && (
        <Card>
            <CardContent className="pt-6 text-center">
                <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">Analyzing image and calculating costs...</p>
            </CardContent>
        </Card>
      )}

      {geminiResult && calculatedResult && (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Extraction Result</CardTitle>
                    <CardDescription>The following details were extracted from your image by the AI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Material Type</span>
                        <Badge variant="secondary">{geminiResult.material}</Badge>
                     </div>
                     <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Material Length</span>
                        <span className="font-semibold">{geminiResult.material_length_ft} ft</span>
                     </div>
                     <div>
                        <span className="text-sm text-muted-foreground">Identified Tasks</span>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {geminiResult.tasks.map(task => (
                                <Badge key={task.type} variant="outline">{task.count} x {task.type}</Badge>
                            ))}
                        </div>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Fabrication Cost & Time Breakdown</CardTitle>
                    <CardDescription>Costs and times are based on the extracted data and predefined rates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Est. Time</TableHead>
                                <TableHead className="text-right">Est. Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Material</TableCell>
                                <TableCell>{geminiResult.material_length_ft} ft</TableCell>
                                <TableCell>N/A</TableCell>
                                <TableCell className="text-right font-mono">₹{calculatedResult.materialCost.toFixed(2)}</TableCell>
                            </TableRow>
                            {calculatedResult.tasksBreakdown.map(task => (
                                 <TableRow key={task.type}>
                                    <TableCell className="font-medium">{task.type}</TableCell>
                                    <TableCell>{task.count}</TableCell>
                                    <TableCell>{task.time} min</TableCell>
                                    <TableCell className="text-right font-mono">₹{task.cost.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card className="bg-primary/10 border-primary">
                 <CardHeader>
                    <CardTitle>Total Summary</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4 text-lg">
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total Fabrication Time:</span>
                        <span>{calculatedResult.totalTime} minutes</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-2xl text-primary">
                        <span>Grand Total Cost:</span>
                        <span className="font-mono">₹{calculatedResult.totalCost.toFixed(2)}</span>
                    </div>
                 </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
