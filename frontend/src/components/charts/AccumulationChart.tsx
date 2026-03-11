import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { ChartDataPoint } from '../../types';

interface AccumulationChartProps {
    data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} style={{ color: entry.color }} className="chart-tooltip-value">
                    {entry.name}: {entry.value.toFixed(6)} BTC
                </p>
            ))}
        </div>
    );
}

export default function AccumulationChart({ data }: AccumulationChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 opacity-30">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <p>No accumulation data yet</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradientVault" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v} ₿`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="vaultBTC"
                        name="Vault BTC"
                        stroke="#F7931A"
                        strokeWidth={2}
                        fill="url(#gradientVault)"
                    />
                    <Area
                        type="monotone"
                        dataKey="userBTC"
                        name="Your BTC"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#gradientUser)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
