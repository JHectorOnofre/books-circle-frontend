// js/api.js

const API_BASE_URL = 'http://localhost:5054';


/* objeto de Js en el que se puede acceder a varias funciones, en este caso Headers y fetchs
  - en los Headers se puede establaecer si hay o no un Token, obteniéndolo del local storage. Si existe: se agrega a los Headers (+ token) 
   
*/
window.api = { //
    // Helper to get headers
    getHeaders(isJson = true) {
        const headers = {};
        if (isJson) {
            headers['Content-Type'] = 'application/json';
        }
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        return headers;
    },

    // Generic fetch wrapper for handling common responses (like 401 unauth)
    async fetchWithHandling(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options); // await fetch = versión nativa

        if (response.status === 401) {
            // Token might be expired or invalid
            localStorage.removeItem('token');
            if (window.hasher) hasher.setHash('login'); // función setHash para establecer la ruta por la cual se obtiene el componente según el response 
            throw new Error('Unauthorized');
        }

        if (!response.ok) { // si responsee no es correcto => manejo de errores:
            let errorDetail = 'API Error';
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                // If it's not JSON, ignore
            }
            throw new Error(errorDetail);
        }

        // Return empty string or json depending on response
        if (response.status === 204) return null;

        const contentType = response.headers.get("content-type"); 
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return response.text();
        }
    },

    // --- AUTH ---

    async login(username, password) {
        // The /token endpoint expects x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        return this.fetchWithHandling('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
    },

    async register(userData) {
        return this.fetchWithHandling('/auth/register', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });
    },

    // --- CLUBS ---

    async getClubs(skip = 0, limit = 100) { //paginación skip, limit
        return this.fetchWithHandling(`/clubs?skip=${skip}&limit=${limit}`, { //fetchWithHandling = método nativo equiparable a la función Ajax de Jquery
            headers: this.getHeaders() 
        });
    },

    async createClub(clubData) {
        return this.fetchWithHandling('/clubs', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(clubData)
        });
    },

    async getClub(clubId) {
        return this.fetchWithHandling(`/clubs/${clubId}`, {
            headers: this.getHeaders()
        });
    },

    // --- BOOKS ---

    async getBooks(clubId, skip = 0, limit = 100) {
        return this.fetchWithHandling(`/clubs/${clubId}/books?skip=${skip}&limit=${limit}`, {
            headers: this.getHeaders()
        });
    },

    async proposeBook(clubId, bookData) {
        return this.fetchWithHandling(`/clubs/${clubId}/books`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(bookData)
        });
    },

    async voteForBook(clubId, bookId) {
        // Based on typical REST this might be a POST, but spec shows GET?
        // Let's assume there is a POST in a fuller implementation or we just track locally if mock
        // If the endpoint doesn't exist to accept votes, we'll leave it out for the SPA mock
        // Assuming /votes handles it based on spec (which only shows a GET and DELETE for votes currently)
    },

    async updateBookProgress(clubId, bookId, progressValue) {
        // Endpoint: PUT /clubs/{clubId}/books/{bookId}/progress?progress={val}
        return this.fetchWithHandling(`/clubs/${clubId}/books/${bookId}/progress?progress=${progressValue}`, {
            method: 'PUT',
            headers: this.getHeaders(false)
        });
    }

    // --- MEETINGS & REVIEWS (Placeholders for future implementation) ---
};
