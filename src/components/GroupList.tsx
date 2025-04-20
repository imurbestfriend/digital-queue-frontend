import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/grouplist.module.css'
import { Link } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

interface Group {
	id: string
	number: string
	name: string
}

interface GroupResponse {
	items: Group[]
	limit: number
	offset: number
	total: number
}

export default function GroupList() {
	const API_URL = import.meta.env.VITE_API_URL
	const [groups, setGroups] = useState<Group[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState<string>('')
	const navigate = useNavigate()

	const getGroups = async () => {
		try {
			setLoading(true)
			const response = await axios.get<GroupResponse>(`${API_URL}/groups`)
			setGroups(response.data.items)
			setError(null)
		} catch (err) {
			console.error('Error fetching groups:', err)
			setError('Failed to fetch groups')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getGroups()
	}, [])

	const filteredGroups = groups
		.filter(
			group =>
				group.number.toLowerCase().includes(search.toLowerCase()) ||
				group.name.toLowerCase().includes(search.toLowerCase())
		)
		.sort((a, b) => a.number.localeCompare(b.number))

	// Разбие групп по номеру с учетом магистратуры
	const grouped = filteredGroups.reduce((acc, group) => {
		const groupNumber = group.number.toLowerCase()

		// Проверяем, содержит ли номер группы букву "м"
		if (groupNumber.includes('м')) {
			// Определяем курс магистратуры (1м или 2м)
			if (groupNumber.startsWith('1')) {
				if (!acc['1м']) {
					acc['1м'] = []
				}
				acc['1м'].push(group)
			} else if (groupNumber.startsWith('2')) {
				if (!acc['2м']) {
					acc['2м'] = []
				}
				acc['2м'].push(group)
			}
		} else {
			// Обычные группы бакалавриата/специалитета
			const firstChar = group.number[0]
			if (['1', '2', '3', '4', '5', '6'].includes(firstChar)) {
				if (!acc[firstChar]) {
					acc[firstChar] = []
				}
				acc[firstChar].push(group)
			}
		}
		return acc
	}, {} as Record<string, Group[]>)

	const handleClick = (id: string, number: string) => {
		Cookies.set('group_id', id)
		Cookies.set('group_name', number)
		navigate(`/dashboard/schedule`)
	}

	// Определяем порядок отображения курсов
	const courseOrder = ['1', '2', '3', '4', '5', '6', '1м', '2м']

	return (
		<div className={styles.container}>
			<div className={styles.loginBtn}>
				<Link to='/Auth' className={styles.dashboardLink}>
					Выйти
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							fill-rule='evenodd'
							clip-rule='evenodd'
							d='M7.45408 3.32849L10.1096 3.32849C10.7104 3.32848 11.209 3.32847 11.6171 3.35785C12.0412 3.38838 12.4367 3.45399 12.8163 3.621C13.6071 3.96896 14.2388 4.60067 14.5868 5.3915C14.7538 5.77107 14.8194 6.16659 14.85 6.59073C14.8793 6.99885 14.8793 7.49738 14.8793 8.09823V8.13056C14.8793 8.62761 14.4764 9.03056 13.9793 9.03056C13.4823 9.03056 13.0793 8.62761 13.0793 8.13056C13.0793 7.4892 13.0788 7.05577 13.0546 6.71996C13.0311 6.39286 12.9885 6.22843 12.9392 6.11642C12.7726 5.73771 12.4701 5.4352 12.0914 5.26857C11.9794 5.21929 11.8149 5.17675 11.4879 5.15321C11.152 5.12903 10.7186 5.12849 10.0773 5.12849H7.49032C6.77255 5.12849 6.28745 5.12917 5.9129 5.15927C5.54859 5.18854 5.36743 5.24127 5.24405 5.30293C4.92363 5.46303 4.66384 5.72282 4.50373 6.04324C4.44208 6.16663 4.38935 6.34779 4.36007 6.71209C4.32997 7.08664 4.3293 7.57175 4.3293 8.28951V15.3937C4.3293 16.1115 4.32997 16.5966 4.36007 16.9711C4.38935 17.3354 4.44208 17.5166 4.50373 17.64C4.66384 17.9604 4.92363 18.2202 5.24405 18.3803C5.36743 18.4419 5.54859 18.4947 5.9129 18.524C6.28745 18.5541 6.77255 18.5547 7.49032 18.5547H9.9183C10.6361 18.5547 11.1212 18.5541 11.4957 18.524C11.86 18.4947 12.0412 18.4419 12.1646 18.3803C12.485 18.2202 12.7448 17.9604 12.9049 17.64C12.9665 17.5166 13.0193 17.3354 13.0485 16.9711C13.0786 16.5966 13.0793 16.1115 13.0793 15.3937V15.1161C13.0793 14.619 13.4823 14.2161 13.9793 14.2161C14.4764 14.2161 14.8793 14.619 14.8793 15.1161V15.43C14.8793 16.1023 14.8793 16.6601 14.8428 17.1153C14.8047 17.5889 14.7228 18.0289 14.5151 18.4445C14.1807 19.1136 13.6382 19.6561 12.9691 19.9905C12.5535 20.1982 12.1135 20.2801 11.6399 20.3182C11.1847 20.3548 10.6269 20.3547 9.95454 20.3547H7.45407C6.78173 20.3547 6.22394 20.3548 5.76872 20.3182C5.29509 20.2801 4.85515 20.1982 4.43949 19.9905C3.77038 19.6561 3.22788 19.1136 2.89355 18.4445C2.68586 18.0289 2.60392 17.5889 2.56586 17.1153C2.52928 16.6601 2.52929 16.1023 2.5293 15.4299V8.25327C2.52929 7.58092 2.52928 7.02313 2.56586 6.56791C2.60392 6.09429 2.68586 5.65434 2.89355 5.23868C3.22788 4.56958 3.77038 4.02708 4.43949 3.69275C4.85515 3.48505 5.29509 3.40311 5.76872 3.36505C6.22394 3.32847 6.78173 3.32848 7.45408 3.32849ZM16.8574 7.93293C17.2077 7.58026 17.7775 7.57832 18.1302 7.92859L21.2073 10.9848C21.3774 11.1537 21.4731 11.3836 21.4731 11.6233C21.4731 11.8631 21.3774 12.0929 21.2073 12.2619L18.1302 15.318C17.7775 15.6683 17.2077 15.6664 16.8574 15.3137C16.5072 14.961 16.5091 14.3912 16.8618 14.0409L18.3898 12.5233H8.70431C8.20725 12.5233 7.80431 12.1204 7.80431 11.6233C7.80431 11.1263 8.20725 10.7233 8.70431 10.7233H18.3898L16.8618 9.20572C16.5091 8.85544 16.5072 8.2856 16.8574 7.93293Z'
							fill='white'
						/>
					</svg>
				</Link>
			</div>
			<h1 className={styles.header}>Добро пожаловать!</h1>
			<p className={styles.subheader}>
				Для просмотра расписания выберите свою группу:
			</p>

			{loading && (
				<Box sx={{ textAlign: 'center', width: '50%', margin: '20px auto' }}>
					<CircularProgress color='inherit' />
				</Box>
			)}

			{error && <p className={styles.error}>{error}</p>}

			{!loading && !error && groups.length === 0 && (
				<p className={styles.empty}>Группы не найдены</p>
			)}

			{!loading && (
				<Box
					component='form'
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 2,
						width: '100%',
						margin: '20px 0',
					}}
					noValidate
					autoComplete='off'
				>
					<TextField
						id='search-groups'
						label='Поиск группы'
						variant='filled'
						type='text'
						value={search}
						sx={{
							width: '100%',
							maxWidth: '500px',
							'& .MuiFilledInput-root': {
								paddingLeft: '12px',
								paddingRight: '12px',
								borderRadius: '8px',
								backgroundColor: '#f5f5f5',
							},
							'& .MuiInputBase-input': {
								width: '100%',
							},
							'& .MuiFilledInput-underline:before': {
								borderBottomColor: '#00004B',
							},
							'& .MuiFilledInput-underline:after': {
								borderBottomColor: '#00004B',
							},
							'& .Mui-focused': {
								color: '#00004B',
							},
						}}
						onChange={e => setSearch(e.target.value)}
					/>
				</Box>
			)}

			<div className={styles.coursesContainer}>
				{courseOrder.map(courseKey => {
					// Отображаем секцию только если есть группы для этого курса
					if (grouped[courseKey] && grouped[courseKey].length > 0) {
						const courseTitle = courseKey.includes('м')
							? `${courseKey} курс (магистратура)`
							: `${courseKey} курс`

						return (
							<div key={courseKey} className={styles.courseSection}>
								<h2 className={styles.courseTitle}>{courseTitle}</h2>
								<ul className={styles.groupsGrid}>
									{grouped[courseKey].map(group => (
										<li
											key={group.id}
											className={styles.groupCard}
											onClick={() => handleClick(group.id, group.number)}
										>
											<span className={styles.groupNumber}>{group.number}</span>
										</li>
									))}
								</ul>
							</div>
						)
					}
					return null
				})}
			</div>
		</div>
	)
}
