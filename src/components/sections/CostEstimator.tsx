"use client";

import { useState } from "react";
import { automatedCostEstimation, type AutomatedCostEstimationInput, type AutomatedCostEstimationOutput } from "@/ai/flows/automated-cost-estimation";
import { predictModelParameters } from "@/ai/flows/predict-model-parameters";
import { suggestMaterials } from "@/ai/flows/material-suggestions";
import { ModelViewer } from "@/components/ModelViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bot, Cpu, FileUp, IndianRupee, Lightbulb, Loader2, Sparkles, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

type PredictedParams = {
  materialType: string;
  frameLength: number;
  numCuts: number;
  numWelds: number;
};

type EstimatedCost = AutomatedCostEstimationOutput;

type MaterialSuggestions = {
  suggestedMaterials: string[];
  reasoning: string;
};

const materialOptions = [
    { value: "#c0c0c0", label: "Aluminum", costPerMeter: 450, cutCost: 20, cutTime: 2, weldCost: 150, weldTime: 10 },
    { value: "#b87333", label: "Copper", costPerMeter: 800, cutCost: 25, cutTime: 2.5, weldCost: 180, weldTime: 12 },
    { value: "#e5e4e2", label: "Steel", costPerMeter: 300, cutCost: 30, cutTime: 3, weldCost: 200, weldTime: 15 },
    { value: "#ffd700", label: "Gold", costPerMeter: 5000000, cutCost: 100, cutTime: 5, weldCost: 1000, weldTime: 20 },
    { value: "#f5f5f5", label: "Plastic (PLA)", costPerMeter: 50, cutCost: 5, cutTime: 1, weldCost: 25, weldTime: 5 },
    { value: "#444444", label: "Carbon Fiber", costPerMeter: 2500, cutCost: 50, cutTime: 4, weldCost: 0, weldTime: 0 },
];

export function CostEstimator() {
  const [file, setFile] = useState<File | null>(null);
  const [modelData, setModelData] = useState<string>("");
  const [modelDimensions, setModelDimensions] = useState<{ x: number; y: number; z: number } | null>(null);
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictedParams, setPredictedParams] = useState<PredictedParams | null>(null);
  
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<EstimatedCost | null>(null);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [materialSuggestions, setMaterialSuggestions] = useState<MaterialSuggestions | null>(null);

  const [selectedMaterial, setSelectedMaterial] = useState(materialOptions[0].value);
  const [modelDescription, setModelDescription] = useState("");
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith(".obj") || selectedFile.name.endsWith(".stl"))) {
      setFile(selectedFile);
      setPredictedParams(null);
      setEstimatedCost(null);
      setMaterialSuggestions(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setModelData(event.target?.result as string);
      };
      reader.readAsText(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a .obj or .stl file.",
      });
    }
  };

  const handlePredict = async () => {
    if (!modelData) {
      toast({ variant: "destructive", title: "No model data available." });
      return;
    }
    setIsPredicting(true);
    setEstimatedCost(null);
    try {
      const params = await predictModelParameters({ modelData });
      setPredictedParams(params);
      toast({ title: "Parameters Predicted", description: "AI has analyzed the model." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Prediction Failed", description: "Could not predict parameters." });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleEstimate = async () => {
    if (!predictedParams) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please predict parameters first." });
      return;
    }
    setIsEstimating(true);
    const selectedMaterialData = materialOptions.find(m => m.value === selectedMaterial);
    
    if (!selectedMaterialData) {
        toast({ variant: "destructive", title: "Invalid Material", description: "Please select a valid material." });
        setIsEstimating(false);
        return;
    }

    try {
      const input: AutomatedCostEstimationInput = {
          materialType: selectedMaterialData.label,
          materialCost: selectedMaterialData.costPerMeter,
          frameLength: predictedParams.frameLength,
          numCuts: predictedParams.numCuts,
          cutCostPerUnit: selectedMaterialData.cutCost,
          cutTimePerUnit: selectedMaterialData.cutTime,
          numWelds: predictedParams.numWelds,
          weldCostPerUnit: selectedMaterialData.weldCost,
          weldTimePerUnit: selectedMaterialData.weldTime,
      };

      const result = await automatedCostEstimation(input);
      setEstimatedCost(result);
      toast({ title: "Cost Estimated", description: `Project cost is approximately ₹${result.totalSummary.grandTotalCost.toFixed(2)}` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Estimation Failed", description: "Could not estimate cost." });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSuggestMaterials = async () => {
    if (!modelDescription) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide a model description." });
        return;
    }
    setIsSuggesting(true);
    const currentMaterialLabel = materialOptions.find(m => m.value === selectedMaterial)?.label || 'Unknown';
    try {
        const suggestions = await suggestMaterials({
            modelDescription,
            currentMaterial: currentMaterialLabel,
        });
        setMaterialSuggestions(suggestions);
        toast({ title: "Material Suggestions Ready", description: "AI has provided alternative materials." });
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Suggestion Failed", description: "Could not get material suggestions." });
    } finally {
        setIsSuggesting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileUp /> 3D Model Upload
            </CardTitle>
            <CardDescription>Upload your .obj or .stl file to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input id="model-upload" type="file" accept=".obj,.stl" onChange={handleFileChange} />
          </CardContent>
        </Card>
        <ModelViewer file={file} materialColor={selectedMaterial} onModelLoad={setModelDimensions} className="h-[500px]" />
      </div>

      <div className="lg:col-span-2 space-y-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Parameter Prediction</CardTitle>
            <CardDescription>Let AI analyze your model to predict key parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePredict} disabled={!file || isPredicting} className="w-full">
              {isPredicting ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
              Predict Parameters
            </Button>
            {predictedParams && (
              <div className="mt-4 space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-lg">Predicted Parameters</h3>
                <div className="space-y-2">
                  <Label htmlFor="material-type">Predicted Material</Label>
                  <Input id="material-type" value={predictedParams.materialType} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frame-length">Frame Length (m)</Label>
                  <Input id="frame-length" value={predictedParams.frameLength} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-cuts">Number of Cuts</Label>
                  <Input id="num-cuts" value={predictedParams.numCuts} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-welds">Number of Welds</Label>
                  <Input id="num-welds" value={predictedParams.numWelds} readOnly />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {predictedParams && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><IndianRupee /> Cost Estimation</CardTitle>
            <CardDescription>Select a material and estimate the project cost.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Material Selection</Label>
                    <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a material" />
                        </SelectTrigger>
                        <SelectContent>
                            {materialOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: opt.value}} />
                                        {opt.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleEstimate} disabled={isEstimating} className="w-full bg-accent hover:bg-accent/90">
                  {isEstimating ? <Loader2 className="animate-spin" /> : <Cpu className="mr-2" />}
                  Estimate Cost
                </Button>
             </div>
            {estimatedCost && (
                <div className="mt-4 space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-bold text-center">Fabrication Cost Breakdown</h3>
                    
                    <Card className="bg-primary/10">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base flex items-center gap-2"><IndianRupee /> Grand Total</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-2xl font-bold">₹{estimatedCost.totalSummary.grandTotalCost.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Total Time: {estimatedCost.totalSummary.totalFabricationTime} minutes</p>
                        </CardContent>
                    </Card>

                    <Accordion type="single" collapsible className="w-full">
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
                    </Accordion>
                </div>
            )}
          </CardContent>
        </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> Material Suggestions</CardTitle>
                <CardDescription>Get AI-powered suggestions for alternative, cost-effective materials.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="model-desc">Model Description</Label>
                        <Textarea id="model-desc" placeholder="e.g., A prototype for a mechanical keyboard case, needs to be durable." value={modelDescription} onChange={(e) => setModelDescription(e.target.value)} />
                    </div>
                    <Button onClick={handleSuggestMaterials} disabled={!modelDescription || isSuggesting} className="w-full">
                        {isSuggesting ? <Loader2 className="animate-spin" /> : <Wrench className="mr-2" />}
                        Suggest Materials
                    </Button>
                </div>
                {materialSuggestions && (
                    <Alert variant="default" className="mt-4">
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Material Suggestions</AlertTitle>
                        <AlertDescription>
                            <p className="font-semibold mb-2">{materialSuggestions.suggestedMaterials.join(', ')}</p>
                            <p>{materialSuggestions.reasoning}</p>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
