import { format, parseISO, addHours, isBefore } from 'date-fns'
import { ScheduleItem } from '../types/schedule'
import styles from '../styles/schedule.module.css'
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import QueueModal from './QueueModal'

interface ScheduleClassProps {
	item: ScheduleItem
}

const ScheduleClass = ({ item }: ScheduleClassProps) => {
	const { schedule, queue } = item
	const [timeUntilOpen, setTimeUntilOpen] = useState<string>('')
	const [, setIsAuthenticated] = useState<boolean>(false)
	const [showQueueModal, setShowQueueModal] = useState<boolean>(false)
	const [joinSuccess, setJoinSuccess] = useState<boolean>(false)

	const timeRange = `${format(
		parseISO(schedule.StartTime),
		'HH:mm'
	)} - ${format(parseISO(schedule.EndTime), 'HH:mm')}`

	const hasQueue = queue !== undefined
	const queueOpenTime = hasQueue
		? parseISO(queue.OpensAt)
		: addHours(parseISO(schedule.StartTime), -56)

	const now = new Date()
	const isQueueOpen = hasQueue && queue.IsActive
	const isQueueNotYetOpen = hasQueue && !queue.IsActive && isBefore(now, queueOpenTime)
	const shouldShowQueueCountdown = !hasQueue && isBefore(now, queueOpenTime)

	useEffect(() => {
		const accessToken = Cookies.get('access_token')
		setIsAuthenticated(!!accessToken)

		if (!isQueueNotYetOpen && !shouldShowQueueCountdown) return

		const updateTimer = () => {
			const now = new Date()
			const diffMs = queueOpenTime.getTime() - now.getTime()

			if (diffMs <= 0) {
				setTimeUntilOpen('5 минут')
				return
			}

			const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
			const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

			setTimeUntilOpen(`${diffHours} ч. ${diffMinutes} мин.`)
		}

		updateTimer()
		const timerId = setInterval(updateTimer, 60000)

		return () => clearInterval(timerId)
	}, [isQueueNotYetOpen, queueOpenTime, shouldShowQueueCountdown])

	return (
		<div className={styles.classCard}>
			<div className={styles.classHeader}>
				<div className={styles.classInfo}>
					<span className={styles.classTime}>{timeRange}</span>
					<p className={styles.className}>{schedule.Name}</p>
				</div>
				

				<div className={styles.classDetails}>
				{hasQueue ? (
					<div className={styles.queueInfo}>
						{isQueueOpen ? (
							<>
								{/* <div className={styles.queueStatus}>Очередь открыта</div> */}
								<button
									className={styles.viewQueueButton}
									onClick={() => setShowQueueModal(true)}
								>
									Очередь
								</button>
							</>
						) : (
							<div className={styles.queueCountdown}>
								Откроется через {timeUntilOpen}
							</div>
						)}
					</div>
				) : (
					shouldShowQueueCountdown && (
						<div className={styles.queueInfo}>
							<div className={styles.queueCountdown}>
								Окроется через {timeUntilOpen}
							</div>
						</div>
					)
				)}

				{joinSuccess && (
					<div className={styles.success}>
						Вы успешно присоединились к очереди
					</div>
				)}
			</div>
			</div>

			

			{showQueueModal && hasQueue && (
				<QueueModal
					queueId={queue.ID}
					scheduleName={schedule.Name}
					onClose={() => setShowQueueModal(false)}
					onJoinSuccess={() => setJoinSuccess(true)}
				/>
			)}
		</div>
	)
}

export default ScheduleClass