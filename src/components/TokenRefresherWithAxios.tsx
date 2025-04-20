// TokenRefresherWithAxios.tsx — версия на axios + js-cookie
import { useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL;

const TokenRefresherWithAxios = () => {
	const refreshToken = async () => {
		const rt = Cookies.get('refresh_token')
		if (!rt) {
			console.error('Refresh token не найден в куках')
			return
		}

		try {
			const { data } = await axios.post(
				`${API_URL}/auth/refresh`,
				{ refresh_token: rt },
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				}
			)

			Cookies.set('access_token', data.access, { sameSite: 'strict' })
			Cookies.set('refresh_token', data.refresh, { sameSite: 'strict' })
			console.log('Tokens обновлены:', data)
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				console.error(
					'Ошибка Axios:',
					err.response?.data?.message || err.message
				)
			} else if (err instanceof Error) {
				console.error('Ошибка:', err.message)
			} else {
				console.error('Неизвестная ошибка:', String(err))
			}
		}
	}

	useEffect(() => {
		refreshToken()
	}, [])

	return null
}

export default TokenRefresherWithAxios
