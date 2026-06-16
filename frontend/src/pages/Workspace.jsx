import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import './Workspace.css';
import { fetchProblemById, submitCode, getSubmission } from '../services/api';


const Workspace = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your code here...\nfunction twoSum(nums, target) {\n\n}');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null)

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
                {/* LEFT PANE: Description */}
                <div className="pane description-pane">
                    <div className="pane-header">Description</div>
                    <div className="pane-content">
                        <h1>{problem.title}</h1>
                        <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                            {problem.difficulty}
                        </span>
                        
                        <div className="description-text">
                            {problem.description.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
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
