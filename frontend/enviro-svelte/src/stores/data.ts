import { writable } from 'svelte/store'
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js'
import 'chartjs-adapter-date-fns'
import type { ChartConfig, DataRecordList, DataPoint, DisplayValues } from '../types/envirotypes'

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend)
Chart.defaults.plugins.legend.display = false
Chart.defaults.plugins.tooltip.callbacks.title = (context) => {
	const date = new Date(context[0].parsed.x)
	return date
		.toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})
		.replace(',', ' -')
}

const api_url = 'http://ras.pi/enviro/api/v1'
// const api_url = 'https://api.leeroybrown.uk/enviro/v1'

const xScaleOptions = {
	type: 'time' as const,
	time: {
		displayFormats: {
			minute: 'HH:mm',
			hour: 'HH:mm',
			day: 'dd MMM',
			week: 'dd MMM',
			month: 'MMM',
		},
	},
}

const animOptions = {
	duration: 500,
}

const data = {
	temp: { datasets: [{ data: [] as DataPoint[], label: 'Temperature (°C)', borderColor: 'tomato', tension: 0.3 }] },
	humidity: { datasets: [{ data: [] as DataPoint[], label: 'Humidity (%)', borderColor: 'deepskyblue', tension: 0.3 }] },
	pressure: { datasets: [{ data: [] as DataPoint[], label: 'Pressure (hPa)', borderColor: '#b5c', tension: 0.3 }] },
	light: { datasets: [{ data: [] as DataPoint[], label: 'Light (lux)', borderColor: 'orange', tension: 0.3 }] },
}

const config = {
	temp: {
		type: 'line',
		data: data.temp,
		options: {
			scales: {
				x: xScaleOptions,
				y: { grace: '10%' },
			},
			animation: animOptions,
		},
	},
	humidity: {
		type: 'line',
		data: data.humidity,
		options: {
			scales: {
				x: xScaleOptions,
				y: { grace: '10%' },
			},
			animation: animOptions,
		},
	},
	pressure: {
		type: 'line',
		data: data.pressure,
		options: {
			scales: {
				x: xScaleOptions,
				y: { grace: '10%' },
			},
			animation: animOptions,
		},
	},
	light: {
		type: 'line',
		data: data.light,
		options: {
			scales: {
				x: xScaleOptions,
				y: {
					beginAtZero: true,
					grace: '10%',
				},
			},
			animation: animOptions,
		},
	},
} as Record<'temp' | 'humidity' | 'pressure' | 'light', ChartConfig>

export const mainStore = writable({
	data,
	config,
	darkMode: false,
	loading: false,
	year: new Date().getFullYear(),
	timeRanges: [
		['1hr', 'Hour'],
		['24hr', 'Day'],
		['1wk', 'Week'],
		['1mo', 'Month'],
		['1yr', 'Year'],
		['all', 'All'],
	],
	timeRange: '',
	displayVals: {
		temp: {} as DisplayValues,
		humidity: {} as DisplayValues,
		pressure: {} as DisplayValues,
		light: {} as DisplayValues,
		lastReading: { date: '', time: '' },
	},
	charts: {
		temp: null as Chart | null,
		humidity: null as Chart | null,
		pressure: null as Chart | null,
		light: null as Chart | null,
	},
})

export async function getData(limit?: string) {
	mainStore.update((state) => ({ ...state, loading: true }))

	mainStore.update((state) => {
		Object.values(state.data).forEach((chartData) => {
			chartData.datasets[0].data.length = 0
		})
		Object.values(state.charts).forEach((chart) => chart?.update())
		return state
	})

	try {
		const url = limit ? api_url + '?limit=' + limit : api_url
		const response = await fetch(url)
		const json: DataRecordList = await response.json()

		mainStore.update((state) => {
			json.forEach((entry) => {
				const timestamp = entry.unix * 1000
				state.data.temp.datasets[0].data.push({ x: timestamp, y: entry.temp })
				state.data.humidity.datasets[0].data.push({ x: timestamp, y: entry.humidity })
				state.data.pressure.datasets[0].data.push({ x: timestamp, y: entry.pressure })
				state.data.light.datasets[0].data.push({ x: timestamp, y: entry.light })
			})

			Object.values(state.charts).forEach((chart) => chart?.update())

			state.displayVals.temp = {
				current: json.at(-1)?.temp.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.temp)),
			}
			state.displayVals.humidity = {
				current: json.at(-1)?.humidity.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.humidity)),
			}
			state.displayVals.pressure = {
				current: json.at(-1)?.pressure.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.pressure)),
			}
			state.displayVals.light = {
				current: json.at(-1)?.light.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.light)),
			}

			const latestTimestamp = json.at(-1)?.unix
			if (latestTimestamp) {
				const dateObj = new Date(latestTimestamp * 1000)
				state.displayVals.lastReading.date = dateObj.toLocaleDateString()
				state.displayVals.lastReading.time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			} else {
				state.displayVals.lastReading.date = '-'
				state.displayVals.lastReading.time = '-'
			}

			state.loading = false
			return state
		})
	} catch (e) {
		console.error(e)
		mainStore.update((state) => ({ ...state, loading: false }))
	}
}

export function registerCharts(tempChart: Chart, humidChart: Chart, pressChart: Chart, lightChart: Chart) {
	mainStore.update((state) => {
		state.charts.temp = tempChart
		state.charts.humidity = humidChart
		state.charts.pressure = pressChart
		state.charts.light = lightChart
		return state
	})
}

function getLowHigh(arr: number[]): { low: string; high: string } {
	const min = Math.min(...arr)
	const max = Math.max(...arr)
	return {
		low: min === 0 ? min.toString() : min.toFixed(1),
		high: max.toFixed(1),
	}
}

export function toggleTheme() {
	mainStore.update((state) => {
		state.darkMode = !state.darkMode
		document.documentElement.classList.toggle('dark', state.darkMode)
		return state
	})
}
