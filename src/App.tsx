/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { calculateProperties, SystemType, PropertyType } from '@/lib/math';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function App() {
  const [system, setSystem] = useState<SystemType>('system1');
  const [property, setProperty] = useState<PropertyType>('density');
  const [temperatureStr, setTemperatureStr] = useState<string>('500');
  
  const [x1Str, setX1Str] = useState<string>('0.33');
  const [x2Str, setX2Str] = useState<string>('0.33');
  const [x3Str, setX3Str] = useState<string>('0.34');

  const x1 = parseFloat(x1Str);
  const x2 = parseFloat(x2Str);
  const x3 = parseFloat(x3Str);
  const temp = parseFloat(temperatureStr);

  const x1Num = isNaN(x1) ? 0 : x1;
  const x2Num = isNaN(x2) ? 0 : x2;
  const x3Num = isNaN(x3) ? 0 : x3;
  const tempNum = isNaN(temp) ? 400 : temp;

  const sum = x1Num + x2Num + x3Num;
  const isExceeding = sum > 1.001;
  const isNegative = x1Num < 0 || x2Num < 0 || x3Num < 0;
  const hasError = isExceeding || isNegative;

  const result = useMemo(() => {
    if (hasError) return null;
    return calculateProperties(system, property, tempNum, x1Num, x2Num, x3Num);
  }, [system, property, tempNum, x1Num, x2Num, x3Num, hasError]);

  const chartData = useMemo(() => {
    if (hasError) return [];
    const data = [];
    for (let t = 400; t <= 700; t += 10) {
      const res = calculateProperties(system, property, t, x1Num, x2Num, x3Num);
      data.push({
        temperature: t,
        value: res.Y,
      });
    }
    return data;
  }, [system, property, x1Num, x2Num, x3Num, hasError]);

  const systemName = system === 'system1' ? 'LiNO₃ - NaNO₃ - KNO₃' : 'CsNO₃ - NaNO₃ - KNO₃';
  const c1 = system === 'system1' ? 'LiNO₃' : 'CsNO₃';
  const c2 = 'NaNO₃';
  const c3 = 'KNO₃';

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Ternary Nitrate Salt Properties</h1>
          <p className="text-neutral-500">
            Calculate similarity coefficients and thermophysical properties (density and viscosity) using the General Solution Model (GSM).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Set the system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Salt System</Label>
                  <Select value={system} onValueChange={(v) => setSystem(v as SystemType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system1">LiNO₃ - NaNO₃ - KNO₃</SelectItem>
                      <SelectItem value="system2">CsNO₃ - NaNO₃ - KNO₃</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select value={property} onValueChange={(v) => setProperty(v as PropertyType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="density">Density (g/cc)</SelectItem>
                      <SelectItem value="viscosity">Viscosity (cP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <Label>Temperature (K)</Label>
                    <Input 
                      type="text" 
                      inputMode="numeric"
                      className="w-20 h-8 font-mono text-right" 
                      value={temperatureStr} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setTemperatureStr(val);
                        }
                      }} 
                    />
                  </div>
                  <Slider
                    value={[tempNum]}
                    min={400}
                    max={700}
                    step={1}
                    onValueChange={(v) => setTemperatureStr(v[0].toString())}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label>Mole Fractions</Label>
                  
                  {isExceeding && (
                    <div className="text-sm font-medium text-red-500">
                      Error: The sum of mole fractions ({sum.toFixed(3)}) exceeds 1.
                    </div>
                  )}
                  {isNegative && (
                    <div className="text-sm font-medium text-red-500">
                      Error: Mole fractions cannot be negative.
                    </div>
                  )}
                  {(!isExceeding && !isNegative && Math.abs(sum - 1) > 0.001) && (
                    <div className="text-sm font-medium text-amber-500">
                      Warning: The sum of mole fractions ({sum.toFixed(3)}) should equal 1.
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{c1} (x₁)</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Slider
                          className="flex-1"
                          value={[x1Num]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(v) => setX1Str(v[0].toString())}
                        />
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          className="w-20 h-8 font-mono text-right" 
                          value={x1Str} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) {
                              setX1Str(val);
                            }
                          }} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{c2} (x₂)</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Slider
                          className="flex-1"
                          value={[x2Num]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(v) => setX2Str(v[0].toString())}
                        />
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          className="w-20 h-8 font-mono text-right" 
                          value={x2Str} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) {
                              setX2Str(val);
                            }
                          }} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{c3} (x₃)</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Slider
                          className="flex-1"
                          value={[x3Num]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(v) => setX3Str(v[0].toString())}
                        />
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          className="w-20 h-8 font-mono text-right" 
                          value={x3Str} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) {
                              setX3Str(val);
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total {property === 'density' ? 'Density' : 'Viscosity'}</CardDescription>
                  <CardTitle className="text-3xl font-light">
                    {result?.Y?.toFixed(4) ?? 'N/A'} <span className="text-sm text-neutral-500 font-normal">{property === 'density' ? 'g/cc' : 'cP'}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Excess Property (Yᴱ)</CardDescription>
                  <CardTitle className="text-3xl font-light">
                    {result?.YE?.toFixed(4) ?? 'N/A'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Ideal Mixture</CardDescription>
                  <CardTitle className="text-3xl font-light">
                    {(result?.Y !== undefined && result?.YE !== undefined) ? (result.Y - result.YE).toFixed(4) : 'N/A'}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Similarity Coefficients</CardTitle>
                <CardDescription>Calculated using Chou's General Solution Model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="text-sm font-medium text-neutral-500">ξ₁₂ ({c1}-{c2})</div>
                    <div className="text-2xl font-mono">{result?.xi12?.toFixed(4) ?? 'N/A'}</div>
                  </div>
                  <div className="space-y-1 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="text-sm font-medium text-neutral-500">ξ₂₃ ({c2}-{c3})</div>
                    <div className="text-2xl font-mono">{result?.xi23?.toFixed(4) ?? 'N/A'}</div>
                  </div>
                  <div className="space-y-1 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="text-sm font-medium text-neutral-500">ξ₃₁ ({c3}-{c1})</div>
                    <div className="text-2xl font-mono">{result?.xi31?.toFixed(4) ?? 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature Dependence</CardTitle>
                <CardDescription>
                  {property === 'density' ? 'Density' : 'Viscosity'} variation with temperature for the current composition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                      <XAxis 
                        dataKey="temperature" 
                        tick={{ fontSize: 12, fill: '#737373' }}
                        tickLine={false}
                        axisLine={false}
                        domain={[400, 700]}
                        type="number"
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#737373' }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => typeof val === 'number' ? val.toFixed(2) : ''}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [typeof value === 'number' ? value.toFixed(4) : value, property === 'density' ? 'Density (g/cc)' : 'Viscosity (cP)']}
                        labelFormatter={(label) => `${label} K`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0f172a" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#0f172a' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
