'use client';

import { create } from 'zustand';

export interface Artifact {
  id: string;
  type: 'code' | 'text' | 'image' | 'sheet';
  title: string;
  content: string;
  language?: string;
  isVisible: boolean;
  createdAt: Date;
}

interface ArtifactState {
  artifacts: Artifact[];
  currentArtifact: Artifact | null;
  isLoading: boolean;
  
  setArtifacts: (artifacts: Artifact[]) => void;
  setCurrentArtifact: (artifact: Artifact | null) => void;
  addArtifact: (artifact: Artifact) => void;
  updateArtifact: (artifactId: string, updates: Partial<Artifact>) => void;
  removeArtifact: (artifactId: string) => void;
  toggleArtifactVisibility: (artifactId: string) => void;
  setLoading: (loading: boolean) => void;
  clearArtifacts: () => void;
}

export const useArtifactStore = create<ArtifactState>((set, get) => ({
  artifacts: [],
  currentArtifact: null,
  isLoading: false,
  
  setArtifacts: (artifacts) => set({ artifacts }),
  
  setCurrentArtifact: (currentArtifact) => set({ currentArtifact }),
  
  addArtifact: (artifact) => 
    set((state) => ({ 
      artifacts: [...state.artifacts, artifact] 
    })),
  
  updateArtifact: (artifactId, updates) => 
    set((state) => ({
      artifacts: state.artifacts.map(artifact => 
        artifact.id === artifactId ? { ...artifact, ...updates } : artifact
      ),
      currentArtifact: state.currentArtifact?.id === artifactId 
        ? { ...state.currentArtifact, ...updates } 
        : state.currentArtifact
    })),
  
  removeArtifact: (artifactId) => 
    set((state) => ({
      artifacts: state.artifacts.filter(artifact => artifact.id !== artifactId),
      currentArtifact: state.currentArtifact?.id === artifactId ? null : state.currentArtifact
    })),
  
  toggleArtifactVisibility: (artifactId) => 
    set((state) => ({
      artifacts: state.artifacts.map(artifact => 
        artifact.id === artifactId 
          ? { ...artifact, isVisible: !artifact.isVisible }
          : artifact
      ),
      currentArtifact: state.currentArtifact?.id === artifactId
        ? { ...state.currentArtifact, isVisible: !state.currentArtifact.isVisible }
        : state.currentArtifact
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearArtifacts: () => set({ 
    artifacts: [], 
    currentArtifact: null 
  })
}));
