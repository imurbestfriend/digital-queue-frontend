import { Profile, QueueListResponse } from './../types/profile';
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL

const getAuthHeader = () => {
	const token = Cookies.get('access_token')
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export const profileService = {
  getProfile: async (): Promise<Profile> => {
        try {
            const response = await axios.get<Profile>(`${API_URL}/profile`, {
                headers: {
                    ...getAuthHeader(),
                },
            })
            return response.data
        } catch (error) {
            console.error('Error fetching profile:', error)
            throw error
        }
    },
  
  getProfileQueues: async (): Promise<QueueListResponse> => {
    try {
      const response = await axios.get<QueueListResponse>(`${API_URL}/profile/queues`, {
        headers: {
          ...getAuthHeader(),
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching profile queues:', error)
      throw error
    }
  }
  
  
}