import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchProblems, fetchMySubmissions } from '../services/api.js';
import { AuthContext } from '../context/AuthContext.jsx';

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [solvedSet, setSolvedSet] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        const loadData = async () => {
            try {
                const problemsData = await fetchProblems();
                setProblems(problemsData);
                
                if (user) {
                    const submissions = await fetchMySubmissions();
                    const solved = new Set();
                    submissions.forEach(sub => {
                        if (sub.status === 'Accepted') {
                            solved.add(sub.problemId);
                        }
                    });
                    setSolvedSet(solved);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-primary text-xl font-bold">
                Loading Arena...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-textMain flex flex-col">
            {/* Top Navigation */}
            <nav className="flex justify-between items-center px-8 py-4 border-b border-border bg-surface sticky top-0 z-10 backdrop-blur bg-opacity-80">
                <div className="font-bold text-2xl text-primary tracking-tight">AlgoArena</div>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <span className="text-textMuted hidden sm:inline">Welcome, <span className="text-textMain font-medium">{user.username}</span></span>
                            {user.role === 'admin' && (
                                <button onClick={() => navigate('/admin')} className="bg-success hover:bg-green-600 text-white border-none px-4 py-2 rounded font-medium transition-colors cursor-pointer">
                                    Admin Panel
                                </button>
                            )}
                            <button onClick={handleLogout} className="bg-surfaceHover hover:bg-border text-textMain border border-border px-4 py-2 rounded font-medium transition-colors cursor-pointer">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-textMain hover:text-primary transition-colors font-medium">Login</Link>
                            <Link to="/register" className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors">Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Header Hero Section */}
            <header className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-surface to-background">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 mb-4">
                    Master Algorithms. Build the Future.
                </h1>
                <p className="text-textMuted text-lg max-w-2xl">
                    Select a problem below to start practicing in our real-time, sandboxed execution environment.
                </p>
            </header>

            {/* Problems Table */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-20">
                <div className="bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surfaceHover text-textMuted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-16">Status</th>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold w-32">Difficulty</th>
                                <th className="px-6 py-4 font-semibold hidden md:table-cell">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {problems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-textMuted">No problems available.</td>
                                </tr>
                            ) : (
                                problems.map((prob) => {
                                    const isSolved = solvedSet.has(prob._id);
                                    return (
                                        <tr 
                                            key={prob._id} 
                                            onClick={() => navigate(`/problem/${prob._id}`)}
                                            className="hover:bg-surfaceHover transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 text-center">
                                                {isSolved ? (
                                                    <span className="text-success text-xl" title="Solved">✅</span>
                                                ) : (
                                                    <span className="text-border group-hover:text-textMuted transition-colors" title="Unsolved">➖</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-primary group-hover:text-blue-400 transition-colors">
                                                {prob.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                    ${prob.difficulty === 'Easy' ? 'bg-success/10 text-success' : 
                                                    prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                                                    'bg-danger/10 text-danger'}
                                                `}>
                                                    {prob.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="flex flex-wrap gap-2">
                                                    {(prob.tags || []).map(tag => (
                                                        <span key={tag} className="bg-surface border border-border px-2 py-0.5 rounded text-xs text-textMuted">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;