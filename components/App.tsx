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
    <div className="app-container center" style={{ minHeight: '100vh', justifyContent: 'flex-start' }}>
      <div className="card center" style={{ width: '100%', maxWidth: 600, marginTop: 32 }}>
        <h1 className="branding" style={{ marginBottom: 8 }}>ARTEMIS</h1>
        <p style={{ color: '#b3b3d1', marginBottom: 16, textAlign: 'center' }}>
          Automated Real-Time Engagement & Marketing Intelligence System
        </p>
        <div className="center" style={{ width: '100%', gap: 16 }}>
          <div style={{ width: '100%' }}>
            <label htmlFor="csv-input" style={{ fontWeight: 500 }}>CSV Data</label>
            <textarea
              id="csv-input"
              className="csv-input"
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="ID,TITLE,CONTENT,VISUAL"
              rows={4}
              style={{ width: '100%' }}
            />
            <button className="btn" onClick={handleLoadData} style={{ width: '100%' }}>
              ⟳ Load/Update CSV Data
            </button>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: 16 }}>
          <label style={{ fontWeight: 500 }}>Select Active Topic</label>
          <div className="center" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {csvData.map((topic) => (
              <button
                key={topic.ID}
                className="example-topic"
                onClick={() => selectTopic(topic)}
                style={{ fontWeight: activeTopic?.ID === topic.ID ? 'bold' : 'normal' }}
              >
                {topic.TITLE}
              </button>
            ))}
          </div>
        </div>
        <div className="social-icons" style={{ justifyContent: 'center', marginTop: 16 }}>
          <span className="icon">in</span>
          <span className="icon">tw</span>
          <span className="icon">ig</span>
          <span className="icon">rss</span>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 700, marginTop: 24 }}>
        {steps.map((step) => (
          <StepCard key={step.title} step={step} />
        ))}
      </div>
    </div>
  );
};

export default App;
