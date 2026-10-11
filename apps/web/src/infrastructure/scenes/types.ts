import type { ReactNode } from 'react';

export type InfrastructureScreenResult = {
  inputs: Readonly<Record<string, number | number[] | null>>;
  outputs: Readonly<Record<string, number | string | boolean | null | string[]>>;
  resultHash?: string;
};

export type SceneProps = {
  result: InfrastructureScreenResult | null;
  fuelResult?: InfrastructureScreenResult | null;
  step: number;
  flat: boolean;
};

export type SceneRow = { label: string; value: string };

export type SceneDiagramProps = {
  id: string;
  title: string;
  description: string;
  rows: readonly SceneRow[];
  flat: boolean;
  children: ReactNode;
};

export function numberOutput(
  result: InfrastructureScreenResult | null,
  key: string,
  unit: string,
  digits = 2,
) {
  const value = result?.outputs[key];
  if (!result) return 'Not run';
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not reported by this screen';
  return `${new Intl.NumberFormat('en', { maximumFractionDigits: digits }).format(value)}${unit ? ` ${unit}` : ''}`;
}

export function textOutput(result: InfrastructureScreenResult | null, key: string) {
  const value = result?.outputs[key];
  if (typeof value === 'string' && value.length) return value.replaceAll('-', ' ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return 'Not established';
}
