const API_BASE_URL = 'http://localhost:5000/api';

//LOGIN

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to login');
    return data;
};


//REGISTER

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to register');
    return data;
};

//FETCH ALL PROBLEMS

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

//FETCH ONE PROBLEM

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
};