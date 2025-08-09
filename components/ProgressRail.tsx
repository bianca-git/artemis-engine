"use client";
import React, { useMemo } from "react";

interface ProgressRailProps {
  workflowState: Record<string, boolean>;
}

const STEP_ORDER: { key: string; label: string }[] = [
  { key: "topic", label: "Topic" },
  { key: "blog", label: "Blog" },
  { key: "seo", label: "SEO" },
  { key: "visual", label: "Visual" },
  { key: "cms", label: "CMS" },
];

/**
 * Adaptive progress rail indicating current & completed workflow steps.
 */
const ProgressRail: React.FC<ProgressRailProps> = ({ workflowState }) => {
  const currentIndex = useMemo(() => {
    for (let i = 0; i < STEP_ORDER.length; i++) {
      const k = STEP_ORDER[i].key;
      if (!workflowState[k]) return i;
    }
    return STEP_ORDER.length - 1;
  }, [workflowState]);

  return (
    <nav aria-label="Workflow progress" className="progress-rail">
      <ol className="flex lg:flex-col gap-2 w-full justify-between lg:justify-start">
        {STEP_ORDER.map((s, idx) => {
          const complete = workflowState[s.key];
          const isCurrent = idx === currentIndex && !complete;
          return (
            <li key={s.key} className="flex-1">
              <div
                className={[
                  "rail-item px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 border",
                  complete
                    ? "rail-complete"
                    : isCurrent
                    ? "rail-current"
                    : "rail-upcoming",
                ].join(" ")}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-inset ring-base-300 bg-base-100">
                  {complete ? "✓" : idx + 1}
                </span>
                <span>{s.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ProgressRail;
