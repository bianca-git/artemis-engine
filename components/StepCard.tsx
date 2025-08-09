import React, { useCallback, useMemo } from "react";

/**
 * Optimized StepCard component with React performance optimizations
 */
interface StepConfig {
  title: string;
  icon?: React.ReactNode;
  isUnlocked?: boolean;
  isComplete?: boolean;
  children: React.ReactNode;
  hintLocked?: string;
}

interface StepCardProps {
  step: StepConfig;
  status?: 'locked' | 'ready' | 'running' | 'complete' | 'error';
  onReset?: () => void;
}

const StepCard = React.memo(({ step, onReset, status }: StepCardProps) => {
  const handleReset = useCallback(() => {
    if (!onReset) return;
    const ok = window.confirm('Reset this step? This will clear its results and downstream steps.');
    if (ok) onReset();
  }, [onReset]);

  const resetButton = useMemo(() => {
    if (!onReset) return null;
    
    return (
      <button
        onClick={handleReset}
        className="btn btn-xs btn-outline btn-error"
        type="button"
      >
        Reset
      </button>
    );
  }, [onReset, handleReset]);

  const iconElement = useMemo(() => {
    if (!step.icon) return null;
    return <span className="text-xl">{step.icon}</span>;
  }, [step.icon]);

  const derivedStatus: StepCardProps['status'] = status || (step.isComplete
    ? 'complete'
    : step.isUnlocked
      ? 'ready'
      : 'locked');

  return (
	<section className={`step-card card bg-base-100 dark:bg-neutral-900/80 shadow-xl border border-base-200 dark:border-neutral-700 mb-6 status-${derivedStatus}`}>
      <div className="card-body p-5 sm:p-6 gap-4">
        <header className="flex items-center justify-between">
          <h2 className="card-title text-lg flex items-center gap-2">
            {iconElement}
            {step.title}
          </h2>
          <div className="flex items-center gap-2">
            {derivedStatus === 'locked' ? (
              <span title="Locked" aria-label="Locked" className="text-neutral-400 dark:text-neutral-500 text-sm select-none">🔒</span>
            ) : (
              resetButton
            )}
          </div>
        </header>
        {derivedStatus === 'locked' && step.hintLocked && (
          <div className="text-xs opacity-70 italic" aria-live="polite">{step.hintLocked}</div>
        )}
        <div className="prose dark:prose-invert max-w-none">
          {step.children}
        </div>
      </div>
    </section>
  );
});

StepCard.displayName = 'StepCard';

export default StepCard;