import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ScheduleItem } from '../types/schedule'
import ScheduleClass from './ScheduleClass'
import styles from '../styles/schedule.module.css'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

const notyf = new Notyf()

interface ScheduleDayProps {
	date: string
	scheduleItems: ScheduleItem[]
}

const ScheduleDay = ({ date, scheduleItems }: ScheduleDayProps) => {
	const formattedDate = format(parseISO(date), 'EEEE, d MMMM', { locale: ru })

	if (scheduleItems.length === 0) {
		notyf.error(`На ${formattedDate} нет занятий.`)
	}

	return (
		<div className={styles.dayContainer}>
			<h2 className={styles.dayTitle}>
				<span className={styles.dayName}>{formattedDate.split(',')[0]}</span>
				<span className={styles.dayDate}>{formattedDate.split(',')[1]}</span>
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
