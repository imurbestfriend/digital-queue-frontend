import { useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL

const TokenRefresherWithAxios = () => {
	const refreshToken = async () => {
		const refreshToken = Cookies.get('refresh_token')
		if (!refreshToken) {
			console.error('Refresh token не найден в куках')
			return
		}

		try {
			// Отправляем запрос на обновление токена
			const response = await axios.post(
				`${API_URL}/auth/refresh`,
				{ refresh_token: refreshToken }, // Передаем refresh_token в теле запроса
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			)
			console.log('Ответ от сервера:', response.data.access_token)

			// Проверяем, что токены получены
			if (response.data && response.data.access && response.data.refresh) {
				// Устанавливаем новые токены в куки
				Cookies.set('access_token', response.data.access, {
					sameSite: 'strict',
					secure: true,
				})
				Cookies.set('refresh_token', response.data.refresh, {
					sameSite: 'strict',
					secure: true,
				})

				console.log('Токены успешно обновлены')
			} else {
				console.error('Ответ от сервера не содержит токенов')
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error(
					'Ошибка при обновлении токенов:',
					error.response?.data?.message || error.message
				)
			} else {
				console.error('Неизвестная ошибка:', error)
			}
		}
	}

	useEffect(() => {
		// Обновляем токен при монтировании компонента
		refreshToken()

		// Устанавливаем интервал для периодического обновления токенов
		const interval = setInterval(() => {
			refreshToken()
		}, 14 * 60 * 1000) // Обновление каждые 14 минут

		// Очищаем интервал при размонтировании компонента
		return () => clearInterval(interval)
	}, [])

	return null
}

export default TokenRefresherWithAxios
