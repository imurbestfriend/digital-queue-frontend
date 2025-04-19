export interface Schedule {
	ID: number
	CreatedAt: string
	UpdatedAt: string
	DeletedAt: null | string
	ExternalID: string
	Name: string
	StartTime: string
	EndTime: string
	GroupIDs: string
}

export interface Queue {
	ID: number
	CreatedAt: string
	UpdatedAt: string
	DeletedAt: null | string
	ScheduleID: number
	OpensAt: string
	ClosesAt: string
	IsActive: boolean
	MaxParticipants: number
}

export interface QueueParticipant {
	user_id: number
	name: string
	surname: string
	position: number
}

export interface QueueStatus {
	queue_id: number
	schedule_id: number
	opens_at: string
	closes_at: string
	is_active: boolean
	participants: QueueParticipant[]
}

export interface ScheduleItem {
	schedule: Schedule
	queue?: Queue
}

export interface ScheduleResponse {
	[index: number]: ScheduleItem
}

export interface ScheduleByDay {
	[date: string]: ScheduleItem[]
}
