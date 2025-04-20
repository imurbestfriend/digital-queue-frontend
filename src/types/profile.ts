export interface Profile {
  name: string;
  surname: string;
  email: string;
  id: number;
}

export interface QueueItem {
	queue_id: number
	position: number
	schedule_id: number
	schedule_name: string
	start_time: string
	end_time: string
	group_numbers: string[]
	opens_at: string
	closes_at: string
	is_active: boolean
}

export type QueueListResponse = QueueItem[]
