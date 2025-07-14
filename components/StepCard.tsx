import React from "react";
import { CheckCircle } from "lucide-react";


interface StepCardProps {
  step?: {
    title: string;
    icon: React.ReactNode;
    isUnlocked: boolean;
    isComplete: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  };
  title?: string;
  icon?: React.ReactNode;
  isUnlocked?: boolean;
  isComplete?: boolean;
  children?: React.ReactNode;
}


const StepCard: React.FC<StepCardProps> = (props) => {
  const step = props.step;
  const title = step ? step.title : props.title;
  const icon = step ? step.icon : props.icon;
  const isUnlocked = step ? step.isUnlocked : props.isUnlocked;
  const isComplete = step ? step.isComplete : props.isComplete;
  const children = step && step.children !== undefined ? step.children : props.children;

  return (
    <div className={`border border-slate-700 bg-slate-800/50 rounded-lg transition-all duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-lg font-bold text-cyan-300 tracking-wider">{title}</h2>
        </div>
        {isComplete && <CheckCircle className="text-lime-400" size={20} />}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default StepCard;
