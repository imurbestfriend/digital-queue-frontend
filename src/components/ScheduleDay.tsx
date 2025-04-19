import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ScheduleItem } from '../types/schedule'
import ScheduleClass from './ScheduleClass'
import styles from '../styles/schedule.module.css'

interface ScheduleDayProps {
	date: string
	scheduleItems: ScheduleItem[]
}

const ScheduleDay = ({ date, scheduleItems }: ScheduleDayProps) => {
	// Format the date as "Понедельник, 21 апреля"
	const formattedDate = format(parseISO(date), 'EEEE, d MMMM', { locale: ru })

	return (
		<div className={styles.dayContainer}>
			<h2 className={styles.dayTitle}>
				{formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
			</h2>

			<div className={styles.classesList}>
				{scheduleItems.map(item => (
					<ScheduleClass key={item.schedule.ID} item={item} />
				))}
			</div>
		</div>
	)
}

export default ScheduleDay
