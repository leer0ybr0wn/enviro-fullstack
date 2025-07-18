import type { ChartConfiguration } from 'chart.js'

export type ChartConfig = ChartConfiguration<'line'>

export interface DataRecord {
	unix: number
	temp: number
	humidity: number
	pressure: number
	light: number
}

export type DataRecordList = DataRecord[]

export type DataPoint = { x: number; y: number }

export type DisplayValues = {
	current: string
	low: string
	high: string
}
