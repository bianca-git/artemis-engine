import React from "react";

const LoadDataSection = ({
  csvText,
  setCsvText,
  csvData,
  setCsvData,
  selectTopic,
  setWorkflowState,
  handleLoadData,
  csvRefreshTimeout,
}) => (
  <section>
    <div className="card w-full bg-base-100 shadow-xl mb-4">
      <div className="card-body">
        <h2 className="card-title">Load Data</h2>
        <p>Paste or upload CSV data to load into the topic workflow.</p>
        <textarea
          className="textarea textarea-bordered w-full h-32 mb-2"
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="Paste your CSV data here..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !csvRefreshTimeout.current) {
              e.preventDefault();
              handleLoadData();
              setWorkflowState(prev => ({
                ...prev,
                topic: true,
              }));
            }
          }}
          onLoad={() => {
            handleLoadData();
          }}
          onBlur={() => {
            handleLoadData();
          }}
        />
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn btn-info"
            onClick={() => {
              document.getElementById("csv-file-input")?.click();
            }}
          >
            Load CSV Data
          </button>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async event => {
                const text = event.target?.result;
                if (typeof text === "string") {
                  setCsvText(text);
                  await handleLoadData();
                  // Immediately unlock topic selection step
                  setWorkflowState(prev => ({
                    ...prev,
                    topic: true,
                  }));
                }
              };
              reader.readAsText(file);
              e.target.value = "";  // Reset file input to allow re-uploading the same file if needed       
            }}
          />
          {(csvText.length > 0 || csvData.length > 0) && (
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => {
                setCsvText("ID,TITLE,CONTENT,VISUAL");
                setCsvData([]);
                selectTopic(null);
                setWorkflowState({
                  topic: false,
                  blog: false,
                  visual: false,
                  seo: false,
                  social: false,
                  cms: false,
                });
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default LoadDataSection;