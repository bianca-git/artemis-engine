import React from "react";
import { CheckCircle } from "lucide-react";


interface StepCardProps {
  step?: {
    title: string;
    icon: React.ReactNode;
    isUnlocked: boolean;
    isComplete: boolean;
    isActive?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  };
  title?: string;
  icon?: React.ReactNode;
  isUnlocked?: boolean;
  isComplete?: boolean;
  isActive?: boolean;
  children?: React.ReactNode;
}


const StepCard: React.FC<StepCardProps> = (props) => {
  const step = props.step;
  const title = step ? step.title : props.title;
  const icon = step ? step.icon : props.icon;
  const isUnlocked = step ? step.isUnlocked : props.isUnlocked;
  const isComplete = step ? step.isComplete : props.isComplete;
  const isActive = step ? step.isActive : props.isActive;
  const children = step && step.children !== undefined ? step.children : props.children;

  // Neon Noir styling
  const baseClasses = `rounded-2xl shadow-lg backdrop-blur-md border transition-all duration-300 ${
    isUnlocked ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${
    isActive ? 'border-cyan-400' : isComplete ? 'border-lime-400' : 'border-[#475569]'} bg-slate-800/50`;

  return (
    <div className={baseClasses}>
      <div className="p-5 border-b border-[#475569] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className={`text-xl font-extrabold uppercase tracking-wider ${isActive ? 'text-cyan-400 drop-shadow-neon' : 'text-slate-200'}`} style={{ letterSpacing: "0.12em" }}>{title}</h2>
        </div>
        {isComplete && (
          <div className="flex items-center gap-2">
            <CheckCircle className="text-lime-400 w-6 h-6 animate-pulse" />
            <span className="text-lime-400 font-bold text-base">Complete</span>
          </div>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default StepCard;
