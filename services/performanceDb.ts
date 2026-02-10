
import { AircraftType, EngineRating, PerformanceDataset, CalculationResult, PerformanceModule } from '../types';

const DEFAULT_WEIGHTS = [85000, 80000, 75000, 70000, 65000, 60000, 55000, 50000, 45000, 40000];
const DEFAULT_FLAPS = ["40", "30", "15"];

const INITIAL_GRID_VREF = [
  [175, 183, 192], // 85000
  [170, 178, 187], // 80000
  [165, 173, 182], // 75000
  [160, 168, 177], // 70000
  [155, 163, 172], // 65000
  [151, 158, 167], // 60000
  [146, 153, 161], // 55000
  [141, 148, 156], // 50000
  [135, 142, 149], // 45000
  [128, 136, 143], // 40000
];

class MonotoneCubicSpline {
  private x: number[];
  private y: number[];
  private m: number[];

  constructor(x: number[], y: number[]) {
    this.x = x;
    this.y = y;
    const n = x.length;
    if (n < 2) {
        this.m = [0];
        return;
    }
    const delta: number[] = new Array(n - 1);
    const m: number[] = new Array(n);
    for (let i = 0; i < n - 1; i++) delta[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);
    m[0] = delta[0];
    for (let i = 1; i < n - 1; i++) m[i] = (delta[i - 1] + delta[i]) / 2;
    m[n - 1] = delta[n - 2];
    for (let i = 0; i < n - 1; i++) {
      if (delta[i] === 0) { m[i] = 0; m[i + 1] = 0; }
      else {
        const alpha = m[i] / delta[i];
        const beta = m[i + 1] / delta[i];
        const dist = alpha * alpha + beta * beta;
        if (dist > 9) {
          const tau = 3 / Math.sqrt(dist);
          m[i] = tau * alpha * delta[i];
          m[i + 1] = tau * beta * delta[i];
        }
      }
    }
    this.m = m;
  }

  interpolate(val: number): number {
    const x = this.x; const y = this.y; const m = this.m;
    if (x.length < 2) return y[0] || 0;
    
    let i = x.findIndex((v) => v >= val) - 1;
    if (i < 0) i = 0;
    if (i > x.length - 2) i = x.length - 2;
    const h = x[i + 1] - x[i];
    const t = (val - x[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * y[i] + h10 * h * m[i] + h01 * y[i + 1] + h11 * h * m[i + 1];
  }
}

const splineCache: Record<string, Record<string, MonotoneCubicSpline>> = {};

const getCacheKey = (module: PerformanceModule, aircraft: AircraftType, rating: EngineRating) => `${module}_${aircraft}_${rating}`;

export const loadDataset = (module: PerformanceModule, aircraft: AircraftType, rating: EngineRating): PerformanceDataset => {
  const key = getCacheKey(module, aircraft, rating);
  const saved = localStorage.getItem(`db_${key}`);
  if (saved) return JSON.parse(saved);
  
  const dataset: PerformanceDataset = {
    weights: [...DEFAULT_WEIGHTS],
    flaps: [...DEFAULT_FLAPS],
    grid: module === 'VREF' ? INITIAL_GRID_VREF.map(row => [...row]) : DEFAULT_WEIGHTS.map(() => DEFAULT_FLAPS.map(() => 0))
  };
  return dataset;
};

export const saveDataset = (module: PerformanceModule, aircraft: AircraftType, rating: EngineRating, dataset: PerformanceDataset) => {
  const key = getCacheKey(module, aircraft, rating);
  localStorage.setItem(`db_${key}`, JSON.stringify(dataset));
  rebuildSplines(module, aircraft, rating);
};

const rebuildSplines = (module: PerformanceModule, aircraft: AircraftType, rating: EngineRating) => {
  const key = getCacheKey(module, aircraft, rating);
  const dataset = loadDataset(module, aircraft, rating);
  
  const splines: any = {};
  dataset.flaps.forEach((flap, fIndex) => {
    const points = dataset.weights.map((w, wIndex) => ({
      weight: w,
      vref: dataset.grid[wIndex][fIndex]
    })).sort((a, b) => a.weight - b.weight);

    splines[flap] = new MonotoneCubicSpline(
      points.map(p => p.weight),
      points.map(p => p.vref)
    );
  });
  
  splineCache[key] = splines;
};

export const calculateVref = (
  weight: number, 
  flap: string, 
  aircraft: AircraftType, 
  rating: EngineRating
): CalculationResult => {
  const key = getCacheKey('VREF', aircraft, rating);
  if (!splineCache[key]) rebuildSplines('VREF', aircraft, rating);
  
  const dataset = loadDataset('VREF', aircraft, rating);
  const sortedWeights = [...dataset.weights].sort((a, b) => a - b);
  const minW = sortedWeights[0];
  const maxW = sortedWeights[sortedWeights.length - 1];

  if (weight < minW || weight > maxW) {
    return { vref: 0, isInterpolated: false, isValid: false, error: `Weight limit (${minW}-${maxW})` };
  }

  const spline = splineCache[key][flap];
  if (!spline) {
    return { vref: 0, isInterpolated: false, isValid: false, error: `Flap config mismatch` };
  }

  const vref = spline.interpolate(weight);
  return { 
    vref: Math.round(vref * 10) / 10, 
    isInterpolated: !dataset.weights.includes(weight), 
    isValid: true,
    metadata: { aircraft, rating }
  };
};
