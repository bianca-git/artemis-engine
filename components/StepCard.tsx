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

  // Neon glass effect, magenta border for special, lime check for complete
  const baseCard = "rounded-xl border transition-all duration-500 shadow-lg font-sans";
  const glassBg = "bg-slate-800/50 backdrop-blur-md";
  const borderColor = isActive ? "border-cyan-400" : isUnlocked ? "border-slate-700" : "border-slate-700";
  const opacity = isUnlocked ? "opacity-100" : "opacity-40 pointer-events-none";
  const scale = isActive ? "scale-105" : "scale-100";

  return (
    <div className={`${baseCard} ${glassBg} ${borderColor} ${opacity} ${scale}`}
      style={{ boxShadow: isActive ? "0 0 24px #00FFFF55" : "0 0 8px #111827" }}>
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-lg font-bold text-cyan-300 tracking-wider uppercase" style={{ letterSpacing: "0.08em" }}>{title}</h2>
        </div>
        {isComplete && <CheckCircle className="text-lime-400 drop-shadow-neon" size={22} />}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default StepCard;
