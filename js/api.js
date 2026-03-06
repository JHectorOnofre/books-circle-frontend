
const API_BASE = 'http://localhost:5054';

const Api = (() => {

  function getToken() {
    return localStorage.getItem('token');
  }

  function setToken(token) {
    localStorage.setItem('token', token);
  }

  function clearToken() {
    localStorage.removeItem('token');
  }

  function isAuthenticated() {
    return !!getToken();
  }

  async function request(method, path, body = null, isForm = false) {
    const token = getToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isForm && body) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = isForm
        ? new URLSearchParams(body)
        : JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${path}`, config);

    if (res.status === 401) {
      clearToken();
      Router.navigate('login');
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        detail = err.detail || err.message || detail;
      } catch (_) {}
      throw new Error(detail);
    }

    if (res.status === 204) return null;

    return res.json();
  }

  async function login(username, password) {
    const data = await request('POST', '/token', { username, password }, true);
    setToken(data.access_token || data.accessToken);
    return data;
  }

  async function register(payload) {
    const data = await request('POST', '/auth/register', payload);
    setToken(data.access_token || data.accessToken);
    return data;
  }

  function logout() {
    clearToken();
    Router.navigate('login');
  }

  function getClubs()          { return request('GET',  '/clubs'); }
  function getClub(id)         { return request('GET',  `/clubs/${id}`); }
  function createClub(payload) { return request('POST', '/clubs', payload); }
  function joinClub(clubId)  { return request('POST',   `/clubs/${clubId}/members`); }
  function leaveClub(clubId) { return request('DELETE', `/clubs/${clubId}/members`); }
  function getMembers(clubId){ return request('GET',    `/clubs/${clubId}/members`); }

  function getBooks(clubId)           { return request('GET',  `/clubs/${clubId}/books`); }
  function proposeBook(clubId, payload){ return request('POST', `/clubs/${clubId}/books`, payload); }
  function voteBook(clubId, bookId)    { return request('POST', `/clubs/${clubId}/books/${bookId}/votes`); }
  function updateProgress(clubId, bookId, pct) {
    return request('PATCH', `/clubs/${clubId}/books/${bookId}/progress`, { percentage: pct });
  }

  function getMeetings(clubId)         { return request('GET',  `/clubs/${clubId}/meetings`); }
  function scheduleMeeting(clubId, pl) { return request('POST', `/clubs/${clubId}/meetings`, pl); }

  return {
    getToken, setToken, clearToken, isAuthenticated,
    login, register, logout,
    getClubs, getClub, createClub,
    joinClub, leaveClub, getMembers,
    getBooks, proposeBook, voteBook, updateProgress,
    getMeetings, scheduleMeeting,
  };
})();
