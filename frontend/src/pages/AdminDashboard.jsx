import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchProblems, createProblem, updateProblem, deleteProblem } from '../services/api';
import './AdminDashboard.css';

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
            // Ideally we fetch testcases for this problem, but right now the API doesn't return testcases in getProblems.
            // For MVP admin, we might just allow updating the problem details, or overwriting testcases.
            setTestCases([]); 
        } else {
            setEditingProblemId(null);
            setTitle('');
            setDescription('');
            setDifficulty('Easy');
            setTags('');
            setTestCases([{ input: '', expectedOutput: '', isHidden: true }]);
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
                // If testCases is empty array during edit, we might delete all testcases, so only pass if we actively added some.
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

    if (loading) return <div style={{color:'white', padding:'20px'}}>Loading Admin...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <button onClick={() => navigate('/')}>Back to App</button>
            </header>

            <div className="admin-content">
                <div className="admin-topbar">
                    <h2>Manage Problems</h2>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>+ Create New Problem</button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map(prob => (
                            <tr key={prob._id}>
                                <td>{prob._id.slice(-6)}</td>
                                <td>{prob.title}</td>
                                <td>
                                    <span className={`badge ${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                                </td>
                                <td>
                                    <button className="btn-secondary" onClick={() => handleOpenModal(prob)}>Edit</button>
                                    <button className="btn-danger" onClick={() => handleDelete(prob._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content admin-modal">
                        <h2>{editingProblemId ? 'Edit Problem' : 'Create Problem'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            
                            <div className="form-group">
                                <label>Difficulty</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tags (comma separated)</label>
                                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Array, Dynamic Programming" />
                            </div>

                            <div className="form-group">
                                <label>Description (Markdown supported)</label>
                                <textarea required rows="6" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>

                            <div className="testcases-section">
                                <h3>Test Cases {editingProblemId && <span style={{fontSize:'12px',color:'#aaa'}}>(Editing overwrites all existing testcases for this problem)</span>}</h3>
                                {testCases.map((tc, idx) => (
                                    <div key={idx} className="testcase-card">
                                        <div className="tc-header">
                                            <span>Test Case {idx + 1}</span>
                                            <button type="button" onClick={() => handleRemoveTestCase(idx)}>Remove</button>
                                        </div>
                                        <div className="tc-inputs">
                                            <div>
                                                <label>Input (STDIN)</label>
                                                <textarea required rows="3" value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} placeholder="e.g. 2 7 11 15\n9"></textarea>
                                            </div>
                                            <div>
                                                <label>Expected Output (STDOUT)</label>
                                                <textarea required rows="3" value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)} placeholder="e.g. 0 1"></textarea>
                                            </div>
                                        </div>
                                        <div style={{marginTop:'10px'}}>
                                            <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} />
                                                Hidden Test Case (Used for final evaluation)
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn-secondary mt-10" onClick={handleAddTestCase}>+ Add Test Case</button>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">{editingProblemId ? 'Save Changes' : 'Create Problem'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
