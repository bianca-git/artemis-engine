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

  // Simple boring styling
  const baseClasses = "simple-card";
  const activeClasses = isActive ? "border-blue-300" : "";
  const opacityClass = isUnlocked ? "opacity-100" : "opacity-50";

  return (
    <div className={`${baseClasses} ${activeClasses} ${opacityClass}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-gray-100 text-gray-600">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        {isComplete && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span className="text-green-500 font-medium text-sm">Complete</span>
          </div>
        )}
      </div>
      <div className="p-4 text-gray-700">
        {children}
      </div>
    </div>
  );
};

export default StepCard;
