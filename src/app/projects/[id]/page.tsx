'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useParams, useRouter } from 'next/navigation';
import Stepper from '@/components/Stepper';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import RTMView from '@/components/RTMView';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectWorkspace() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: projectData, error, isLoading } = useSWR(`/api/projects?id=${id}`, () =>
        // We actually need a specific get endpoint, but for MVP list filters or we implement getById.
        // Actually, we implemented getAll in GET /api/projects. Ideally we need GET /api/projects/[id] or filter.
        // Let's rely on the fact that for MVP we might just fetch all and find, OR simpler:
        // I should have implemented GET /api/projects/[id].
        // Let's do a quick fetch to the specific endpoint I need to create or reusing the list is inefficient.
        // Wait, I didn't create a GET /api/projects/[id] route yet. I only made POST.
        // I'll make a quick inline fetcher that calls the server action or just ...
        // Let's fix this by assuming I will create the GET endpoint in a moment.
        fetch(`/api/projects/${id}`).then(res => res.json())
    );

    const [inputContent, setInputContent] = useState('');
    const [inputType, setInputType] = useState('Requirement');
    const [isProcessing, setIsProcessing] = useState(false);

    // Actions
    const handleIngest = async () => {
        setIsProcessing(true);
        await fetch(`/api/projects/${id}/ingest`, {
            method: 'POST',
            body: JSON.stringify({ content: inputContent, type: inputType })
        });
        setInputContent('');
        mutate(`/api/projects/${id}`);
        setIsProcessing(false);
    };

    const handleGenerateDOU = async () => {
        setIsProcessing(true);
        await fetch(`/api/projects/${id}/dou`, { method: 'POST' });
        mutate(`/api/projects/${id}`);
        setIsProcessing(false);
    };

    const handleApproveDOU = async () => {
        setIsProcessing(true);
        await fetch(`/api/projects/${id}/dou`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'APPROVED' })
        });
        mutate(`/api/projects/${id}`);
        setIsProcessing(false);
    };

    const handleGenerateRTM = async () => {
        setIsProcessing(true);
        await fetch(`/api/projects/${id}/rtm`, { method: 'POST' });
        mutate(`/api/projects/${id}`); // We need to fetch RTM items separately actually
        setIsProcessing(false);
    };

    // RTM Items Fetcher
    const { data: rtmData } = useSWR(
        projectData?.data?.dou?.status === 'APPROVED' ? `/api/projects/${id}/rtm/items` : null,
        fetcher
    );
    // Wait, I returned RTM items in the POST, but I need a GET to see them on refresh. 
    // I should add a GET endpoint for sub-resources if I want them persistent.
    // For MVP, sticking to what returns from the main calls or adding a simple GET.

    if (isLoading) return <div className="p-10 flex justify-center">Loading Workspace...</div>;
    if (!projectData?.success) return <div className="p-10 text-red-500">Project not found</div>;

    const project = projectData.data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    {project.name}
                </h1>
                <div className="text-sm text-gray-500">
                    ID: {project.id}
                </div>
                <button onClick={() => router.push('/')} className="text-sm text-gray-500 hover:text-gray-900">
                    &larr; Back
                </button>
            </nav>

            <div className="max-w-7xl mx-auto px-6">
                <Stepper currentStatus={project.status} />

                <div className="grid grid-cols-12 gap-6 mt-6">
                    {/* Left Panel: Inputs & Assets */}
                    <div className="col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-semibold mb-4">1. Ingest Assets</h2>
                            <select
                                className="w-full mb-3 p-2 border rounded"
                                value={inputType}
                                onChange={(e) => setInputType(e.target.value)}
                            >
                                <option>Requirement</option>
                                <option>Meeting Notes</option>
                                <option>Email Thread</option>
                            </select>
                            <textarea
                                className="w-full h-32 p-3 border rounded mb-3 text-sm"
                                placeholder="Paste requirements here..."
                                value={inputContent}
                                onChange={(e) => setInputContent(e.target.value)}
                            />
                            <button
                                onClick={handleIngest}
                                disabled={isProcessing || !inputContent}
                                className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded font-medium disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Upload Asset'}
                            </button>

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Assets</h3>
                                <ul className="space-y-2">
                                    {project.assets.map((a: any) => (
                                        <li key={a.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs truncate">
                                            <span className="font-bold">{a.type}:</span> {a.content.substring(0, 50)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Main Panel: The Workspace */}
                    <div className="col-span-8 space-y-6">
                        {/* DOU Section */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">2. Document of Understanding (Analyst)</h2>
                                <div className="space-x-2">
                                    {!project.dou && (
                                        <button
                                            onClick={handleGenerateDOU}
                                            disabled={isProcessing || project.assets.length === 0}
                                            className="px-4 py-2 bg-purple-600 text-white rounded text-sm disabled:opacity-50"
                                        >
                                            Generage DOU
                                        </button>
                                    )}
                                    {project.dou?.status === 'DRAFT' && (
                                        <button
                                            onClick={handleApproveDOU}
                                            disabled={isProcessing}
                                            className="px-4 py-2 bg-green-600 text-white rounded text-sm"
                                        >
                                            Approve DOU
                                        </button>
                                    )}
                                </div>
                            </div>

                            {project.dou ? (
                                <div className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded h-96 overflow-y-auto border">
                                    <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 mb-2">
                                        {project.dou.status}
                                    </span>
                                    <MarkdownRenderer content={project.dou.content} />
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded">
                                    DOU not generated yet. Upload assets to begin.
                                </div>
                            )}
                        </div>

                        {/* RTM & Test Section (Only visible after APPROVAL) */}
                        {project.dou?.status === 'APPROVED' && (
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-opacity">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold">3. Architect & Engineer (Auto-Build)</h2>
                                    <div className="space-x-2">
                                        <button
                                            onClick={handleGenerateRTM}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition"
                                        >
                                            {project.dou.rtmItems?.length > 0 ? 'Refresh Architecture' : 'Generate Architecture'}
                                        </button>
                                    </div>
                                </div>

                                {/* Detailed RTM View */}
                                <div className="mt-4">
                                    <RTMView projectId={id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
