import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import { fetchProblemById } from '../services/api';
import './Workspace.css';

const Workspace = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your solution here...\n');

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

    return (
        <div className="workspace-container">
            {/* Navbar specifically for the workspace */}
            <nav className="workspace-nav">
                <Link to="/" className="back-link">⬅ Back to Dashboard</Link>
                <div className="nav-actions">
                    <button className="run-btn" onClick={handleRunCode}>Run Code</button>
                    <button className="submit-btn" onClick={handleRunCode}>Submit</button>
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
                        </div>
                    </div>
                </div>
            </Split>
        </div>
    );
};

export default Workspace;
