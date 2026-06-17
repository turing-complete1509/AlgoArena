import { useState, useEffect, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import { fetchProblems } from '../services/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import './Dashboard.css';

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        const loadProblems = async () => {
            try {
                const data = await fetchProblems();
                setProblems(data);
            } catch {
                console.error("Failed to load problems");
            } finally {
                setLoading(false);
            }
        }
        loadProblems();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loader">
                Loading Arena...
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #30363d'}}>
                <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#58a6ff'}}>AlgoArena</div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    {user && <span style={{color: '#c9d1d9'}}>Welcome, {user.username}</span>}
                    {user?.role === 'admin' && (
                        <button onClick={() => navigate('/admin')} style={{background: '#238636', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer'}}>
                            Admin Panel
                        </button>
                    )}
                    <button onClick={handleLogout} style={{background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer'}}>
                        Logout
                    </button>
                </div>
            </nav>

            <header className="dashboard-header">
                <h1> Select a problem to start practicing! </h1>
            </header>

            <div className='table-wrapper'>
                <table className='problems-table'>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Tags</th>
                        </tr>
                    </thead>

                    <tbody>
                        {problems.map((prob) => (
                            <tr key={prob._id} className='problem-row' onClick={() => navigate(`/problem/${prob._id}`)}>
                                <td className='status-cell'> ➖ </td>

                                <td className='title-cell'>{prob.title}</td>

                                <td>
                                    <span className={`difficulty-badge ${prob.difficulty.toLowerCase()}`}>
                                        {prob.difficulty}
                                    </span>
                                </td>
                                <td className="tags-cell">
                                    {prob.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

        </div>
    )
}

export default Dashboard;