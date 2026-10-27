import { ValueTransformer } from 'typeorm';

// Postgres returns bigint as string; convert to/from JS number (epoch ms).
export const bigintTransformer: ValueTransformer = {
  to: (v?: number | null) => v,
  from: (v?: string | null) => (v === null || v === undefined ? null : Number(v)),
};
