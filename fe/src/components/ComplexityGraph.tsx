import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useTheme } from "./ThemeProvider";

interface ComplexityGraphProps {
  isOpen: boolean;
  time: string;
  space: string;
  summary?: string;
}

const parse = (input: string) => {
  if (!input) return 1;
  const lower = input.toLowerCase();
  if (lower.includes("n^2") || lower.includes("n*n")) return 100;
  if (lower.includes("nlogn")) return 50;
  if (lower.includes("n")) return 30;
  if (lower.includes("1")) return 10;
  return 1;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white shadow-md rounded px-3 py-1 text-sm border border-gray-200">
        {payload[0].payload.name}: <strong>{payload[0].payload.label}</strong>
      </div>
    );
  }
  return null;
};

const ComplexityGraph: React.FC<ComplexityGraphProps> = ({ isOpen, time, space, summary }) => {
  const { theme } = useTheme();
  const labelColor = theme === "dark" ? "#fff" : "#000";
  if (!isOpen) return null;

  const data = [
    { name: "Time", value: parse(time), label: time },
    { name: "Space", value: parse(space), label: space },
  ];

  return (
    <div className="w-full h-64 bg-background p-4 border-t border-border flex flex-col justify-between">
      <h2 className="text-lg font-medium mb-3 text-center text-foreground tracking-wide">
        Complexity Overview
      </h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 80, bottom: 10, left: 40 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fill: labelColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[12, 12, 12, 12]} fill="url(#gradient)">
              <LabelList dataKey="label" position="right" fill={labelColor} fontSize={13} />
            </Bar>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {summary && (
        <div className="mt-3 text-xs text-foreground text-center font-medium">
          {summary}
        </div>
      )}
    </div>
  );
};

export default ComplexityGraph;