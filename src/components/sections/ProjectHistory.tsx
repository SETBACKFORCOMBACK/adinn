import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Project } from "@/types";

const mockProjects: Project[] = [
  {
    id: "proj_001",
    name: "Mechanical Keyboard Case",
    thumbnailUrl: "https://placehold.co/600x400.png",
    material: "Aluminum",
    cost: 125.50,
    date: "2024-07-15",
    dataAiHint: "keyboard case",
  },
  {
    id: "proj_002",
    name: "Drone Frame Prototype",
    thumbnailUrl: "https://placehold.co/600x400.png",
    material: "Carbon Fiber",
    cost: 210.00,
    date: "2024-07-10",
    dataAiHint: "drone frame",
  },
  {
    id: "proj_003",
    name: "Figurine Model",
    thumbnailUrl: "https://placehold.co/600x400.png",
    material: "Plastic (PLA)",
    cost: 35.75,
    date: "2024-06-28",
    dataAiHint: "figurine model",
  },
    {
    id: "proj_004",
    name: "Architectural Miniature",
    thumbnailUrl: "https://placehold.co/600x400.png",
    material: "Plastic (PLA)",
    cost: 88.20,
    date: "2024-06-22",
    dataAiHint: "architectural model"
  },
  {
    id: "proj_005",
    name: "Custom Gear Set",
    thumbnailUrl: "https://placehold.co/600x400.png",
    material: "Steel",
    cost: 154.90,
    date: "2024-06-18",
    dataAiHint: "gear set"
  },
  {
    id: "proj_006",
    name: "Phone Stand",
    thumbnailUrl: "https://placehold.co/600x400.png",
    material: "Copper",
    cost: 65.00,
    date: "2024-06-05",
    dataAiHint: "phone stand"
  },
];

export function ProjectHistory() {
  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Past Projects</CardTitle>
          <CardDescription>A log of your previously estimated models.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.name}
                    width={600}
                    height={400}
                    className="aspect-video object-cover"
                    data-ai-hint={project.dataAiHint}
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2">{project.material}</Badge>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(project.date).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <p className="text-lg font-bold text-primary">${project.cost.toFixed(2)}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
