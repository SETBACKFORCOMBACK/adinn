"use client";

import { useState } from "react";
import { automatedCostEstimation } from "@/ai/flows/automated-cost-estimation";
import { predictModelParameters } from "@/ai/flows/predict-model-parameters";
import { suggestMaterials } from "@/ai/flows/material-suggestions";
import { ModelViewer } from "@/components/ModelViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Bot, Cpu, DollarSign, FileUp, Lightbulb, Loader2, Sparkles, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Textarea } from "../ui/textarea";

type PredictedParams = {
  materialType: string;
  weldingTime: string;
  otherParameters: string;
};

type EstimatedCost = {
  estimatedCost: number;
  costBreakdown: string;
};

type MaterialSuggestions = {
  suggestedMaterials: string[];
  reasoning: string;
};

const materialOptions = [
    { value: "#c0c0c0", label: "Aluminum" },
    { value: "#b87333", label: "Copper" },
    { value: "#e5e4e2", label: "Steel" },
    { value: "#ffd700", label: "Gold" },
    { value: "#f5f5f5", label: "Plastic (PLA)" },
    { value: "#444444", label: "Carbon Fiber" },
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
  const [costRequirements, setCostRequirements] = useState("");
  
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
    if (!predictedParams || !modelDimensions) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please predict parameters first." });
      return;
    }
    setIsEstimating(true);
    const currentMaterialLabel = materialOptions.find(m => m.value === selectedMaterial)?.label || 'Unknown';
    try {
      const result = await automatedCostEstimation({
        modelDimensions: `${modelDimensions.x.toFixed(2)} x ${modelDimensions.y.toFixed(2)} x ${modelDimensions.z.toFixed(2)} mm`,
        materialSelection: currentMaterialLabel,
        aiPredictedParameters: JSON.stringify(predictedParams),
      });
      setEstimatedCost(result);
      toast({ title: "Cost Estimated", description: `Project cost is approximately $${result.estimatedCost.toFixed(2)}` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Estimation Failed", description: "Could not estimate cost." });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSuggestMaterials = async () => {
    if (!modelDescription || !costRequirements) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide a model description and cost requirements." });
        return;
    }
    setIsSuggesting(true);
    const currentMaterialLabel = materialOptions.find(m => m.value === selectedMaterial)?.label || 'Unknown';
    try {
        const suggestions = await suggestMaterials({
            modelDescription,
            costRequirements,
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

      <div className="lg:col-span-2 space-y-4">
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
                  <Label htmlFor="material-type">Material Type</Label>
                  <Input id="material-type" value={predictedParams.materialType} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welding-time">Welding Time (hours)</Label>
                  <Input id="welding-time" value={predictedParams.weldingTime} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other-params">Other Parameters</Label>
                  <Textarea id="other-params" value={predictedParams.otherParameters} readOnly />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {predictedParams && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><DollarSign /> Cost Estimation</CardTitle>
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
                <Alert className="mt-4">
                    <DollarSign className="h-4 w-4" />
                    <AlertTitle>Estimated Cost: ${estimatedCost.estimatedCost.toFixed(2)}</AlertTitle>
                    <AlertDescription>{estimatedCost.costBreakdown}</AlertDescription>
                </Alert>
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
                    <div className="space-y-2">
                        <Label htmlFor="cost-reqs">Cost Requirements</Label>
                        <Input id="cost-reqs" placeholder="e.g., Under $50 per unit" value={costRequirements} onChange={(e) => setCostRequirements(e.target.value)} />
                    </div>
                    <Button onClick={handleSuggestMaterials} disabled={isSuggesting} className="w-full">
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
