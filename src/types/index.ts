export type ProjectType = {
  id: string;
  name: string;
  dimensions: string;
  sqPipe: string;
  pipeWeightKg: number;
  totalLength: number;
  materialDetails?: {
    name: string;
    length: number;
  }[];
  totalCutting: number;
  totalWelding: number;
  cuttingTime: number;
  weldingTime: number;
  labourCost: number;
  helperCharge: number;
  consumables: number;
  imageUrl?: string;
};
