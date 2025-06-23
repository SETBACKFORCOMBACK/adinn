"use client";

import { useState } from "react";
import { estimateFromImage, type EstimateFromImageOutput } from "@/ai/flows/automated-cost-estimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Cpu, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import Image from "next/image";

// Helper to format camelCase keys into readable labels
const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export function CostEstimator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedResult, setEstimatedResult] = useState<EstimateFromImageOutput | null>(null);
  
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
      setEstimatedResult(null); // Clear previous results
    }
  };
  
  const handleEstimate = async () => {
    if (!imageFile) {
      toast({ variant: "destructive", title: "No Image Selected", description: "Please upload an image with project details." });
      return;
    }

    setIsEstimating(true);
    setEstimatedResult(null);

    try {
      if (!imagePreview) {
          throw new Error("Image preview is not available.");
      }
      
      const result = await estimateFromImage({ imageDataUri: imagePreview });
      setEstimatedResult(result);
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

      {estimatedResult && (
        <Card>
          <CardHeader>
            <CardTitle>Fabrication Estimate</CardTitle>
            <CardDescription>The following details were extracted and calculated from your image.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estimatedResult).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground text-sm">{formatKey(key)}</span>
                  <span className="font-semibold text-right">{value.toString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
