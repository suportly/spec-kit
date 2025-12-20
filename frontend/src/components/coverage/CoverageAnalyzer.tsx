"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, FileText, TrendingUp, TrendingDown, Minus, Download, RefreshCw } from 'lucide-react';

interface CoverageMetrics {
  line_coverage: number;
  branch_coverage: number;
  function_coverage: number;
  total_lines: number;
  covered_lines: number;
  missing_lines: number[];
  excluded_lines: number[];
  timestamp: string;
}

interface FileCoverage {
  filename: string;
  metrics: CoverageMetrics;
  complexity_score?: number;
}

interface CoverageReport {
  project_name: string;
  total_metrics: CoverageMetrics;
  file_coverage: FileCoverage[];
  trend_data?: {
    history: Array<{
      timestamp: string;
      line_coverage: number;
      branch_coverage: number;
      total_lines: number;
      covered_lines: number;
    }>;
    trends: {
      trend: string;
      change_percentage: number;
      recent_average: number;
      previous_average: number;
    };
  };
  generated_at: string;
}

interface CoverageSummary {
  line_coverage: number;
  branch_coverage: number;
  total_files: number;
  files_with_low_coverage: number;
  trend: string;
  generated_at: string;
}

const CoverageAnalyzer: React.FC = () => {
  const [projectPath, setProjectPath] = useState('');
  const [testCommand, setTestCommand] = useState('python -m pytest');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<CoverageSummary | null>(null);
  const [reports, setReports] = useState<Array<any>>([]);
  const [selectedReport, setSelectedReport] = useState<CoverageReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/coverage/reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const runAnalysis = async () => {
    if (!projectPath.trim()) {
      setError('Please provide a project path');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/coverage/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_path: projectPath,
          test_command: testCommand,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh summary after a delay
        setTimeout(() => {
          loadSummary();
          loadReports();
        }, 5000);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Error starting analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSummary = async () => {
    if (!projectPath.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/coverage/summary?project_path=${encodeURIComponent(projectPath)}`);
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/coverage/report/${reportId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedReport(data.data);
      }
    } catch (err) {
      console.error('Error loading report:', err);
    }
  };

  const generateHtmlReport = async () => {
    if (!projectPath.trim()) return;

    try {
      const response = await fetch('/api/coverage/generate-html-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_path: projectPath,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`HTML report generated at: ${data.data.report_path}`);
      }
    } catch (err) {
      console.error('Error generating HTML report:', err);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-600';
    if (coverage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadgeVariant = (coverage: number) => {
    if (coverage >= 80) return 'default';
    if (coverage >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Coverage Analyzer
          </CardTitle>
          <CardDescription>
            Analyze test coverage with detailed metrics and trend tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectPath">Project Path</Label>
              <Input
                id="projectPath"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="/path/to/your/project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testCommand">Test Command</Label>
              <Input
                id="testCommand"
                value={testCommand}
                onChange={(e) => setTestCommand(e.target.value)}
                placeholder="python -m pytest"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing || !projectPath.trim()}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button
              variant="outline"
              onClick={loadSummary}
              disabled={loading || !projectPath.trim()}
            >
              Load Summary
            </Button>
            <Button
              variant="outline"
              onClick={generateHtmlReport}
              disabled={!projectPath.trim()}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              HTML Report
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCoverageColor(summary.line_coverage)}`}>
                  {summary.line_coverage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Line Coverage</div>
                <Progress value={summary.line_coverage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCoverageColor(summary.branch_coverage)}`}>
                  {summary.branch_coverage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Branch Coverage</div>
                <Progress value={summary.branch_coverage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.total_files}</div>
                <div className="text-sm text-gray-500">Total Files</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={getCoverageBadgeVariant(summary.line_coverage)}>
                    {summary.trend}
                  </Badge>
                  {getTrendIcon(summary.trend)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Trend</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => loadReport(report.id)}
                  >
                    <div>
                      <div className="font-medium">{report.project_name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(report.generated_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCoverageBadgeVariant(report.line_coverage)}>
                        {report.line_coverage.toFixed(1)}%
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {report.total_files} files
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          {selectedReport ? (
            <Card>
              <CardHeader>
                <CardTitle>Coverage Details - {selectedReport.project_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getCoverageColor(selectedReport.total_metrics.line_coverage)}`}>
                        {selectedReport.total_metrics.line_coverage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Line Coverage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {selectedReport.total_metrics.covered_lines}/{selectedReport.total_metrics.total_lines}
                      </div>
                      <div className="text-sm text-gray-500">Lines Covered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{selectedReport.file_coverage.length}</div>
                      <div className="text-sm text-gray-500">Files Analyzed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">File Coverage</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {selectedReport.file_coverage.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="text-sm font-mono">{file.filename}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getCoverageBadgeVariant(file.metrics.line_coverage)}>
                              {file.metrics.line_coverage.toFixed(1)}%
                            </Badge>
                            {file.complexity_score && (
                              <div className="text-xs text-gray-500">
                                Complexity: {file.complexity_score.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">Select a report to view details</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends">
          {selectedReport?.trend_data?.history ? (
            <Card>
              <CardHeader>
                <CardTitle>Coverage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedReport.trend_data.history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value: any) => [`${value.toFixed(1)}%`, 'Coverage']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="line_coverage" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {selectedReport.trend_data.trends && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(selectedReport.trend_data.trends.trend)}
                      <span className="font-medium capitalize">
                        {selectedReport.trend_data.trends.trend} trend
                      </span>
                      <Badge variant="outline">
                        {selectedReport.trend_data.trends.change_percentage > 0 ? '+' : ''}
                        {selectedReport.trend_data.trends.change_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">No trend data available</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverageAnalyzer;