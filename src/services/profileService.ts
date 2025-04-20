import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

export const profileService = {
  getUserQueues: async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('Пользователь не авторизован');
      }

      const response = await axios.get(`${API_URL}/profile/queues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Ошибка при получении очередей пользователя:', error);
      throw error;
    }
  },
};