import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getTasks = async (page = 1) => {
  const res = await axios.get(`${API_BASE_URL}/tasks?page=${page}`);
  return res.data;
};

export const createTask = async (task: {
  title: string;
  description?: string;
  status?: string;
  due_date?: string;
}) => {
  const res = await axios.post(`${API_BASE_URL}/tasks`, task);
  return res.data;
};

export const deleteTask = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/tasks/${id}`);
};
