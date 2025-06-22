"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Box } from 'lucide-react';

interface ModelViewerProps {
  file: File | null;
  materialColor: string;
  className?: string;
  onModelLoad: (dimensions: { x: number; y: number; z: number }) => void;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ file, materialColor, className, onModelLoad }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f0fe);

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    let model: THREE.Group | THREE.Mesh | null = null;
    let fileUrl: string | null = null;

    const loadModel = () => {
      if (!file) {
        scene.remove(...scene.children.filter(c => c.type === 'Group' || c.type === 'Mesh'));
        return;
      }
      setIsLoading(true);
      setError(null);
      
      fileUrl = URL.createObjectURL(file);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const loader = fileExtension === 'obj' ? new OBJLoader() : new STLLoader();

      (loader as any).load(fileUrl, (geometryOrObject: THREE.BufferGeometry | THREE.Object3D) => {
        if (model) {
          scene.remove(model);
        }

        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(materialColor),
          metalness: 0.1,
          roughness: 0.5,
        });

        if (geometryOrObject instanceof THREE.BufferGeometry) { // STL
          model = new THREE.Mesh(geometryOrObject, material);
        } else { // OBJ
          (geometryOrObject as THREE.Group).traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });
          model = geometryOrObject as THREE.Group;
        }

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Center the model
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim; // Scale model to fit in a 5x5x5 box
        model.scale.set(scale, scale, scale);

        scene.add(model);
        
        const finalSize = box.getSize(new THREE.Vector3());
        onModelLoad({x: finalSize.x, y: finalSize.y, z: finalSize.z});

        setIsLoading(false);
      }, undefined, (err) => {
        console.error('An error happened during model loading:', err);
        setError('Failed to load model. Please ensure it is a valid .obj or .stl file.');
        setIsLoading(false);
      });
    };

    loadModel();

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    
    const handleResize = () => {
        if (!currentMount) return;
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      window.removeEventListener('resize', handleResize);
      if(currentMount) {
        currentMount.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [file, materialColor, onModelLoad]);

  return (
    <div ref={mountRef} className={cn("w-full h-full min-h-[400px] bg-blue-50 rounded-lg relative overflow-hidden border", className)}>
      {isLoading && <Skeleton className="absolute inset-0" />}
      {!file && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <Box size={48} className="mb-4" />
          <p className="font-medium">3D Model Viewer</p>
          <p className="text-sm">Upload a model to begin</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-destructive p-4 text-center">
            {error}
        </div>
      )}
    </div>
  );
};
