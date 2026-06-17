import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import { fetchProblemById, submitCode, getSubmission, fetchMySubmissions, submitCustomCode, getCustomSubmission } from '../services/api';

const LANGUAGE_TEMPLATES = {
    javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n// Process input and print output\n",
    python: "import sys\ninput_data = sys.stdin.read().split()\n# Process input and print output\n",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Process input and print output\n    return 0;\n}"
};

const Workspace = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES['javascript']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomRunning, setIsCustomRunning] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [customInput, setCustomInput] = useState('');
    const [customOutput, setCustomOutput] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase' or 'result'
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadProblem = async () => {
            try {
                const data = await fetchProblemById(id);
                setProblem(data);
                if (data.sampleTestCase) {
                    setCustomInput(data.sampleTestCase);
                }
            } catch (error) {
                console.error("Failed to load problem");
            } finally {
                setLoading(false);
            }
        };
        loadProblem();
    }, [id]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(LANGUAGE_TEMPLATES[newLang]);
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

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-background text-primary font-bold text-xl">Loading Workspace...</div>;
    if (!problem) return <div className="flex items-center justify-center min-h-screen bg-background text-danger font-bold text-xl">Problem not found!</div>;

    const handleRunCode = async () => {
        if (!code.trim()) return;
        setIsCustomRunning(true);
        setConsoleTab('result');
        setCustomOutput({ status: 'Pending', output: 'Sending to queue...' });

        try {
            const { submissionId } = await submitCustomCode(id, code, language, customInput);
            
            const pollInterval = setInterval(async () => {
                const sub = await getCustomSubmission(submissionId);
                
                // If it is no longer pending/processing
                if (sub.status !== 'Pending' && sub.status !== 'Processing') {
                    clearInterval(pollInterval);
                    setIsCustomRunning(false);
                    // Use empty string if output is explicitly returned but empty
                    setCustomOutput({ 
                        status: sub.status, 
                        output: sub.output !== undefined && sub.output !== null ? sub.output : '(No output)'
                    });
                } else {
                    setCustomOutput({ status: sub.status, output: sub.output || 'Processing...' });
                }
            }, 1000);

        } catch (error) {
            setCustomOutput({ status: 'Error', output: error.message });
            setIsCustomRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) return;
        setIsSubmitting(true);
        setConsoleTab('result');
        setCustomOutput({ status: 'Pending', output: 'Sending to queue...' });

        try {
            const { submissionId } = await submitCode(id, language, code);
            
            const pollInterval = setInterval(async () => {
                const sub = await getSubmission(submissionId);
                
                if (sub.status !== 'Pending' && sub.status !== 'Processing') {
                    clearInterval(pollInterval);
                    setIsSubmitting(false);
                    // We load history immediately if tab is open
                    if (activeTab === 'submissions') loadHistory();
                    
                    setCustomOutput({ 
                        status: sub.status, 
                        output: sub.status === 'Accepted' ? 'All test cases passed!' : 'Submission Failed or Wrong Answer'
                    });
                } else {
                    setCustomOutput({ status: sub.status, output: 'Processing submission...' });
                }
            }, 1500);

        } catch (error) {
            setCustomOutput({ status: 'Error', output: error.message });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background text-textMain overflow-hidden font-sans">
            {/* Navbar specifically for the workspace */}
            <nav className="flex justify-between items-center px-4 py-2 bg-surface border-b border-border shadow-sm">
                <Link to="/" className="text-textMuted hover:text-primary transition-colors text-sm font-medium flex items-center gap-2">
                    <span>⬅</span> Back to Dashboard
                </Link>
                <div className="flex gap-3">
                    <button 
                        className="bg-surfaceHover hover:bg-border text-textMain border border-border px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50" 
                        onClick={handleRunCode} 
                        disabled={isCustomRunning || isSubmitting}
                    >
                        {isCustomRunning ? 'Running...' : 'Run Code'}
                    </button>
                    <button 
                        className="bg-success hover:bg-green-600 text-white px-5 py-1.5 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || isCustomRunning}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </nav>

            <Split
                className="flex flex-1 overflow-hidden"
                sizes={[45, 55]}
                minSize={300}
                gutterSize={6}
                snapOffset={30}
            >
                {/* LEFT PANE */}
                <div className="flex flex-col bg-surface overflow-hidden">
                    <div className="flex border-b border-border bg-surfaceHover px-2 pt-2 gap-1">
                        <button 
                            className={`px-4 py-2 rounded-t-md font-medium text-sm transition-colors ${activeTab === 'description' ? 'bg-surface text-primary border-t border-x border-border' : 'text-textMuted hover:text-textMain'}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-t-md font-medium text-sm transition-colors ${activeTab === 'submissions' ? 'bg-surface text-primary border-t border-x border-border' : 'text-textMuted hover:text-textMain'}`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            Submissions
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-surface">
                        {activeTab === 'description' && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h1 className="text-3xl font-bold text-textMain tracking-tight">{problem.title}</h1>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                            ${problem.difficulty === 'Easy' ? 'bg-success/10 text-success' : 
                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                                            'bg-danger/10 text-danger'}
                                        `}>
                                            {problem.difficulty}
                                        </span>
                                        {(problem.tags || []).map(tag => (
                                            <span key={tag} className="bg-surfaceHover border border-border px-2 py-1 rounded text-xs text-textMuted">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="prose prose-invert max-w-none text-textMain/90 leading-relaxed">
                                    {problem.description.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 min-h-[1em]">{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-textMain">My Submissions</h3>
                                {history.length === 0 ? (
                                    <p className="text-textMuted italic">No submissions yet. Solve the problem to see your history!</p>
                                ) : (
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-surfaceHover text-textMuted text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Time</th>
                                                    <th className="px-4 py-3 font-semibold">Status</th>
                                                    <th className="px-4 py-3 font-semibold">Language</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {history.map(sub => (
                                                    <tr key={sub._id} className="hover:bg-surfaceHover/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-textMuted">{new Date(sub.submittedAt).toLocaleString()}</td>
                                                        <td className="px-4 py-3 font-medium">
                                                            <span className={sub.status === 'Accepted' ? 'text-success' : 'text-danger'}>
                                                                {sub.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{sub.language}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                {/* RIGHT PANE: Code Editor & Console */}
                <div className="flex flex-col bg-background overflow-hidden border-l border-border">
                    <div className="flex justify-between items-center px-4 py-2 bg-surfaceHover border-b border-border">
                        <span className="text-sm font-medium text-textMuted flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success"></span> Code Editor
                        </span>
                        <select 
                            value={language} 
                            onChange={handleLanguageChange}
                            className="bg-surface border border-border text-textMain text-sm rounded px-2 py-1 outline-none focus:border-primary transition-colors cursor-pointer"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 15,
                                fontLigatures: true,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                            }}
                        />
                    </div>
                    
                    {/* Console Output Box */}
                    <div className="h-64 flex flex-col border-t border-border bg-surface">
                        <div className="flex gap-2 bg-surfaceHover px-2 pt-2 border-b border-border">
                            <button 
                                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${consoleTab === 'testcase' ? 'bg-surface text-primary border-t border-x border-border' : 'text-textMuted hover:text-textMain'}`}
                                onClick={() => setConsoleTab('testcase')}
                            >
                                Testcase
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${consoleTab === 'result' ? 'bg-surface text-primary border-t border-x border-border' : 'text-textMuted hover:text-textMain'}`}
                                onClick={() => setConsoleTab('result')}
                            >
                                Test Result
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-background font-mono text-sm">
                            {consoleTab === 'testcase' && (
                                <div className="h-full">
                                    <textarea 
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Enter custom standard input here..."
                                        className="w-full h-full bg-surface text-textMain border border-border rounded p-3 resize-none outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            )}

                            {consoleTab === 'result' && customOutput && (
                                <div>
                                    <h4 className={`text-base font-bold mb-3 ${customOutput.status === 'Completed' || customOutput.status === 'Accepted' ? 'text-success' : 'text-danger'}`}>
                                        {customOutput.status}
                                    </h4>
                                    <div className="bg-surface border border-border rounded p-3">
                                        <div className="text-textMuted text-xs mb-1 uppercase tracking-wider">Output</div>
                                        <pre className="whitespace-pre-wrap m-0 text-textMain">
                                            {customOutput.output}
                                        </pre>
                                    </div>
                                </div>
                            )}
                            
                            {consoleTab === 'result' && !customOutput && (
                                <div className="flex h-full items-center justify-center text-textMuted italic">
                                    Run your code to see results here.
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
