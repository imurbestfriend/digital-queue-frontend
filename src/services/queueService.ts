import axios from 'axios'
import Cookies from 'js-cookie'
import { QueueStatus } from '../types/schedule'

const API_URL = import.meta.env.VITE_API_URL

// Helper function to get auth header
const getAuthHeader = () => {
	const token = Cookies.get('access_token')
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export const queueService = {
	// Get queue status
	getQueueStatus: async (queueId: number): Promise<QueueStatus> => {
		try {
			const response = await axios.get<QueueStatus>(
				`${API_URL}/api/queues/${queueId}/status`,
				{
					headers: {
						...getAuthHeader(),
					},
				}
			)
			return response.data
		} catch (error) {
			console.error('Error fetching queue status:', error)
			throw error
		}
	},

	// Join queue
	joinQueue: async (
		queueId: number
	): Promise<{ success: boolean; message?: string }> => {
		try {
			await axios.post(
				`${API_URL}/api/queues/${queueId}/join`,
				{},
				{
					headers: {
						...getAuthHeader(),
					},
				}
			)

			return {
				success: true,
				message: 'Вы успешно присоединились к очереди',
			}
		} catch (error) {
			console.error('Error joining queue:', error)

			// Handle different error cases
			if (axios.isAxiosError(error)) {
				const statusCode = error.response?.status
				const errorData = error.response?.data

				switch (statusCode) {
					case 400:
						return {
							success: false,
							message: `Ошибка: ${errorData?.message || 'Неверный запрос'}`,
						}
					case 401:
						return {
							success: false,
							message: 'Необходима авторизация для присоединения к очереди',
						}
					case 403:
						return {
							success: false,
							message: 'Вы уже находитесь в этой очереди',
						}
					case 404:
						return {
							success: false,
							message: 'Очередь не найдена',
						}
					default:
						return {
							success: false,
							message: 'Произошла ошибка при присоединении к очереди',
						}
				}
			}

			return {
				success: false,
				message: 'Не удалось присоединиться к очереди',
			}
		}
	},

	// Leave queue
	leaveQueue: async (
		queueId: number
	): Promise<{ success: boolean; message?: string }> => {
		try {
			await axios.post(
				`${API_URL}/api/queues/${queueId}/leave`,
				{},
				{
					headers: {
						...getAuthHeader(),
					},
				}
			)

			return {
				success: true,
				message: 'Вы успешно покинули очередь',
			}
		} catch (error) {
			console.error('Error leaving queue:', error)

			// Handle different error cases
			if (axios.isAxiosError(error)) {
				const statusCode = error.response?.status
				const errorData = error.response?.data

				switch (statusCode) {
					case 400:
						return {
							success: false,
							message: `Ошибка: ${errorData?.message || 'Неверный запрос'}`,
						}
					case 401:
						return {
							success: false,
							message: 'Необходима авторизация',
						}
					case 404:
						return {
							success: false,
							message: 'Вы не находитесь в этой очереди или очередь не найдена',
						}
					default:
						return {
							success: false,
							message: 'Произошла ошибка при выходе из очереди',
						}
				}
			}

			return {
				success: false,
				message: 'Не удалось покинуть очередь',
			}
		}
	},
}
