const API_BASE_URL = 'http://localhost:5000/api';

export const fetchProblems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/problems`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (err) {
        console.error('Error fetching problems:', err);
        throw err;
    }
};

export const fetchProblemById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/problems/${id}`);
        if(!response.ok){
            throw new Error('Network reponse was not ok');
        }
        return await response.json();
    }catch(error){
        console.error('Error fetching problem details:', error);
        throw error;
    }
}