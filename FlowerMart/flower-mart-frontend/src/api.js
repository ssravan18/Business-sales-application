import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Matches your Backend Port
});

export default API;