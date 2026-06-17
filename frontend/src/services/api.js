const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

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

//HELPER FUNCTION TO GET TOKEN

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        };
    }
    return { 'Content-Type': 'application/json' };
};

//SUBMIT CODE

export const submitCode = async (problemId, language, code) => {
    // In a real app with Auth Context, we would attach the Bearer token here
    const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ problemId, language, code })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Submission failed');
    return data;
};

export const submitCustomCode = async (problemId, code, language, customInput) => {
    const response = await fetch(`${API_BASE_URL}/submissions/custom`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ problemId, code, language, customInput })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Custom submission failed');
    return data;
};

export const getCustomSubmission = async (submissionId) => {
    const response = await fetch(`${API_BASE_URL}/submissions/custom/${submissionId}`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch custom submission');
    return data;
};

//GET SUBMISSION STATUS

export const getSubmission = async (submissionId) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch submission');
    return data;
};

//GET USER SUBMISSIONS

export const fetchMySubmissions = async (problemId) => {
    const url = problemId 
            ? `${API_BASE_URL}/submissions/history?problemId=${problemId}`
            : `${API_BASE_URL}/submissions/history`;
    
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if(!response.ok){
        throw new Error(data.message || 'Failed to fetch history');
    }
    return data;
}

// --- ADMIN ENDPOINTS ---

export const createProblem = async (problemData) => {
    const response = await fetch(`${API_BASE_URL}/problems`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(problemData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create problem');
    return data;
};

export const updateProblem = async (id, problemData) => {
    const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(problemData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update problem');
    return data;
};

export const deleteProblem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete problem');
    return data;
};