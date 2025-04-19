import { useEffect, useState, useCallback } from 'react'
import { QueueStatus } from '../types/schedule'
import { queueService } from '../services/queueService'
import styles from '../styles/queueModal.module.css'
import Cookies from 'js-cookie'
import { useRef } from 'react'

interface QueueModalProps {
	queueId: number
	scheduleName: string
	onClose: () => void
	onJoinSuccess?: () => void
}

const QueueModal = ({
	queueId,
	scheduleName,
	onClose,
	onJoinSuccess,
}: QueueModalProps) => {
	const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
	const [isUserInQueue, setIsUserInQueue] = useState<boolean>(false)
	const [userPosition, setUserPosition] = useState<number | null>(null)
	const [actionLoading, setActionLoading] = useState<boolean>(false)
	const [actionMessage, setActionMessage] = useState<{
		text: string
		type: 'success' | 'error'
	} | null>(null)
	const wsRef = useRef<WebSocket | null>(null)

	// Check if user is authenticated and get user ID from token
	useEffect(() => {
		const token = Cookies.get('access_token')
		setIsAuthenticated(!!token)

		// In a real app, you would decode the JWT to get the user ID
		// For now, we'll assume we can get it from somewhere
		// This is a placeholder - replace with actual user ID extraction
		const userId = token ? getUserIdFromToken(token) : null

		if (userId && queueStatus) {
			const userParticipant = queueStatus.participants.find(
				p => p.user_id === userId
			)
			setIsUserInQueue(!!userParticipant)
			setUserPosition(userParticipant?.position || null)
		} else {
			setIsUserInQueue(false)
			setUserPosition(null)
		}
	}, [queueStatus])

	// Helper function to extract user ID from token (placeholder)
	const getUserIdFromToken = (token: string): number | null => {
		try {
			// This is a simplified example - in a real app, you would properly decode the JWT
			const base64Url = token.split('.')[1]
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map(c => {
						return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
					})
					.join('')
			)

			const payload = JSON.parse(jsonPayload)
			return payload.user_id || null
		} catch (e) {
			console.error('Error decoding token:', e)
			return null
		}
	}

	// Fetch queue status
	const fetchQueueStatus = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			const data = await queueService.getQueueStatus(queueId)
			setQueueStatus(data)
		} catch (error) {
			console.error('Error fetching queue status:', error)
			setError('Не удалось загрузить информацию об очереди')
		} finally {
			setLoading(false)
		}
	}, [queueId])

	// Initial fetch
	useEffect(() => {
		fetchQueueStatus()
	}, [fetchQueueStatus])

	useEffect(() => {
    const token = Cookies.get('access_token')
    // выбираем протокол в зависимости от того, на каком хосте запущен FE
    const protocol = import.meta.env.VITE_WS_URL?.startsWith('wss') ? 'wss' : 'ws'
		console.log('protocol', protocol)
    const wsUrl = `${import.meta.env.VITE_WS_URL}/api/queues/${queueId}/ws`
    // если бекенд требует заголовок Authorization, можно передать токен в query:
    const urlWithToken = token ? `${wsUrl}?token=${token}` : wsUrl

    const ws = new WebSocket(urlWithToken)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected to queue', queueId)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          event_type: string
          queue_id: string
          data?: any
        }
        console.log('WS message:', msg)
        // 3) Обновляем статус очереди по событию
        // В простейшем случае — просто перезапрос
        fetchQueueStatus()
      } catch (e) {
        console.error('WS parse error:', e)
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    // При анмаунте закрываем
    return () => {
      ws.close()
    }
  }, [queueId, fetchQueueStatus])

	// Join queue handler
	const handleJoinQueue = async () => {
		if (!isAuthenticated || actionLoading) return

		setActionLoading(true)
		setActionMessage(null)

		try {
			const result = await queueService.joinQueue(queueId)

			if (result.success) {
				setActionMessage({
					text: result.message || 'Вы успешно присоединились к очереди',
					type: 'success',
				})

				// Refresh queue status
				await fetchQueueStatus()

				// Notify parent component if needed
				if (onJoinSuccess) {
					onJoinSuccess()
				}
			} else {
				setActionMessage({
					text: result.message || 'Не удалось присоединиться к очереди',
					type: 'error',
				})
			}
		} catch (error) {
			setActionMessage({
				text: 'Произошла ошибка при присоединении к очереди',
				type: 'error',
			})
		} finally {
			setActionLoading(false)
		}
	}

	// Leave queue handler
	const handleLeaveQueue = async () => {
		if (!isAuthenticated || !isUserInQueue || actionLoading) return

		setActionLoading(true)
		setActionMessage(null)

		try {
			const result = await queueService.leaveQueue(queueId)

			if (result.success) {
				setActionMessage({
					text: result.message || 'Вы успешно покинули очередь',
					type: 'success',
				})

				// Refresh queue status
				await fetchQueueStatus()
			} else {
				setActionMessage({
					text: result.message || 'Не удалось покинуть очередь',
					type: 'error',
				})
			}
		} catch (error) {
			setActionMessage({
				text: 'Произошла ошибка при выходе из очереди',
				type: 'error',
			})
		} finally {
			setActionLoading(false)
		}
	}

	
	// Close modal when clicking outside or pressing Escape
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [onClose])

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>Очередь: {scheduleName}</h2>
					<button className={styles.closeButton} onClick={onClose}>
						&times;
					</button>
				</div>

				<div className={styles.modalBody}>
					{loading && <div className={styles.loading}>Загрузка очереди...</div>}

					{error && <div className={styles.error}>{error}</div>}

					{actionMessage && (
						<div
							className={
								actionMessage.type === 'success' ? styles.success : styles.error
							}
						>
							{actionMessage.text}
						</div>
					)}

					{!loading && !error && queueStatus && (
						<>
							<div className={styles.queueInfo}>
								{isAuthenticated && (
									<div className={styles.queueActions}>
										{!isUserInQueue ? (
											<button
												className={styles.joinQueueButton}
												onClick={handleJoinQueue}
												disabled={actionLoading}
											>
												{actionLoading
													? 'Присоединение...'
													: 'Присоединиться к очереди'}
											</button>
										) : (
											<>
												<div className={styles.userPosition}>
													Ваша позиция в очереди:{' '}
													<strong>{userPosition}</strong>
												</div>
												<button
													className={styles.leaveQueueButton}
													onClick={handleLeaveQueue}
													disabled={actionLoading}
												>
													{actionLoading ? 'Выход...' : 'Покинуть очередь'}
												</button>
											</>
										)}
									</div>
								)}

								<button
									className={styles.refreshButton}
									onClick={fetchQueueStatus}
									disabled={loading}
								>
									Обновить
								</button>
							</div>

							{queueStatus.participants.length === 0 ? (
								<div className={styles.emptyQueue}>
									В очереди пока никого нет
								</div>
							) : (
								<div className={styles.participantsList}>
									<div className={styles.participantsHeader}>
										<div className={styles.positionHeader}>№</div>
										<div className={styles.nameHeader}>Имя</div>
									</div>

									{queueStatus.participants.map(participant => (
										<div
											key={participant.user_id}
											className={`${styles.participantItem} ${
												isUserInQueue && participant.position === userPosition
													? styles.currentUser
													: ''
											}`}
										>
											<div className={styles.position}>
												{participant.position}
											</div>
											<div className={styles.name}>
												{participant.name} {participant.surname}
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default QueueModal
