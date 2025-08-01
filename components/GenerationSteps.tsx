import React from "react";
import BlogStep from "./steps/BlogStep";
import SEOStep from "./steps/SEOStep";
import VisualStep from "./steps/VisualStep";
import PublishStep from "./steps/PublishStep";

/**
 * Optimized GenerationSteps component with React.memo for performance
 * Prevents unnecessary re-renders when props haven't changed
 */
const GenerationSteps = React.memo((props: any) => (
  <>
    <BlogStep {...props} />
    <SEOStep {...props} />
    <VisualStep {...props} />
    <PublishStep {...props} />
  </>
));

GenerationSteps.displayName = 'GenerationSteps';

export default GenerationSteps;

