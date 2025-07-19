"use client";
import StepCard from './StepCard';
import { useArtemis } from '../hooks/useArtemis';

const App: React.FC = () => {
  const {
    steps,
    csvText,
    setCsvText,
    csvData,
    activeTopic,
    setActiveTopic,
    handleLoadData,
    selectTopic,
  } = useArtemis();

  return (
    <div className="min-h-screen w-full bg-[#111827] flex flex-col items-center justify-center px-2 py-8">
      <h1
        className="text-5xl md:text-6xl font-extrabold uppercase tracking-widest text-cyan-400 drop-shadow-neon mb-2 text-center"
        style={{ letterSpacing: '0.18em', textShadow: '0 0 16px #00FFFF, 0 0 32px #00FFFF' }}
      >
        ARTEMIS
      </h1>
      <p className="text-slate-300 text-lg mb-8 text-center max-w-xl">
        Automated Real-Time Engagement & Marketing Intelligence System
      </p>
      <div className="w-full max-w-6xl min-h-[60vh] grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Control Panel (Left Column) */}
        <div className="bg-slate-800/50 rounded-2xl border border-[#475569] p-6 flex flex-col gap-6 shadow-lg backdrop-blur-md min-h-[400px] justify-start">
          <label htmlFor="csv-input" className="font-bold text-white mb-2 tracking-wide">CSV Data</label>
          <textarea
            id="csv-input"
            className="csv-input font-mono text-base bg-[#18181b] border-2 border-[#475569] rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="ID,TITLE,CONTENT,VISUAL"
            rows={6}
            style={{ resize: 'vertical' }}
          />
          <button
            className="btn flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#111827] font-bold rounded-lg px-4 py-2 transition-all duration-150 transform hover:scale-105 shadow focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onClick={handleLoadData}
          >
            <span className="icon">⟳</span> Load/Update CSV Data
          </button>
          <label className="font-bold text-white mt-4 mb-2 tracking-wide">Select Active Topic</label>
          <div className="flex flex-wrap gap-3">
            {csvData.map((topic) => (
              <button
                key={topic.ID}
                className={`example-topic flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-150 shadow focus:outline-none focus:ring-2 ${activeTopic?.ID === topic.ID
                  ? 'bg-cyan-400 text-[#111827] scale-105 ring-cyan-400'
                  : 'bg-slate-700 text-slate-200 hover:bg-cyan-400 hover:text-[#111827] hover:scale-105'}`}
                onClick={() => selectTopic(topic)}
              >
                <span className="icon">★</span> {topic.TITLE}
              </button>
            ))}
          </div>
          <div className="social-icons flex gap-4 mt-6 justify-center">
            <span className="icon text-cyan-400">in</span>
            <span className="icon text-cyan-400">tw</span>
            <span className="icon text-cyan-400">ig</span>
            <span className="icon text-cyan-400">rss</span>
          </div>
        </div>
        {/* Workspace (Right 2/3 Columns) */}
        <div className="md:col-span-2 flex flex-col gap-8 min-h-[400px] justify-start">
          {steps.length === 0 ? (
            <StepCard step={{
              title: "Workspace",
              icon: <span className="icon">🧠</span>,
              isUnlocked: true,
              isComplete: false,
              isActive: true,
              children: <div className="text-slate-400 text-lg">Your workflow steps will appear here.</div>
            }} />
          ) : (
            steps.map((step) => (
              <StepCard key={step.title} step={step} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
