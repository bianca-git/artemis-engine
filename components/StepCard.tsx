// components/StepCard.tsx
import React from "react";

const StepCard = ({ step, onReset }) => {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 p-6 mb-6 flex flex-col gap-4">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
          {step.icon && <span className="text-xl">{step.icon}</span>}
          {step.title}
        </h3>
        {onReset && (
          <button
            onClick={onReset}
            className="btn btn-xs btn-outline btn-error"
            type="button"
          >
            Reset
          </button>
        )}
      </header>
      <div className="text-neutral-700 dark:text-neutral-200">
        {step.children}
      </div>
    </section>
  );
};

export default StepCard;