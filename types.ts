
import React from 'react';

export enum AircraftType {
  NG = '737NG',
  MAX = '737MAX'
}

export type PerformanceModule = 'VREF' | 'TAKEOFF' | 'WB' | 'METAR';

export type EngineRating = '22K' | '24K' | '26K' | '26K_SF' | '25K' | '27K' | '28K';

export interface PerformanceDataset {
  weights: number[];
  flaps: string[]; // Dynamically defined by user (e.g. "15", "30", "40")
  grid: number[][]; // grid[weightIndex][flapIndex]
}

export interface CalculationResult {
  vref: number;
  isInterpolated: boolean;
  isValid: boolean;
  error?: string;
  metadata?: {
    aircraft: AircraftType;
    rating: EngineRating;
  };
}

export interface ToolItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  route: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  type: string;
  weight: number;
  flap: string;
  vref: number;
  aircraft: AircraftType;
  rating: EngineRating;
}

export interface AppSettings {
  unit: 'KG' | 'LB';
  theme: 'Light' | 'Dark';
  version: string;
  dbVersion: string;
}
