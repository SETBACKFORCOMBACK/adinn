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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function CostEstimator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [geminiResult, setGeminiResult] = useState<EstimateFromImageOutput | null>(null);
  const [calculatedResult, setCalculatedResult] = useState<CalculatedOutput | null>(null);
  const [numberOfFrames, setNumberOfFrames] = useState<number | ''>('');
  const [materialLength, setMaterialLength] = useState<number | ''>('');
  const [cuttingTime, setCuttingTime] = useState<number | ''>(25);
  const [weldingTime, setWeldingTime] = useState<number | ''>(30);
  
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
    if (!numberOfFrames || Number(numberOfFrames) < 1) {
        toast({ variant: "destructive", title: "Invalid Number of Frames", description: "Please enter a valid number of frames to fabricate." });
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
      
      const calculated = await calculateFabricationCosts(result, {
        materialLength: materialLength !== '' ? materialLength : result.material_length,
        cuttingTime: cuttingTime !== '' ? cuttingTime : 25,
        weldingTime: weldingTime !== '' ? weldingTime : 30,
      });
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
          <CardTitle>1. Configure Your Project</CardTitle>
          <CardDescription>Enter project details below. Values for length and time can be manually entered to override AI-assisted estimates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="number-of-frames" className="text-base">Number of Frames to Fabricate</Label>
            <Input
              id="number-of-frames"
              type="number"
              value={numberOfFrames}
              onChange={(e) => setNumberOfFrames(e.target.value === '' ? '' : Number(e.target.value))}
              min="1"
              className="max-w-[200px] text-lg"
              placeholder="e.g., 10"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="material-length">Material Length</Label>
                <Input
                  id="material-length"
                  type="number"
                  value={materialLength}
                  onChange={(e) => setMaterialLength(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Leave blank for AI"
                />
                <p className="text-xs text-muted-foreground">Total length per frame.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cutting-time">Cutting Time</Label>
                <Input
                  id="cutting-time"
                  type="number"
                  value={cuttingTime}
                  onChange={(e) => setCuttingTime(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Default: 25"
                />
                 <p className="text-xs text-muted-foreground">Mins per frame.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welding-time">Welding Time</Label>
                <Input
                  id="welding-time"
                  type="number"
                  value={weldingTime}
                  onChange={(e) => setWeldingTime(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Default: 30"
                />
                 <p className="text-xs text-muted-foreground">Mins per frame.</p>
              </div>
          </div>


          <div>
             <Label htmlFor="image-upload" className="text-base">Project Details Image (Single Frame)</Label>
              <label htmlFor="image-upload" className="block w-full cursor-pointer mt-2">
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
          </div>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          
          <Button onClick={handleEstimate} disabled={isEstimating || !imageFile || !numberOfFrames || Number(numberOfFrames) < 1} className="w-full bg-accent hover:bg-accent/90 text-lg py-6 mt-4">
            {isEstimating ? <Loader2 className="animate-spin" /> : <Cpu className="mr-2" />}
            Generate Estimate
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

      {geminiResult && calculatedResult && numberOfFrames && (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Extraction Result (Per Frame)</CardTitle>
                    <CardDescription>The following details were extracted from your image by the AI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Square pipe measurement</span>
                        <span className="font-semibold">1 x 1</span>
                     </div>
                     <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Material Type</span>
                        <Badge variant="secondary">{geminiResult.material}</Badge>
                     </div>
                     <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm text-muted-foreground">Material Length</span>
                        <span className="font-semibold">{calculatedResult.materialLength} length</span>
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
                <CardTitle>Material Cost (Per Frame)</CardTitle>
                <CardDescription>Based on the total length required for one frame. (Formula: ₹900 × Material Length)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{geminiResult.material}</TableCell>
                      <TableCell>{calculatedResult.materialLength} length</TableCell>
                      <TableCell className="text-right font-mono">₹{calculatedResult.materialCost.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Labor Charges & Time (Per Frame)</CardTitle>
                    <CardDescription>Time is for estimation. Labor charges are fixed (Cutting: ₹43.25, Welding: ₹60.00).</CardDescription>
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
                            {calculatedResult.tasksBreakdown.map(task => (
                                 <TableRow key={task.type}>
                                    <TableCell className="font-medium">{task.type}</TableCell>
                                    <TableCell>{task.count}</TableCell>
                                    <TableCell>{task.time} minutes</TableCell>
                                    <TableCell className="text-right font-mono">₹{task.cost.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Additional Costs (Per Frame)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Finishing</TableCell>
                                <TableCell>50% of Labor Cost (Cutting + Welding)</TableCell>
                                <TableCell className="text-right font-mono">₹{calculatedResult.finishingCost.toFixed(2)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Transport</TableCell>
                                <TableCell>Fixed charge per frame</TableCell>
                                <TableCell className="text-right font-mono">₹{calculatedResult.transportCost.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                 <CardHeader>
                    <CardTitle>Summary (Per Frame)</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4 text-lg">
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total Fabrication Time <span className="text-sm font-normal text-muted-foreground">(Cutting + Welding)</span>:</span>
                        <span>{calculatedResult.totalTime} minutes</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-2xl">
                        <span>Total Cost Per Frame <span className="text-sm font-normal text-muted-foreground">(Material + Labor + Additional)</span>:</span>
                        <span className="font-mono">₹{calculatedResult.totalCost.toFixed(2)}</span>
                    </div>
                 </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary">
                 <CardHeader>
                    <CardTitle className="text-primary">Total Project Estimate ({numberOfFrames} Frames)</CardTitle>
                    <CardDescription>This is the final estimated cost and time for all frames combined.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4 text-lg">
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total Project Time <span className="text-sm font-normal text-muted-foreground">(Time/Frame × No. of Frames)</span>:</span>
                        <span>{(calculatedResult.totalTime * Number(numberOfFrames)).toFixed(2)} minutes</span>
                    </div>
                     <div className="flex justify-between items-center font-semibold">
                        <span>Total Material Cost <span className="text-sm font-normal text-muted-foreground">(Cost/Frame × No. of Frames)</span>:</span>
                        <span className="font-mono">₹{(calculatedResult.materialCost * Number(numberOfFrames)).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center font-semibold">
                        <span>Total Labor Cost <span className="text-sm font-normal text-muted-foreground">(Cost/Frame × No. of Frames)</span>:</span>
                        <span className="font-mono">₹{(calculatedResult.totalLaborCost * Number(numberOfFrames)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total Finishing Cost <span className="text-sm font-normal text-muted-foreground">(Cost/Frame × No. of Frames)</span>:</span>
                        <span className="font-mono">₹{(calculatedResult.finishingCost * Number(numberOfFrames)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total Transport Cost <span className="text-sm font-normal text-muted-foreground">(Cost/Frame × No. of Frames)</span>:</span>
                        <span className="font-mono">₹{(calculatedResult.transportCost * Number(numberOfFrames)).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-2xl text-primary pt-4 border-t mt-4">
                        <span>Grand Total Project Cost <span className="text-sm font-normal text-muted-foreground">(Cost/Frame × No. of Frames)</span>:</span>
                        <span className="font-mono">₹{(calculatedResult.totalCost * Number(numberOfFrames)).toFixed(2)}</span>
                    </div>
                 </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
