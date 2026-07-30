import { useState, useEffect } from "react";
import axios from "axios";
import Progress3D from "./Progress3D";
import CodeEditor from "./CodeEditor";
import BootSequence from "./BootSequence";
import BackgroundFX from "./BackgroundFX";
import { computeXP, computeLevel, computeAchievements } from "./gamification";
import "./App.css";

const API = "https://coding-analytics-platform-backend.onrender.com";

function VerdictBadge({ verdict }) {
  const cls = ["AC", "WA", "CE", "RE"].includes(verdict) ? `badge-${verdict}` : "badge-default";
  return <span className={`badge ${cls}`}>[{verdict}]</span>;
}

function App() {
  const [booted, setBooted] = useState(sessionStorage.getItem("capBooted") === "true");
  const [tab, setTab] = useState("submit");

  const [studentId, setStudentId] = useState("");
  const [problemId, setProblemId] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [history, setHistory] = useState([]);
  const [lastVerdict, setLastVerdict] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const [pId, setPId] = useState("");
  const [pTitle, setPTitle] = useState("");
  const [pConcept, setPConcept] = useState("");
  const [pDifficulty, setPDifficulty] = useState("Easy");
  const [testCases, setTestCases] = useState([{ input: "", expected_output: "" }]);
  const [pDescription, setPDescription] = useState("");
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    const res = await axios.get(`${API}/history`);
    setHistory(res.data);
  };

  const fetchProblems = async () => {
    const res = await axios.get(`${API}/problems`);
    setProblems(res.data);
  };

  const fetchStats = async (id) => {
    const sid = id || studentId;
    if (!sid) return;
    const res = await axios.get(`${API}/stats/${sid}`);
    setStats(res.data);
  };

  const fetchRecommendation = async (id) => {
    const sid = id || studentId;
    if (!sid) return;
    const res = await axios.get(`${API}/recommend/${sid}`);
    setRecommendation(res.data);
  };

  useEffect(() => {
    fetchHistory();
    fetchProblems();
  }, []);

  const handleStudentIdBlur = () => {
    if (studentId) {
      fetchStats(studentId);
      fetchRecommendation(studentId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !problemId || !code) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API}/submit`, {
        student_id: studentId,
        problem_id: problemId,
        language,
        code,
      });
      setLastVerdict(res.data.verdict);
      setLastAnalysis(res.data.mistake_analysis);
      fetchHistory();
      const statsRes = await axios.get(`${API}/stats/${studentId}`);
      setStats(statsRes.data);
      const recRes = await axios.get(`${API}/recommend/${studentId}`);
      setRecommendation(recRes.data);
    } catch (err) {
      setSubmitError("Couldn't reach the server. Make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected_output: "" }]);
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    if (!pId || !pTitle || !pConcept) return;
    await axios.post(`${API}/problems`, {
  problem_id: pId,
  title: pTitle,
  concept: pConcept,
  difficulty: pDifficulty,
  description: pDescription,
  test_cases: testCases,
});
setPId(""); setPTitle(""); setPConcept(""); setPDescription("");
setTestCases([{ input: "", expected_output: "" }]);
    setPId(""); setPTitle(""); setPConcept("");
    setTestCases([{ input: "", expected_output: "" }]);
    fetchProblems();
  };

  if (!booted) {
    return (
      <BootSequence
        onDone={() => {
          sessionStorage.setItem("capBooted", "true");
          setBooted(true);
        }}
      />
    );
  }

  const xp = studentId ? computeXP(history, studentId) : 0;
  const { level, currentLevelXp, xpToNext } = computeLevel(xp);
  const achievements = studentId ? computeAchievements(history, studentId) : [];

  function barColor(pct) {
    if (pct >= 66) return "#3ddc97";
    if (pct >= 33) return "#ffb454";
    return "#ff5470";
  }
  const selectedProblem = problems.find((p) => p.problem_id === problemId);

  return (
    <>
      <BackgroundFX />
      <div className="dashboard-grid">
        <aside className="sidebar">
          <div className="side-card">
            <div className="avatar-circle">
              {studentId ? studentId.slice(0, 2).toUpperCase() : "??"}
            </div>
            <p className="side-card-title">{studentId || "no student id"}</p>
            {studentId && (
              <>
                <span className="xp-level-badge" style={{ marginBottom: "8px", display: "inline-block" }}>LVL {level}</span>
                <div className="xp-bar-track">
                  <div className="xp-bar-fill" style={{ width: `${(currentLevelXp / xpToNext) * 100}%` }}></div>
                </div>
                <p className="xp-label" style={{ marginTop: "6px" }}>{currentLevelXp} / {xpToNext} XP</p>
              </>
            )}
          </div>

          {!studentId && (
            <div className="guide-card">
              <p className="guide-title">Getting Started</p>
              <div className="guide-step">
                <span className="guide-step-num">1</span>
                <span>Enter a <strong style={{color: "var(--text)"}}>student_id</strong> in the field to the right — this tracks your submissions and progress.</span>
              </div>
              <div className="guide-step">
                <span className="guide-step-num">2</span>
                <span>Pick a problem from the dropdown, choose your language, and write your solution in the editor.</span>
              </div>
              <div className="guide-step">
                <span className="guide-step-num">3</span>
                <span>Click <strong style={{color: "var(--text)"}}>run & submit</strong> — you'll get an instant verdict plus AI feedback if something's wrong.</span>
              </div>
              <div className="guide-step">
                <span className="guide-step-num">4</span>
                <span>Check <strong style={{color: "var(--text)"}}>Progress</strong> for your concept mastery and <strong style={{color: "var(--text)"}}>Next</strong> for personalized recommendations.</span>
              </div>
              <div className="guide-step">
                <span className="guide-step-num">5</span>
                <span>Visit <strong style={{color: "var(--text)"}}>Profile</strong> to track achievements and level up as you solve more problems.</span>
              </div>
            </div>
          )}

           {studentId && stats.length > 0 && (
            <div className="side-card">
              <p className="side-card-title">concept mastery</p>
              {stats.map((s) => (
                <div key={s.concept} className="mini-bar-row">
                  <div className="mini-bar-label">
                    <span>{s.concept}</span>
                    <span>{s.percentage}%</span>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${s.percentage}%`, background: barColor(s.percentage) }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {studentId && recommendation && recommendation.target_concept && (
            <div className="side-card">
              <p className="side-card-title">next up</p>
              <p className="side-reco">
                Focus on <strong>{recommendation.target_concept}</strong>. {recommendation.reason}
              </p>
            </div>
          )}

          {studentId && (
            <div className="side-card">
              <p className="side-card-title">achievements</p>
              <div className="side-achievements">
                {achievements.map((a) => (
                  <div key={a.id} className={`side-ach-icon ${a.earned ? "earned" : ""}`} title={a.name}>
                    {a.earned ? "✓" : "🔒"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="main-content">
          <div className="app-header">
            <h1 className="app-title">Coding Analytics Platform<span className="cursor"></span></h1>
            <p className="app-subtitle">Practice. Analyze. Improve.</p>
          </div>

          <div className="tab-bar">
            <button className={`tab-btn ${tab === "submit" ? "active" : ""}`} onClick={() => setTab("submit")}>
              <span className="tab-dot"></span> Submit
            </button>
            <button className={`tab-btn ${tab === "addproblem" ? "active" : ""}`} onClick={() => setTab("addproblem")}>
              <span className="tab-dot"></span> Problems
            </button>
            <button className={`tab-btn ${tab === "progress" ? "active" : ""}`} onClick={() => { setTab("progress"); fetchStats(); }}>
              <span className="tab-dot"></span> Progress
            </button>
            <button className={`tab-btn ${tab === "recommend" ? "active" : ""}`} onClick={() => { setTab("recommend"); fetchRecommendation(); }}>
              <span className="tab-dot"></span> Next
            </button>
            <button className={`tab-btn ${tab === "achievements" ? "active" : ""}`} onClick={() => setTab("achievements")}>
              <span className="tab-dot"></span> Profile
            </button>
            <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
              <span className="tab-dot"></span> History
            </button>
          </div>

          {tab === "submit" && (
            <>
              <div className="panel">
                <form onSubmit={handleSubmit}>
                  <div className="submit-grid">
                    <div>
                      <div className="field-row">
                        <input
                          placeholder="student_id"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          onBlur={handleStudentIdBlur}
                        />
                        <select value={problemId} onChange={(e) => setProblemId(e.target.value)}>
                          <option value="">
                            {problems.length === 0 ? "no problems seeded yet" : "select problem"}
                          </option>
                          {problems.map((p) => (
                            <option key={p._id} value={p.problem_id}>{p.problem_id} — {p.title}</option>
                          ))}
                        </select>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                          <option value="cpp">cpp</option>
                          <option value="python">python</option>
                        </select>
                      </div>

                      {selectedProblem && (
                        <div className="ai-feedback">
                          <p className="ai-feedback-label">{selectedProblem.problem_id} — {selectedProblem.title}</p>
                          <p className="ai-feedback-text">
                            {selectedProblem.description || "No description added for this problem yet."}
                          </p>
                          {selectedProblem.test_cases && selectedProblem.test_cases[0] && (
                            <div style={{ marginTop: "12px" }}>
                              <p className="ai-feedback-label">Example</p>
                              <p className="ai-feedback-text" style={{ marginBottom: "6px" }}>
                                Input: <code>{selectedProblem.test_cases[0].input}</code>
                              </p>
                              <p className="ai-feedback-text">
                                Output: <code>{selectedProblem.test_cases[0].expected_output}</code>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <CodeEditor code={code} setCode={setCode} language={language} />
                      <div style={{ marginTop: "14px" }}>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                          {isSubmitting ? "running..." : "run & submit"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                {submitError && (
                  <div className="ai-feedback" style={{ borderLeftColor: "var(--red)" }}>
                    <p className="ai-feedback-label" style={{ color: "var(--red)" }}>error</p>
                    <p className="ai-feedback-text">{submitError}</p>
                  </div>
                )}

                {lastVerdict && (
                  <div className="verdict-line">
                    <span>verdict:</span>
                    <VerdictBadge verdict={lastVerdict} />
                  </div>
                )}

                {lastAnalysis && (
                  <div className="ai-feedback">
                    <p className="ai-feedback-label">ai feedback</p>
                    <p className="ai-feedback-text">{lastAnalysis}</p>
                  </div>
                )}

                {lastVerdict && stats.length > 0 && (
                  <div className="live-snapshot">
                    <p className="snapshot-label">live snapshot</p>
                    <div className="snapshot-stats">
                      {stats.map((s) => (
                        <span key={s.concept} className="snapshot-chip">{s.concept} {s.percentage}%</span>
                      ))}
                    </div>
                    {recommendation && recommendation.target_concept && (
                      <p className="snapshot-reco">next up: <strong>{recommendation.target_concept}</strong> — {recommendation.reason}</p>
                    )}
                  </div>
                )}
              </div>

              <h2 className="section-heading">Recent Submissions</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>time</th>
                    <th>student</th>
                    <th>problem</th>
                    <th>lang</th>
                    <th>verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {(studentId ? history.filter((r) => r.student_id === studentId) : history).slice(0, 3).map((r) => (
                    <tr key={r._id}>
                      <td>{r.timestamp}</td>
                      <td>{r.student_id}</td>
                      <td>{r.problem_id}</td>
                      <td>{r.language}</td>
                      <td><VerdictBadge verdict={r.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(studentId ? history.filter((r) => r.student_id === studentId) : history).length === 0 && (
                <p className="muted" style={{ marginTop: "8px" }}>No submissions yet — solve a problem above to see it here.</p>
              )}
              {(studentId ? history.filter((r) => r.student_id === studentId) : history).length > 0 && (
                <p className="muted" style={{ marginTop: "8px" }}>See full history in <strong style={{color: "var(--pink)"}}>History</strong></p>
              )}
            </>
          )}

          {tab === "addproblem" && (
            <div className="panel">
              <form onSubmit={handleAddProblem}>
                <div className="field-row">
                  <input placeholder="problem_id (e.g. P001)" value={pId} onChange={(e) => setPId(e.target.value)} />
                  <input placeholder="title" value={pTitle} onChange={(e) => setPTitle(e.target.value)} />
                </div>
                <div className="field-row">
                  <input placeholder="concept (e.g. Arrays)" value={pConcept} onChange={(e) => setPConcept(e.target.value)} />
                  <select value={pDifficulty} onChange={(e) => setPDifficulty(e.target.value)}>
  <option value="Easy">Easy</option>
  <option value="Medium">Medium</option>
  <option value="Hard">Hard</option>
</select>
</div>

<textarea
  placeholder="Full question description, written in plain sentences (like LeetCode)"
  value={pDescription}
  onChange={(e) => setPDescription(e.target.value)}
  rows="5"
  style={{ width: "100%", marginBottom: "12px" }}
/>

<h3 className="section-heading" style={{ marginTop: "20px", fontSize: "15px" }}>test cases</h3>
                {testCases.map((tc, i) => (
                  <div key={i} className="testcase-row">
                    <textarea placeholder="input" value={tc.input} onChange={(e) => updateTestCase(i, "input", e.target.value)} rows="3" style={{ flex: 1 }} />
                    <textarea placeholder="expected_output" value={tc.expected_output} onChange={(e) => updateTestCase(i, "expected_output", e.target.value)} rows="3" style={{ flex: 1 }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" className="btn-ghost" onClick={addTestCase}>+ add test case</button>
                  <button type="submit" className="btn-primary">save problem</button>
                </div>
              </form>
            </div>
          )}

          {tab === "progress" && (
            <div>
              <h2 className="section-heading" style={{ marginTop: 0 }}>concept mastery — 3d view</h2>
              <p className="muted">drag to rotate, scroll to zoom</p>
              <Progress3D stats={stats} />
            </div>
          )}

          {tab === "recommend" && (
            <div className="panel">
              <h2 className="section-heading" style={{ marginTop: 0 }}>recommended next steps</h2>
              {!recommendation && <p className="muted">loading...</p>}
              {recommendation && !recommendation.target_concept && (
                <p className="muted">no weak areas detected yet — keep practicing across topics.</p>
              )}
              {recommendation && recommendation.target_concept && (
                <div>
                  <p className="reco-reason">{recommendation.reason}</p>
                  <h3 className="section-heading" style={{ fontSize: "14px" }}>
                    suggested problems in {recommendation.target_concept}:
                  </h3>
                  {recommendation.recommended_problems.map((p) => (
                    <div key={p.problem_id} className="reco-card">
                      <strong>{p.problem_id}</strong> — {p.title} <em>({p.difficulty})</em>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "achievements" && (
            <div className="panel">
              <h2 className="section-heading" style={{ marginTop: 0 }}>achievements</h2>
              {!studentId && <p className="muted">enter a student_id in the Submit tab first.</p>}
              {studentId && (
                <div className="achievement-grid">
                  {achievements.map((a) => (
                    <div key={a.id} className={`achievement-card ${a.earned ? "earned" : ""}`}>
                      <p className="achievement-name">{a.earned ? "✓" : "🔒"} {a.name}</p>
                      <p className="achievement-desc">{a.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "history" && (
            <div>
              <h2 className="section-heading" style={{ marginTop: 0 }}>full submission history</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>time</th>
                    <th>student</th>
                    <th>problem</th>
                    <th>lang</th>
                    <th>verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r._id}>
                      <td>{r.timestamp}</td>
                      <td>{r.student_id}</td>
                      <td>{r.problem_id}</td>
                      <td>{r.language}</td>
                      <td><VerdictBadge verdict={r.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <p className="muted">No submissions recorded yet.</p>}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;