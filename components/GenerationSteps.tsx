import React from "react";
import BlogStep from "./steps/BlogStep";
import SEOStep from "./steps/SEOStep";
import VisualStep from "./steps/VisualStep";
import PublishStep from "./steps/PublishStep";

const GenerationSteps = (props) => (
  <>
    <BlogStep {...props} />
    <SEOStep {...props} />
    <VisualStep {...props} />
    <PublishStep {...props} />
  </>
);

export default GenerationSteps;

