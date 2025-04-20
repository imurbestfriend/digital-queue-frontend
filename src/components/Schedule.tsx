import { useState, useEffect } from 'react'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import { ScheduleResponse, ScheduleByDay } from '../types/schedule'
import ScheduleDay from './ScheduleDay'
import styles from '../styles/schedule.module.css'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom';
import Header from "./HeaderComp";

const API_URL = import.meta.env.VITE_API_URL

const Schedule = () => {
	const groupId = Cookies.get('group_id') || ''
	const [schedule, setSchedule] = useState<ScheduleByDay>({})
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate();


	useEffect(() => {
		const fetchSchedule = async () => {
			if (!groupId) {
				setError('ID группы не найден. Пожалуйста, выберите группу.')
				setLoading(false)
				return
			}

			try {
				const response = await axios.get<ScheduleResponse>(
					`${API_URL}/schedule?group_id=${groupId}`
				)

				
				const scheduleByDay: ScheduleByDay = {}

				
				const scheduleItems = Array.isArray(response.data)
					? response.data
					: Object.values(response.data)

				scheduleItems.forEach(item => {
					const startDate = format(
						parseISO(item.schedule.StartTime),
						'yyyy-MM-dd'
					)

					if (!scheduleByDay[startDate]) {
						scheduleByDay[startDate] = []
					}

					scheduleByDay[startDate].push(item)
				})

				
				Object.keys(scheduleByDay).forEach(day => {
					scheduleByDay[day].sort(
						(a, b) =>
							new Date(a.schedule.StartTime).getTime() -
							new Date(b.schedule.StartTime).getTime()
					)
				})

				setSchedule(scheduleByDay)
				setLoading(false)
			} catch (err) {
				console.error('Error fetching schedule:', err)
				setError(
					'Не удалось загрузить расписание. Пожалуйста, попробуйте позже.'
				)
				setLoading(false)
			}
		}

		fetchSchedule()
	}, [groupId])

	const handleBack = () => {
		Cookies.remove('group_id')
		Cookies.remove('group_name')
		navigate('/dashboard/grouplist')
	}

	if (loading) {
		return <div className={styles.loading}>Загрузка расписания...</div>
	}

	if (error) {
		return(
			// <div className={styles.errorBlock}>
			<div>
				<div className={styles.error}>{error}</div>
				<button className={styles.errorBtn} onClick={handleBack}>Назад</button>
			</div>
		) 
		
	}

	if (Object.keys(schedule).length === 0) {
		return <div className={styles.empty}>Расписание не найдено</div>
	}

	
	
	return (
		
		<div className={styles.scheduleContainer}>
			<Header />
			<h1 className={styles.title}>Расписание группы </h1>
			{/* <button onClick={handleBack}>Назад</button> */}
			{Object.keys(schedule)
				.sort() 
				.map(day => (
					<ScheduleDay key={day} date={day} scheduleItems={schedule[day]} />
				))}
		</div>
	)
}

export default Schedule
