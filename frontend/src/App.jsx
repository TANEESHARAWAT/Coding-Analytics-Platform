import { useState, useEffect } from "react";
import axios from "axios";
import Progress3D from "./Progress3D";
import CodeEditor from "./CodeEditor";
import BootSequence from "./BootSequence";
import Ferrofluid from "./Ferrofluid";
import BorderGlow from "./BorderGlow";
import LoginPage from "./LoginPage";
import { computeXP, computeLevel, computeAchievements } from "./gamification";
import "./App.css";

const API = "https://coding-analytics-platform-backend.onrender.com";

const VERDICT_LABELS = {
  AC: "Accepted",
  WA: "Wrong Answer",
  CE: "Compile Error",
  RE: "Runtime Error",
};

function VerdictBadge({ verdict }) {
  const cls = ["AC", "WA", "CE", "RE"].includes(verdict) ? `badge-${verdict}` : "badge-default";
  const label = VERDICT_LABELS[verdict] || verdict;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function App() {
  const [booted, setBooted] = useState(sessionStorage.getItem("capBooted") === "true");
  const [tab, setTab] = useState("submit");

  const [token, setToken] = useState(localStorage.getItem("capToken") || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("capEmail") || null);
  const [userName, setUserName] = useState(localStorage.getItem("capName") || null);
  const [authChecked, setAuthChecked] = useState(false);

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
  const [viewingCode, setViewingCode] = useState(null);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attach the token to every outgoing request, and log out automatically on 401
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  const handleAuthSuccess = (newToken, email, name) => {
    localStorage.setItem("capToken", newToken);
    localStorage.setItem("capEmail", email);
    localStorage.setItem("capName", name || email);
    setToken(newToken);
    setUserEmail(email);
    setUserName(name || email);
  };

  const handleLogout = () => {
    localStorage.removeItem("capToken");
    localStorage.removeItem("capEmail");
    localStorage.removeItem("capName");
    setToken(null);
    setUserEmail(null);
    setUserName(null);
    setHistory([]);
    setStats([]);
    setRecommendation(null);
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/history`);
      setHistory(res.data);
    } catch (err) {
      // 401s are handled globally by the interceptor
    }
  };

  const fetchProblems = async () => {
    const res = await axios.get(`${API}/problems`);
    setProblems(res.data);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`);
      setStats(res.data);
    } catch (err) {}
  };

  const fetchRecommendation = async () => {
    try {
      const res = await axios.get(`${API}/recommend`);
      setRecommendation(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchProblems();
    if (token) {
      fetchHistory();
      fetchStats();
      fetchRecommendation();
    }
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemId || !code) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API}/submit`, {
        problem_id: problemId,
        language,
        code,
      });
      setLastVerdict(res.data.verdict);
      setLastAnalysis(res.data.mistake_analysis);
      fetchHistory();
      fetchStats();
      fetchRecommendation();
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

  if (!token) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
  }

  const xp = computeXP(history, userEmail);
  const { level, currentLevelXp, xpToNext } = computeLevel(xp);
  const achievements = computeAchievements(history, userEmail);

  function barColor(pct) {
    if (pct >= 66) return "#3ddc97";
    if (pct >= 33) return "#ffb454";
    return "#ff5470";
  }
  const selectedProblem = problems.find((p) => p.problem_id === problemId);

  return (
    <>
      <Ferrofluid
        className="ferro-bg"
        colors={["#ff4d2e", "#ff8a3d", "#baff29"]}
        speed={0.4}
        scale={1.4}
        turbulence={0.8}
        glow={2.2}
        flowDirection="down"
        mouseInteraction={true}
        mouseStrength={1}
      />
      <div className="dashboard-grid">
        <aside className="sidebar">
          <BorderGlow className="side-card-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={20}>
          <div className="side-card">
            <div className="avatar-circle">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <p className="side-card-title" style={{ marginBottom: "2px" }}>{userName}</p>
            <p className="muted" style={{ fontSize: "11px", marginBottom: "10px" }}>{userEmail}</p>
            <span className="xp-level-badge" style={{ marginBottom: "8px", display: "inline-block" }}>LVL {level}</span>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${(currentLevelXp / xpToNext) * 100}%` }}></div>
            </div>
            <p className="xp-label" style={{ marginTop: "6px" }}>{currentLevelXp} / {xpToNext} XP</p>
            <button type="button" className="btn-ghost" style={{ marginTop: "12px", width: "100%" }} onClick={handleLogout}>
              log out
            </button>
          </div>
          </BorderGlow>

           {stats.length > 0 && (
            <BorderGlow className="side-card-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={20}>
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
            </BorderGlow>
          )}

          {recommendation && recommendation.target_concept && (
            <BorderGlow className="side-card-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={20}>
            <div className="side-card">
              <p className="side-card-title">AI Recommendation</p>
              <p className="side-reco">
                Focus on <strong>{recommendation.target_concept}</strong>. {recommendation.reason}
              </p>
            </div>
            </BorderGlow>
          )}

          <BorderGlow className="side-card-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={20}>
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
          </BorderGlow>
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
              <BorderGlow className="panel-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={24}>
              <div className="panel">
                <form onSubmit={handleSubmit}>
                  <div className="submit-grid">
                    <div>
                      <div className="field-row">
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
                      <p className="snapshot-reco">AI recommends: <strong>{recommendation.target_concept}</strong> — {recommendation.reason}</p>
                    )}
                  </div>
                )}
              </div>
              </BorderGlow>

              <h2 className="section-heading">Recent Submissions</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>time</th>
                    <th>problem</th>
                    <th>lang</th>
                    <th>verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 3).map((r) => (
                    <tr key={r._id}>
                      <td>{r.timestamp}</td>
                      <td>{r.problem_id}</td>
                      <td>{r.language}</td>
                      <td><VerdictBadge verdict={r.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <p className="muted" style={{ marginTop: "8px" }}>No submissions yet — solve a problem above to see it here.</p>
              )}
              {history.length > 0 && (
                <p className="muted" style={{ marginTop: "8px" }}>See full history in <strong style={{color: "var(--pink)"}}>History</strong></p>
              )}
            </>
          )}

          {tab === "addproblem" && (
            <BorderGlow className="panel-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={24}>
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
            </BorderGlow>
          )}

          {tab === "progress" && (
            <div>
              <h2 className="section-heading" style={{ marginTop: 0 }}>concept mastery — 3d view</h2>
              <p className="muted">drag to rotate, scroll to zoom</p>
              <Progress3D stats={stats} />
            </div>
          )}

          {tab === "recommend" && (
            <BorderGlow className="panel-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={24}>
            <div className="panel">
              <h2 className="section-heading" style={{ marginTop: 0 }}>AI Recommended Next Steps</h2>
              {!recommendation && <p className="muted">loading...</p>}
              {recommendation && !recommendation.target_concept && (
                <p className="muted">no weak areas detected yet — keep practicing across topics.</p>
              )}
              {recommendation && recommendation.target_concept && (
                <div>
                  <p className="reco-reason">{recommendation.reason}</p>
                  <h3 className="section-heading" style={{ fontSize: "14px" }}>
                    AI suggested problems in {recommendation.target_concept}:
                  </h3>
                  {recommendation.recommended_problems.map((p) => (
                    <div key={p.problem_id} className="reco-card">
                      <strong>{p.problem_id}</strong> — {p.title} <em>({p.difficulty})</em>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </BorderGlow>
          )}

          {tab === "achievements" && (
            <BorderGlow className="panel-glow" glowColor="14 100 59" colors={["#ff4d2e", "#ff8a3d", "#baff29"]} borderRadius={10} glowRadius={24}>
            <div className="panel">
              <h2 className="section-heading" style={{ marginTop: 0 }}>achievements</h2>
              <div className="achievement-grid">
                {achievements.map((a) => (
                  <div key={a.id} className={`achievement-card ${a.earned ? "earned" : ""}`}>
                    <p className="achievement-name">{a.earned ? "✓" : "🔒"} {a.name}</p>
                    <p className="achievement-desc">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            </BorderGlow>
          )}
          {tab === "history" && (
            <div>
              <h2 className="section-heading" style={{ marginTop: 0 }}>full submission history</h2>
              <p className="muted" style={{ marginBottom: "10px" }}>Click any row to view the code that was submitted.</p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>time</th>
                    <th>problem</th>
                    <th>lang</th>
                    <th>verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r._id} onClick={() => setViewingCode(r)} className="history-row-clickable">
                      <td>{r.timestamp}</td>
                      <td>{r.problem_id}</td>
                      <td>{r.language}</td>
                      <td><VerdictBadge verdict={r.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <p className="muted">No submissions recorded yet.</p>}

              {viewingCode && (
                <div className="ai-feedback" style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p className="ai-feedback-label">
                      {viewingCode.problem_id} — {viewingCode.language} — {viewingCode.timestamp}
                    </p>
                    <button type="button" className="btn-ghost" onClick={() => setViewingCode(null)}>close</button>
                  </div>
                  <pre className="history-code-view">{viewingCode.code}</pre>
                  {viewingCode.mistake_analysis && (
                    <div style={{ marginTop: "10px" }}>
                      <p className="ai-feedback-label">ai feedback (at time of submission)</p>
                      <p className="ai-feedback-text">{viewingCode.mistake_analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;