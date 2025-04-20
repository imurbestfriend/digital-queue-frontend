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

	
	useEffect(() => {
		const token = Cookies.get('access_token')
		setIsAuthenticated(!!token)
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

	
	const getUserIdFromToken = (token: string): number | null => {
		try {
			
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

	
	useEffect(() => {
		fetchQueueStatus()
	}, [fetchQueueStatus])

	useEffect(() => {
    const token = Cookies.get('access_token')
    const protocol = import.meta.env.VITE_WS_URL?.startsWith('wss') ? 'wss' : 'ws'
		console.log('protocol', protocol)
    const wsUrl = `${import.meta.env.VITE_WS_URL}/api/queues/${queueId}/ws`
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

    
    return () => {
      ws.close()
    }
  }, [queueId, fetchQueueStatus])

	
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

				
				await fetchQueueStatus()

				
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
											<div className={styles.centerUpdate}>
											<button
											className={styles.joinnQueueButton}
											onClick={handleJoinQueue}
											disabled={actionLoading}
											>
											{actionLoading ? 'Присоединение...' : (
												<>
												Вступить
												<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.1108 5.13044C13.463 5.13044 12.1833 6.41058 12.1833 7.92165C12.1833 9.43273 13.463 10.7129 15.1108 10.7129C16.7586 10.7129 18.0382 9.43273 18.0382 7.92165C18.0382 6.41058 16.7586 5.13044 15.1108 5.13044ZM10.3833 7.92165C10.3833 5.35553 12.5309 3.33044 15.1108 3.33044C17.6906 3.33044 19.8382 5.35553 19.8382 7.92165C19.8382 10.4878 17.6906 12.5129 15.1108 12.5129C12.5309 12.5129 10.3833 10.4878 10.3833 7.92165ZM4.58528 7.02165C5.08234 7.02165 5.48528 7.4246 5.48528 7.92165V9.79006H7.45587C7.95293 9.79006 8.35587 10.193 8.35587 10.6901C8.35587 11.1871 7.95293 11.5901 7.45587 11.5901H5.48528V13.4585C5.48528 13.9555 5.08234 14.3585 4.58528 14.3585C4.08823 14.3585 3.68528 13.9555 3.68528 13.4585V11.5901H1.7147C1.21764 11.5901 0.814697 11.1871 0.814697 10.6901C0.814697 10.193 1.21764 9.79006 1.7147 9.79006H3.68528V7.92165C3.68528 7.4246 4.08823 7.02165 4.58528 7.02165ZM15.1108 15.7427C10.1849 15.7427 8.93853 18.498 8.8295 19.5495C8.77824 20.0439 8.33588 20.4031 7.84148 20.3519C7.34707 20.3006 6.98784 19.8583 7.0391 19.3639C7.24903 17.3393 9.3198 13.9427 15.1108 13.9427C20.9017 13.9427 22.9725 17.3393 23.1824 19.3639C23.2337 19.8583 22.8745 20.3006 22.3801 20.3519C21.8857 20.4031 21.4433 20.0439 21.392 19.5495C21.283 18.498 20.0367 15.7427 15.1108 15.7427Z" fill="white"/>
</svg>

												</>
											)}
											</button>
											<button
									className={styles.refreshButton}
									onClick={fetchQueueStatus}
									disabled={loading}
								>
									<svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M9.01106 0.226093C9.32256 0.532032 9.32775 1.03326 9.02266 1.34562L6.70493 3.71854C6.96621 3.69039 7.23147 3.67595 7.5 3.67595C11.6575 3.67595 15 7.12193 15 11.338C15 15.554 11.6575 19 7.5 19C3.34249 19 0 15.554 0 11.338C0 10.9008 0.353459 10.5463 0.789474 10.5463C1.22549 10.5463 1.57895 10.9008 1.57895 11.338C1.57895 14.7107 4.24527 17.4167 7.5 17.4167C10.7547 17.4167 13.4211 14.7107 13.4211 11.338C13.4211 7.96523 10.7547 5.25928 7.5 5.25928C6.57828 5.25928 5.70629 5.47504 4.92843 5.86078L9.02266 10.0525C9.32775 10.3649 9.32256 10.8661 9.01106 11.172C8.69957 11.478 8.19973 11.4728 7.89464 11.1604L3.10141 6.25302C2.80079 5.94524 2.80079 5.4529 3.10141 5.14512L7.89464 0.237716C8.19973 -0.0746423 8.69957 -0.0798461 9.01106 0.226093Z" fill="#767676"/>
									</svg>

								</button>
											</div>
										) : (
											<div className={styles.userStatus}>
												<div className={styles.userPosition}>
													Ваша позиция в очереди:{' '}
													{userPosition}
												</div>
												<button
									className={styles.leaveQueueButton}
									onClick={handleLeaveQueue}
									disabled={actionLoading}
									>
									{actionLoading ? 'Выход...' : (
										<>
										Покинуть
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path fillRule="evenodd" clipRule="evenodd" d="M7.45411 3.32849L10.1096 3.32849C10.7105 3.32848 11.209 3.32847 11.6171 3.35785C12.0412 3.38838 12.4368 3.45399 12.8163 3.621C13.6072 3.96896 14.2389 4.60067 14.5868 5.3915C14.7539 5.77107 14.8195 6.16659 14.85 6.59073C14.8794 6.99885 14.8794 7.49738 14.8793 8.09823V8.13056C14.8793 8.62761 14.4764 9.03056 13.9793 9.03056C13.4823 9.03056 13.0793 8.62761 13.0793 8.13056C13.0793 7.4892 13.0788 7.05577 13.0546 6.71996C13.0311 6.39286 12.9886 6.22843 12.9393 6.11642C12.7726 5.73771 12.4701 5.4352 12.0914 5.26857C11.9794 5.21929 11.815 5.17675 11.4879 5.15321C11.1521 5.12903 10.7186 5.12849 10.0773 5.12849H7.49035C6.77258 5.12849 6.28748 5.12917 5.91293 5.15927C5.54862 5.18854 5.36746 5.24127 5.24408 5.30293C4.92366 5.46303 4.66387 5.72282 4.50376 6.04324C4.44211 6.16663 4.38938 6.34779 4.3601 6.71209C4.33001 7.08664 4.32933 7.57175 4.32933 8.28951V15.3937C4.32933 16.1115 4.33001 16.5966 4.3601 16.9711C4.38938 17.3354 4.44211 17.5166 4.50376 17.64C4.66387 17.9604 4.92366 18.2202 5.24408 18.3803C5.36746 18.4419 5.54862 18.4947 5.91293 18.524C6.28748 18.5541 6.77258 18.5547 7.49035 18.5547H9.91833C10.6361 18.5547 11.1212 18.5541 11.4957 18.524C11.8601 18.4947 12.0412 18.4419 12.1646 18.3803C12.485 18.2202 12.7448 17.9604 12.9049 17.64C12.9666 17.5166 13.0193 17.3354 13.0486 16.9711C13.0787 16.5966 13.0793 16.1115 13.0793 15.3937V15.1161C13.0793 14.619 13.4823 14.2161 13.9793 14.2161C14.4764 14.2161 14.8793 14.619 14.8793 15.1161V15.43C14.8794 16.1023 14.8794 16.6601 14.8428 17.1153C14.8047 17.5889 14.7228 18.0289 14.5151 18.4445C14.1808 19.1136 13.6383 19.6561 12.9692 19.9905C12.5535 20.1982 12.1136 20.2801 11.6399 20.3182C11.1847 20.3548 10.6269 20.3547 9.95457 20.3547H7.4541C6.78176 20.3547 6.22397 20.3548 5.76875 20.3182C5.29512 20.2801 4.85518 20.1982 4.43952 19.9905C3.77041 19.6561 3.22791 19.1136 2.89358 18.4445C2.68589 18.0289 2.60395 17.5889 2.56589 17.1153C2.52931 16.6601 2.52932 16.1023 2.52933 15.4299V8.25327C2.52932 7.58092 2.52931 7.02313 2.56589 6.56791C2.60395 6.09429 2.68589 5.65434 2.89358 5.23868C3.22791 4.56958 3.77041 4.02708 4.43952 3.69275C4.85518 3.48505 5.29512 3.40311 5.76875 3.36505C6.22397 3.32847 6.78176 3.32848 7.45411 3.32849ZM16.8575 7.93293C17.2077 7.58026 17.7776 7.57832 18.1302 7.92859L21.2073 10.9848C21.3774 11.1537 21.4731 11.3836 21.4731 11.6233C21.4731 11.8631 21.3774 12.0929 21.2073 12.2619L18.1302 15.318C17.7776 15.6683 17.2077 15.6664 16.8575 15.3137C16.5072 14.961 16.5091 14.3912 16.8618 14.0409L18.3898 12.5233H8.70434C8.20728 12.5233 7.80434 12.1204 7.80434 11.6233C7.80434 11.1263 8.20728 10.7233 8.70434 10.7233H18.3898L16.8618 9.20572C16.5091 8.85544 16.5072 8.2856 16.8575 7.93293Z" fill="white"/>
										</svg>
										</>
									)}
									</button>
											</div>
										)}
									</div>
								)}

								
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
										<button
									className={styles.refreshButton}
									onClick={fetchQueueStatus}
									disabled={loading}
								>
									<svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M9.01106 0.226093C9.32256 0.532032 9.32775 1.03326 9.02266 1.34562L6.70493 3.71854C6.96621 3.69039 7.23147 3.67595 7.5 3.67595C11.6575 3.67595 15 7.12193 15 11.338C15 15.554 11.6575 19 7.5 19C3.34249 19 0 15.554 0 11.338C0 10.9008 0.353459 10.5463 0.789474 10.5463C1.22549 10.5463 1.57895 10.9008 1.57895 11.338C1.57895 14.7107 4.24527 17.4167 7.5 17.4167C10.7547 17.4167 13.4211 14.7107 13.4211 11.338C13.4211 7.96523 10.7547 5.25928 7.5 5.25928C6.57828 5.25928 5.70629 5.47504 4.92843 5.86078L9.02266 10.0525C9.32775 10.3649 9.32256 10.8661 9.01106 11.172C8.69957 11.478 8.19973 11.4728 7.89464 11.1604L3.10141 6.25302C2.80079 5.94524 2.80079 5.4529 3.10141 5.14512L7.89464 0.237716C8.19973 -0.0746423 8.69957 -0.0798461 9.01106 0.226093Z" fill="#767676"/>
									</svg>

								</button>
										
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
