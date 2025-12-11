'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR('/api/projects', fetcher);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      });
      const json = await res.json();
      if (json.success) {
        setNewProjectName('');
        mutate('/api/projects'); // Refresh list
        router.push(`/projects/${json.data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (error) return <div className="p-8 text-red-500">Failed to load projects.</div>;
  if (isLoading) return <div className="p-8">Loading projects...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            AutoCraft <span className="text-blue-600">QA</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Autonomous Requirements-to-Test Lifecycle
          </p>
        </header>

        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-800">
          <form onSubmit={createProject} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter new project name..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !newProjectName.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </section>

        <section className="grid gap-4">
          {data?.data?.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{project.status}</span>
                  </p>
                </div>
                <div className="text-gray-400 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </Link>
          ))}
          {data?.data?.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No projects yet. Create one to get started.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
