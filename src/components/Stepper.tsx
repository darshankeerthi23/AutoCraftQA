import { clsx } from 'clsx';
import { Check, Circle, Loader2 } from 'lucide-react';

const STEPS = [
    { id: 'INGESTION', label: 'Ingestion' },
    { id: 'DOU_REVIEW', label: 'DOU Review' },
    { id: 'RTM_BUILD', label: 'RTM Build' },
    { id: 'TEST_BUILD', label: 'Test Build' },
];

interface StepperProps {
    currentStatus: string;
}

export default function Stepper({ currentStatus }: StepperProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStatus);
    // If status is unknown, default to 0
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10" />

                {STEPS.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white dark:bg-gray-900 px-2">
                            <div
                                className={clsx(
                                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                                    isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : isCurrent
                                            ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 text-gray-400 bg-white dark:bg-gray-800'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6" />
                                ) : isCurrent ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Circle className="w-6 h-6" />
                                )}
                            </div>
                            <span
                                className={clsx(
                                    'text-xs font-semibold mt-2',
                                    isCurrent ? 'text-blue-500' : 'text-gray-500'
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
