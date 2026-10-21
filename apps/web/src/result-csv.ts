import type { EmtResult } from './emt/engine';
import type { ResearchResult } from './research/types';

const cell = (value: string) => `"${value.replaceAll('"', '""')}"`;

export function csvFor(result: EmtResult): string {
  const header = [
    'time_ms',
    'source_v',
    'bus_v',
    'source_a',
    'load_a',
    'stored_j',
    'balance_error_j',
    'model',
    'applied_config_json',
    'assumptions_json',
    'scope',
  ];
  const context = [
    result.model,
    JSON.stringify(result.config),
    JSON.stringify(result.assumptions),
    'Educational transient model; not facility validation.',
  ]
    .map(cell)
    .join(',');
  const rows = result.rows.map(
    (row) =>
      [
        row.time_ms,
        row.source_v,
        row.bus_v,
        row.source_a,
        row.load_a,
        row.stored_j,
        row.balance_error_j,
      ].join(',') +
      ',' +
      context,
  );
  return [header.join(','), ...rows].join('\r\n') + '\r\n';
}

export function csvResult(result: ResearchResult): string {
  const rows = [
    [
      'chart_id',
      'chart_title',
      'x_label',
      'x',
      'line_label',
      'y_label',
      'y',
      'study_id',
      'model',
      'applied_config_json',
      'solver_json',
      'assumptions_json',
      'scope',
    ],
  ];
  const context = [
    result.study_id,
    result.model,
    JSON.stringify(result.config),
    JSON.stringify(result.solver),
    JSON.stringify(result.assumptions),
    'Educational numerical study; not measured GPU-load traces or facility measurements.',
  ];
  for (const chart of result.charts) {
    const length = Math.min(chart.x.length, ...chart.lines.map((line) => line.values.length));
    for (let index = 0; index < length; index++) {
      for (const line of chart.lines) {
        rows.push([
          chart.id,
          chart.title,
          chart.x_label,
          String(chart.x[index]),
          line.label,
          chart.y_label,
          String(line.values[index]),
          ...context,
        ]);
      }
    }
  }
  return rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
