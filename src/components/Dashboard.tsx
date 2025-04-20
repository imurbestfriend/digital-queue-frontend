import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import styles from '../styles/schedule.module.css'
import TokenRefresherWithAxios from './TokenRefresherWithAxios'
import { profileService } from '../services/profileService'
import QueueModal from './QueueModal'

export default function Dashboard() {
	const [queues, setQueues] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedQueue, setSelectedQueue] = useState<any | null>(null)

	useEffect(() => {
		const fetchQueues = async () => {
			try {
				const data = await profileService.getUserQueues()
				setQueues(data)
			} catch (err) {
				setError('Не удалось загрузить очереди пользователя.')
			} finally {
				setLoading(false)
			}
		}

		fetchQueues()
	}, [])

	const groupedQueues = queues.reduce((acc: any, queue: any) => {
		const date = format(parseISO(queue.start_time), 'yyyy-MM-dd')
		if (!acc[date]) {
			acc[date] = []
		}
		acc[date].push(queue)
		return acc
	}, {})

	const handleQueueClick = (queue: any) => {
		if (queue.is_active) {
			setSelectedQueue(queue)
		}
	}

	return (
		<div className={styles.scheduleContainer}>
			<TokenRefresherWithAxios />
			<h1 className={styles.title}>Мои очереди</h1>

			{loading && <div className={styles.loading}>Загрузка очередей...</div>}
			{error && <div className={styles.error}>{error}</div>}
			{!loading && !error && Object.keys(groupedQueues).length === 0 && (
				<div className={styles.empty}>Очереди не найдены</div>
			)}
			{!loading &&
				!error &&
				Object.keys(groupedQueues)
					.sort()
					.map(date => (
						<div key={date} className={styles.dayContainer}>
							<div className={styles.dayTitle}>
								<span>{format(parseISO(date), 'EEEE, d MMMM')}</span>
							</div>
							<div className={styles.classesList}>
								{groupedQueues[date].map((queue: any) => (
									<div
										key={queue.queue_id}
										className={styles.classCard}
										onClick={() => handleQueueClick(queue)}
									>
										<div className={styles.classHeader}>
											<div className={styles.classInfo}>
												<span className={styles.classTime}>
													{format(parseISO(queue.start_time), 'HH:mm')}
												</span>
												<p className={styles.className}>
													{queue.schedule_name}
												</p>
											</div>
											<div className={styles.classDetails}>
												<span>
													{queue.is_active
														? `Позиция в очереди: ${queue.position}`
														: 'Неактивна'}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

			{selectedQueue && (
				<QueueModal
					queueId={selectedQueue.queue_id}
					scheduleName={selectedQueue.schedule_name}
					onClose={() => setSelectedQueue(null)}
				/>
			)}
		</div>
	)
}
