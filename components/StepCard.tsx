// components/StepCard.tsx
import React from "react";
import { CheckCircle } from "lucide-react";

interface Step {
  title: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  isComplete: boolean;
  children: React.ReactNode;
}

interface StepCardProps {
  step: Step;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const { title, icon, isUnlocked, isComplete, children } = step;

  return (
    <div className={`border border-brand-slate-dark bg-slate-800/50 rounded-lg transition-all duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <div className="p-4 border-b border-brand-slate-dark flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-lg font-bold text-neon-cyan tracking-wider">{title}</h2>
        </div>
        {isComplete && <CheckCircle className="text-feedback-success" size={20} />}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default StepCard;