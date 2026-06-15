import {useState, useEffect} from 'react';
import {fetchProblems} from '../services/api.js';
import './Dashboard.css';

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if(loading){
        return (
            <div className="loader">
                Loading Arena...
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1> AlgoArena </h1>
                <p>Select a problem to start practicing!</p>
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
                            <tr key={prob._id} className='problem-row'>
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