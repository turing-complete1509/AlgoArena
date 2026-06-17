import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchProblems, createProblem, updateProblem, deleteProblem } from '../services/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProblemId, setEditingProblemId] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Easy');
    const [tags, setTags] = useState('');
    const [testCases, setTestCases] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadProblems();
    }, [user, navigate]);

    const loadProblems = async () => {
        try {
            const data = await fetchProblems();
            setProblems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (problem = null) => {
        if (problem) {
            setEditingProblemId(problem._id);
            setTitle(problem.title);
            setDescription(problem.description);
            setDifficulty(problem.difficulty);
            setTags(problem.tags ? problem.tags.join(', ') : '');
            setTestCases([]); 
        } else {
            setEditingProblemId(null);
            setTitle('');
            setDescription('');
            setDifficulty('Easy');
            setTags('');
            setTestCases([{ input: '', expectedOutput: '', isHidden: false }]); // Provide first test case as visible by default
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: true }]);
    };

    const handleRemoveTestCase = (index) => {
        const newTC = [...testCases];
        newTC.splice(index, 1);
        setTestCases(newTC);
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTC = [...testCases];
        newTC[index][field] = value;
        setTestCases(newTC);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
        const payload = { title, description, difficulty, tags: tagsArray, testCases };
        try {
            if (editingProblemId) {
                await updateProblem(editingProblemId, payload);
            } else {
                await createProblem(payload);
            }
            setIsModalOpen(false);
            loadProblems();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this problem?")) {
            try {
                await deleteProblem(id);
                loadProblems();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-background text-primary font-bold text-xl">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-background text-textMain pb-20">
            <header className="flex justify-between items-center px-8 py-4 border-b border-border bg-surface sticky top-0 z-10 backdrop-blur bg-opacity-80">
                <h1 className="font-bold text-2xl text-primary tracking-tight">Admin Dashboard</h1>
                <button onClick={() => navigate('/')} className="bg-surfaceHover hover:bg-border text-textMain border border-border px-4 py-2 rounded font-medium transition-colors cursor-pointer">
                    Back to App
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-textMain">Manage Problems</h2>
                    <button 
                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors cursor-pointer shadow-lg shadow-primary/20"
                        onClick={() => handleOpenModal()}
                    >
                        + Create New Problem
                    </button>
                </div>

                <div className="bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surfaceHover text-textMuted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-24">ID</th>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold w-32">Difficulty</th>
                                <th className="px-6 py-4 font-semibold w-48 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {problems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-textMuted">No problems found. Create one above.</td>
                                </tr>
                            ) : (
                                problems.map(prob => (
                                    <tr key={prob._id} className="hover:bg-surfaceHover transition-colors">
                                        <td className="px-6 py-4 text-textMuted font-mono text-sm">{prob._id.slice(-6)}</td>
                                        <td className="px-6 py-4 font-medium text-textMain">{prob.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${prob.difficulty === 'Easy' ? 'bg-success/10 text-success' : 
                                                prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                                                'bg-danger/10 text-danger'}
                                            `}>
                                                {prob.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button 
                                                onClick={() => handleOpenModal(prob)}
                                                className="text-primary hover:text-blue-400 font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(prob._id)}
                                                className="text-danger hover:text-red-400 font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-border bg-surfaceHover flex justify-between items-center">
                            <h2 className="text-xl font-bold text-textMain">{editingProblemId ? 'Edit Problem' : 'Create Problem'}</h2>
                            <button onClick={handleCloseModal} className="text-textMuted hover:text-textMain text-2xl leading-none">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="problem-form" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        className="w-full bg-background border border-border text-textMain rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-textMuted mb-1">Difficulty</label>
                                        <select 
                                            value={difficulty} 
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="w-full bg-background border border-border text-textMain rounded px-3 py-2 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-textMuted mb-1">Tags (comma separated)</label>
                                        <input 
                                            type="text" 
                                            value={tags} 
                                            onChange={(e) => setTags(e.target.value)} 
                                            placeholder="e.g. Array, DP" 
                                            className="w-full bg-background border border-border text-textMain rounded px-3 py-2 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-textMuted mb-1">Description (Markdown)</label>
                                    <textarea 
                                        required 
                                        rows="6" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-background border border-border text-textMain rounded px-3 py-2 focus:border-primary outline-none transition-all font-mono text-sm resize-y"
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-lg font-semibold text-textMain mb-1">Test Cases</h3>
                                    {editingProblemId && (
                                        <p className="text-xs text-danger mb-4 font-medium">Warning: Editing overwrites ALL existing test cases for this problem.</p>
                                    )}
                                    
                                    <div className="space-y-4">
                                        {testCases.map((tc, idx) => (
                                            <div key={idx} className="bg-surfaceHover border border-border rounded-lg p-4 relative group">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveTestCase(idx)}
                                                    className="absolute top-2 right-2 text-textMuted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Test Case"
                                                >
                                                    ✖
                                                </button>
                                                <div className="text-sm font-medium text-primary mb-3">Test Case {idx + 1}</div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-textMuted mb-1">Input (STDIN)</label>
                                                        <textarea 
                                                            required 
                                                            rows="3" 
                                                            value={tc.input} 
                                                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} 
                                                            className="w-full bg-background border border-border text-textMain rounded px-3 py-2 focus:border-primary outline-none font-mono text-xs resize-none"
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-textMuted mb-1">Expected Output (STDOUT)</label>
                                                        <textarea 
                                                            required 
                                                            rows="3" 
                                                            value={tc.expectedOutput} 
                                                            onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)} 
                                                            className="w-full bg-background border border-border text-textMain rounded px-3 py-2 focus:border-primary outline-none font-mono text-xs resize-none"
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`hidden-${idx}`}
                                                        checked={tc.isHidden} 
                                                        onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} 
                                                        className="rounded bg-background border-border text-primary focus:ring-primary accent-primary"
                                                    />
                                                    <label htmlFor={`hidden-${idx}`} className="text-sm text-textMuted cursor-pointer select-none">
                                                        Hidden Test Case (Used for evaluation, invisible to user)
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddTestCase}
                                        className="mt-4 w-full border-2 border-dashed border-border hover:border-primary text-textMuted hover:text-primary rounded-lg py-3 font-medium transition-colors"
                                    >
                                        + Add Test Case
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-border bg-surfaceHover flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={handleCloseModal}
                                className="bg-transparent hover:bg-surface border border-border text-textMain px-4 py-2 rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="problem-form"
                                className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded font-medium transition-colors shadow-lg shadow-primary/20"
                            >
                                {editingProblemId ? 'Save Changes' : 'Create Problem'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
