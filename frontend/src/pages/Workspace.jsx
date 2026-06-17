import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import './Workspace.css';
import { fetchProblemById, submitCode, getSubmission, fetchMySubmissions } from '../services/api';


const Workspace = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your code here...\nfunction twoSum(nums, target) {\n\n}');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null)
    const [activeTab, setActiveTab] = useState('description');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadProblem = async () => {
            try {
                const data = await fetchProblemById(id);
                setProblem(data);
            } catch (error) {
                console.error("Failed to load problem");
                throw error;
            } finally {
                setLoading(false);
            }
        };
        loadProblem();
    }, [id]);


    if (loading) return <div className="loader">Loading Workspace...</div>;
    if (!problem) return <div className="error">Problem not found!</div>;

    const handleRunCode = () => {
        alert("Code execution coming soon!");
    };

    const handleSubmit = async () => {
        if (!code.trim()) return;
        setIsSubmitting(true);
        setSubmissionResult({ status: 'Pending', message: 'Sending to queue...' });

        try {
            // 1. Submit code to the queue
            const { submissionId } = await submitCode(id, 'javascript', code);
            
            // 2. Poll the database every 1.5 seconds until done
            const pollInterval = setInterval(async () => {
                const sub = await getSubmission(submissionId);
                setSubmissionResult({ status: sub.status });
                
                // If the status is no longer Pending or Processing, stop polling!
                if (sub.status !== 'Pending' && sub.status !== 'Processing') {
                    clearInterval(pollInterval);
                    setIsSubmitting(false);
                }
            }, 1500);

        } catch (error) {
            setSubmissionResult({ status: 'Error', message: error.message });
            setIsSubmitting(false);
        }
    };

    const loadHistory = async () => {
        try {   
            const data = await fetchMySubmissions(id);
            setHistory(data);
        } catch(err){
            console.error(err);
        }
    };

    useEffect(() => {
        if(activeTab==='submissions'){
            loadHistory();
        }
    }, [activeTab]);

    


    return (
        <div className="workspace-container">
            {/* Navbar specifically for the workspace */}
            <nav className="workspace-nav">
                <Link to="/" className="back-link">⬅ Back to Dashboard</Link>
                <div className="nav-actions">
                    <button className="run-btn" onClick={handleRunCode}>Run Code</button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}> {isSubmitting ? 'Running...' : 'Submit'} </button>
                </div>
            </nav>

            <Split
                className="split-layout"
                sizes={[40, 60]} /* 40% Left, 60% Right default */
                minSize={300}
                gutterSize={8}
                snapOffset={30}
            >
                {/* LEFT PANE */}
                <div className="pane description-pane">
                    <div className="pane-header tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            Submissions
                        </button>
                    </div>
                    
                    <div className="pane-content">
                        {activeTab === 'description' && (
                            <>
                                <h1>{problem.title}</h1>
                                <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                                    {problem.difficulty}
                                </span>
                                <div className="description-text">
                                    {problem.description.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="submissions-history">
                                <h3>My Submissions</h3>
                                {history.length === 0 ? (
                                    <p>No submissions yet.</p>
                                ) : (
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Status</th>
                                                <th>Language</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(sub => (
                                                <tr key={sub._id}>
                                                    <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                                                    <td className={`status-${sub.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                                        {sub.status}
                                                    </td>
                                                    <td>{sub.language}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                {/* RIGHT PANE: Code Editor & Console */}
                <div className="pane editor-pane">
                    <div className="pane-header">Code Editor (JavaScript)</div>
                    <div className="editor-wrapper">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                            }}
                        />
                    </div>
                    {/* Console Output Box (Mocked for now) */}
                    <div className="console-wrapper">
                        <div className="console-header">Console</div>
                        <div className="console-output">
                            Ready to run tests...
                            {submissionResult && (
                                <div className={`submission-result ${submissionResult.status.toLowerCase().replace(' ', '-')}`}>
                                    <h3>Verdict: {submissionResult.status}</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Split>
        </div>
    );
};

export default Workspace;
