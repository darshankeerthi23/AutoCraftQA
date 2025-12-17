'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Loader2, FileCode, CheckCircle } from 'lucide-react';
import { RTMItem, TestScenario, TestCase, AutomatedTest } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RTMViewProps {
    projectId: string;
}

export default function RTMView({ projectId }: RTMViewProps) {
    // Ideally we would have a dedicated endpoint for the full hierarchy, 
    // but for MVP we might fetch RTM items and then load children or just fetch the project with full include.
    // The current GET /api/projects/[id] includes `dou` but not deep relations yet.
    // Let's update ProjectService.getById to include deep relations or just strict fetching here.
    // Actually, for the "Stepper" flow, let's assume we want to trigger generation.

    // Let's rely on a new endpoint or update the project fetch to include everything.
    // I will assume I'll update the project service to include `dou.rtmItems.scenarios.testCases.automatedTests`.

    const { data, isLoading } = useSWR(`/api/projects/${projectId}`, fetcher);
    const [processingId, setProcessingId] = useState<string | null>(null);

    if (isLoading) return <div>Loading Architecture...</div>;
    if (!data?.success) return null;

    const project = data.data;
    const rtmItems = project.dou?.rtmItems || [];

    const updateView = () => mutate(`/api/projects/${projectId}`);

    const handleGenScenarios = async (rtmItemId: string) => {
        setProcessingId(rtmItemId);
        await fetch(`/api/projects/${projectId}/scenarios`, {
            method: 'POST',
            body: JSON.stringify({ rtmItemId }),
        });
        updateView();
        setProcessingId(null);
    };

    const handleGenCases = async (scenarioId: string) => {
        setProcessingId(scenarioId);
        await fetch(`/api/projects/${projectId}/cases`, {
            method: 'POST',
            body: JSON.stringify({ scenarioId }),
        });
        updateView();
        setProcessingId(null);
    };

    const handleGenAutoTest = async (testCaseId: string) => {
        setProcessingId(testCaseId);
        await fetch(`/api/projects/${projectId}/automated-tests`, {
            method: 'POST',
            body: JSON.stringify({ testCaseId }),
        });
        updateView();
        setProcessingId(null);
    };

    return (
        <div className="space-y-8">
            {rtmItems.length === 0 && (
                <div className="text-gray-500 italic">No RTM items generated yet.</div>
            )}

            {rtmItems.map((item: RTMItem & { scenarios: (TestScenario & { testCases: (TestCase & { automatedTests: AutomatedTest[] })[] })[] }) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{item.reqId}</span>
                            <p className="mt-1 text-gray-800 dark:text-gray-200">{item.description}</p>
                        </div>
                        {(!item.scenarios || item.scenarios.length === 0) && (
                            <button
                                onClick={() => handleGenScenarios(item.id)}
                                disabled={!!processingId}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 text-sm font-medium"
                                data-testid="generate-scenarios"
                            >
                                {processingId === item.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                Generate Scenarios
                            </button>
                        )}
                    </div>

                    {/* Scenarios */}
                    {item.scenarios && item.scenarios.length > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-6 mt-4" data-testid="scenarios-output">
                            {item.scenarios.map((scen: TestScenario & { testCases: (TestCase & { automatedTests: AutomatedTest[] })[] }) => (
                                <div key={scen.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Scenario: {scen.title}</h4>
                                        {(!scen.testCases || scen.testCases.length === 0) && (
                                            <button
                                                onClick={() => handleGenCases(scen.id)}
                                                disabled={!!processingId}
                                                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 disabled:opacity-50"
                                                data-testid="generate-cases"
                                            >
                                                {processingId === scen.id ? '...' : 'Gen Cases'}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono ml-1">{scen.steps}</p>

                                    {/* Test Cases */}
                                    <div className="space-y-3 mt-3" data-testid="cases-output">
                                        {scen.testCases?.map((tc: TestCase & { automatedTests: AutomatedTest[] }) => (
                                            <div key={tc.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                            <span className="font-medium text-sm">{tc.title}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                            <div><strong>Steps:</strong> {tc.steps}</div>
                                                            <div><strong>Expected:</strong> {tc.expectedResult}</div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        {(!tc.automatedTests || tc.automatedTests.length === 0) ? (
                                                            <button
                                                                onClick={() => handleGenAutoTest(tc.id)}
                                                                disabled={!!processingId}
                                                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                                                title="Generate Automated Test"
                                                                data-testid="generate-automated-tests"
                                                            >
                                                                {processingId === tc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                                                            </button>
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Automated Test Code */}
                                                {tc.automatedTests?.map((at: AutomatedTest) => (
                                                    <div key={at.id} className="mt-3" data-testid="automated-tests-output">
                                                        <div className="bg-gray-900 text-gray-300 p-3 rounded text-xs font-mono overflow-x-auto relative group">
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="bg-gray-700 text-[10px] px-2 py-1 rounded">Playwright</span>
                                                            </div>
                                                            <pre>{at.code}</pre>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
