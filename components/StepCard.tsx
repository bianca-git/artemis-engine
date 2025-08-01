import React, { useCallback, useMemo } from "react";

/**
 * Optimized StepCard component with React performance optimizations
 */
const StepCard = React.memo(({ step, onReset }: any) => {
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
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

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 p-6 mb-6 flex flex-col gap-4">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
          {iconElement}
          {step.title}
        </h3>
        {resetButton}
      </header>
      <div className="text-neutral-700 dark:text-neutral-200">
        {step.children}
      </div>
    </section>
  );
});

StepCard.displayName = 'StepCard';

export default StepCard;