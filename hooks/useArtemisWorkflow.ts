import { useState } from "react";

export function useArtemisWorkflow() {
    // --- State Management ---
    const [steps, setSteps] = useState<any[]>([]);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [error, setError] = useState<string>("");

    // --- Handlers ---
    const handleAddStep = (step: any) => {
        setSteps((prev) => [...prev, step]);
    };

    const handleRemoveStep = (index: number) => {
        setSteps((prev) => prev.filter((_, i) => i !== index));
        if (activeStep >= steps.length - 1 && activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleUpdateStep = (index: number, updated: any) => {
        setSteps((prev) => prev.map((step, i) => (i === index ? updated : step)));
    };

    const handleClear = () => {
        setSteps([]);
        setActiveStep(0);
        setError("");
    };

    return {
        steps, setSteps, activeStep, setActiveStep, error, setError,
        handleAddStep, handleRemoveStep, handleUpdateStep, handleClear
    };
}
