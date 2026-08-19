"use client";

/** Pure SVG bar chart — no charting SaaS. */
export function BarChart({
  title,
  values,
}: {
  title: string;
  values: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...values.map((item) => item.value), 1);
  const width = 480;
  const height = 220;
  const pad = 28;
  const barWidth = (width - pad * 2) / Math.max(values.length, 1) - 10;

  return (
    <figure className="surface rounded-2xl p-5">
      <figcaption className="mb-4 text-sm font-semibold">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="w-full">
        {values.map((item, index) => {
          const barHeight = ((item.value / max) * (height - pad * 2)) | 0;
          const x = pad + index * (barWidth + 10);
          const y = height - pad - barHeight;
          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill="#0F4C81" />
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="currentColor">
                {item.label}
              </text>
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="currentColor">
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function DonutChart({
  title,
  values,
}: {
  title: string;
  values: Array<{ label: string; value: number; color: string }>;
}) {
  const total = values.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <figure className="surface rounded-2xl p-5">
      <figcaption className="mb-4 text-sm font-semibold">{title}</figcaption>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 140 140" className="size-36" role="img" aria-label={title}>
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
          {values.map((item) => {
            const length = (item.value / total) * circumference;
            const node = (
              <circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += length;
            return node;
          })}
        </svg>
        <ul className="space-y-2 text-sm">
          {values.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
              <span className="text-muted-foreground">({item.value})</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
