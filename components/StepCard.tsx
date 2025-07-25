// components/StepCard.tsx
import React from "react";

const StepCard = ({ step, onReset }) => {
  return (
    <section>
      <header>
        <h3>{step.title}</h3>
        {onReset && <button onClick={onReset}>Reset</button>}
      </header>
      <div>
        {step.children}
      </div>
    </section>
  );
};

export default StepCard;