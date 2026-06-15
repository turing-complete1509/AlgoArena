const API_BASE_URL = 'http://localhost:5000/api';

export const fetchProblems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/problems`);

        if(!response.ok){
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }catch(err){
        console.error('Error fetching problems:', err);
        throw err;
    }
};