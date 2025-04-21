import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// User services
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

// Team services
export const getAllTeams = async () => {
  const response = await api.get('/teams');
  return response.data;
};

export const getTeamById = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await api.post('/teams', teamData);
  return response.data;
};

export const updateTeam = async (id, teamData) => {
  const response = await api.put(`/teams/${id}`, teamData);
  return response.data;
};

export const getTeamPlayers = async (id) => {
  const response = await api.get(`/teams/${id}/players`);
  return response.data;
};

export const addPlayerToTeam = async (teamId, playerId) => {
  const response = await api.post(`/teams/${teamId}/players`, { player_id: playerId });
  return response.data;
};

export const removePlayerFromTeam = async (teamId, playerId) => {
  const response = await api.delete(`/teams/${teamId}/players/${playerId}`);
  return response.data;
};

// Player services
export const getAllPlayers = async () => {
  const response = await api.get('/players');
  return response.data;
};

export const getPlayerById = async (id) => {
  const response = await api.get(`/players/${id}`);
  return response.data;
};

export const createPlayer = async (playerData) => {
  const response = await api.post('/players', playerData);
  return response.data;
};

export const updatePlayer = async (id, playerData) => {
  const response = await api.put(`/players/${id}`, playerData);
  return response.data;
};

export const getPlayerProfile = async () => {
  const response = await api.get('/players/profile/me');
  return response.data;
};

// Stadium services
export const getAllStadiums = async () => {
  const response = await api.get('/stadiums');
  return response.data;
};

export const getStadiumById = async (id) => {
  const response = await api.get(`/stadiums/${id}`);
  return response.data;
};

export const createStadium = async (stadiumData) => {
  const response = await api.post('/stadiums', stadiumData);
  return response.data;
};

export const updateStadium = async (id, stadiumData) => {
  const response = await api.put(`/stadiums/${id}`, stadiumData);
  return response.data;
};

export const getManagedStadiums = async () => {
  const response = await api.get('/stadiums/managed/me');
  return response.data;
};

// Match services
export const getAllMatches = async () => {
  const response = await api.get('/matches');
  return response.data;
};

export const getUpcomingMatches = async () => {
  const response = await api.get('/matches/upcoming');
  return response.data;
};

export const getPastMatches = async () => {
  const response = await api.get('/matches/past');
  return response.data;
};

export const getMatchById = async (id) => {
  const response = await api.get(`/matches/${id}`);
  return response.data;
};

export const createMatch = async (matchData) => {
  const response = await api.post('/matches', matchData);
  return response.data;
};

export const updateMatchScore = async (id, scoreData) => {
  const response = await api.put(`/matches/${id}/score`, scoreData);
  return response.data;
};

export const getRefereeMatches = async () => {
  const response = await api.get('/matches/referee/me');
  return response.data;
};

export const getRefereeUpcomingMatches = async () => {
  const response = await api.get('/matches/referee/me/upcoming');
  return response.data;
};

export const getRefereePastMatches = async () => {
  const response = await api.get('/matches/referee/me/past');
  return response.data;
};

export const getPointsTable = async () => {
  const response = await api.get('/matches/table/points');
  return response.data;
};

// Get all team managers
export const getAllTeamManagers = async () => {
  const response = await api.get('/users/managers');
  return response.data;
};

// In api.js
export const getPlayerUsers = async () => {
  const response = await api.get('/users/players');
  return response.data;
};

export default api;
