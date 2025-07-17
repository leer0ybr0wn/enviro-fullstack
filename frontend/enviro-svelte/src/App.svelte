<script lang="ts">
	import { onMount } from 'svelte'
	import LogoRasPi from '/raspi_logo.svg'
	import IconRefresh from './assets/icons/icon-refresh.svelte'
	import IconSpinner from './assets/icons/icon-spinner.svelte'
	import IconSun from './assets/icons/icon-sun.svelte'
	import IconMoon from './assets/icons/icon-moon.svelte'
	import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js'
	import 'chartjs-adapter-date-fns'
	import type { ChartConfiguration } from 'chart.js'

	type ChartConfig = ChartConfiguration<'line'>
	interface DataRecord {
		unix: number
		temp: number
		humidity: number
		pressure: number
		light: number
	}
	type DataRecordList = DataRecord[]
	type DataPoint = { x: number; y: number }
	type DisplayValues = {
		current: string
		low: string
		high: string
	}

	Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend)
	Chart.defaults.plugins.legend.display = false
	Chart.defaults.plugins.tooltip.callbacks.title = function (context) {
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
	// const api_url = 'https://api.leeroybrown.uk/enviro'
	const year = new Date().getFullYear()
	const timeRanges = [
		['1hr', 'Hour'],
		['24hr', 'Day'],
		['1wk', 'Week'],
		['1mo', 'Month'],
		['1yr', 'Year'],
		['all', 'All'],
	]
	let timeRange = ''

	let darkMode = false
	let loading = false

	const displayVals = {
		temp: {} as DisplayValues,
		humidity: {} as DisplayValues,
		pressure: {} as DisplayValues,
		light: {} as DisplayValues,
		lastReading: {
			date: '',
			time: '',
		},
	}

	let tempCanvas: HTMLCanvasElement
	let humidCanvas: HTMLCanvasElement
	let pressCanvas: HTMLCanvasElement
	let lightCanvas: HTMLCanvasElement

	let charts: {
		temp?: Chart
		humidity?: Chart
		pressure?: Chart
		light?: Chart
	} = {}

	// Chart data and configs as you have them, but use reactive `let` if you want
	// To keep data reactive you can wrap in $: or stores if needed

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
		temp: {
			datasets: [
				{
					label: 'Temperature (°C)',
					data: [] as DataPoint[],
					borderColor: 'tomato',
					tension: 0.3,
				},
			],
		},
		humidity: {
			datasets: [
				{
					label: 'Humidity (%)',
					data: [] as DataPoint[],
					borderColor: 'deepskyblue',
					tension: 0.3,
				},
			],
		},
		pressure: {
			datasets: [
				{
					label: 'Pressure (hPa)',
					data: [] as DataPoint[],
					borderColor: '#b5c',
					tension: 0.3,
				},
			],
		},
		light: {
			datasets: [
				{
					label: 'Light (lux)',
					data: [] as DataPoint[],
					borderColor: 'orange',
					tension: 0.3,
				},
			],
		},
	}

	const config: Record<'temp' | 'humidity' | 'pressure' | 'light', ChartConfig> = {
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
	}

	onMount(() => {
		// darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
		// document.documentElement.classList.toggle('dark', darkMode)

		charts = {
			temp: new Chart(tempCanvas, config.temp),
			humidity: new Chart(humidCanvas, config.humidity),
			pressure: new Chart(pressCanvas, config.pressure),
			light: new Chart(lightCanvas, config.light),
		}

		getData()
	})

	async function getData(limit?: string) {
		loading = true

		Object.values(data).forEach((chartData) => {
			chartData.datasets[0].data = []
		})
		Object.values(charts).forEach((chart) => chart?.update())

		try {
			const url = limit ? api_url + '?limit=' + limit : api_url
			const response = await fetch(url)
			const json: DataRecordList = await response.json()

			json.forEach((entry) => {
				const timestamp = entry.unix * 1000
				data.temp.datasets[0].data.push({ x: timestamp, y: entry.temp })
				data.humidity.datasets[0].data.push({ x: timestamp, y: entry.humidity })
				data.pressure.datasets[0].data.push({ x: timestamp, y: entry.pressure })
				data.light.datasets[0].data.push({ x: timestamp, y: entry.light })
			})

			Object.values(charts).forEach((chart) => chart?.update())

			// displayVals.temp.current = json.at(-1)?.temp.toFixed(1) ?? '-'
			// displayVals.humidity.current = json.at(-1)?.humidity.toFixed(1) ?? '-'
			// displayVals.pressure.current = json.at(-1)?.pressure.toFixed(1) ?? '-'
			// displayVals.light.current = json.at(-1)?.light.toFixed(1) ?? '-'

			displayVals.temp = {
				current: json.at(-1)?.temp.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.temp)),
			}

			displayVals.humidity = {
				current: json.at(-1)?.humidity.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.humidity)),
			}

			displayVals.pressure = {
				current: json.at(-1)?.pressure.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.pressure)),
			}

			displayVals.light = {
				current: json.at(-1)?.light.toFixed(1) ?? '-',
				...getLowHigh(json.map((d) => d.light)),
			}

			const latestTimestamp = json.at(-1)?.unix

			if (latestTimestamp) {
				const dateObj = new Date(latestTimestamp * 1000) // assuming timestamp is in seconds
				displayVals.lastReading.date = dateObj.toLocaleDateString() // e.g. "17/07/2025"
				displayVals.lastReading.time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // e.g. "14:30"
			} else {
				displayVals.lastReading.date = '-'
				displayVals.lastReading.time = '-'
			}
		} catch (error) {
			console.error(error)
		} finally {
			loading = false
		}
	}

	function getLowHigh(arr: number[]): { low: string; high: string } {
		const min = Math.min(...arr)
		const max = Math.max(...arr)
		return {
			low: min.toFixed(1),
			high: max.toFixed(1),
		}
	}

	function toggleTheme() {
		darkMode = !darkMode
		document.documentElement.classList.toggle('dark', darkMode)
	}
</script>

<header>
	<div class="d-flex jc-between ai-center px-4 py-5">
		<a href="." class="d-flex ai-center">
			<img src={LogoRasPi} alt="Raspberry Pi logo" width="18" class="mr-3" />
			<h1>PiZero Enviro</h1>
		</a>
		<div class="d-flex ai-center">
			<div class="header-date mr-3">{displayVals.lastReading.date}</div>
			<div class="font-700">{displayVals.lastReading.time}</div>
		</div>
	</div>

	<div class="controls">
		<div class="d-flex">
			<button aria-label="Reload" on:click={() => getData(timeRange)} disabled={loading}>
				{#if !loading}
					<IconRefresh />
				{:else}
					<IconSpinner class="spin" />
				{/if}
			</button>

			<div class="dark-toggle">
				<input type="checkbox" id="theme-toggle" hidden />
				<button aria-label="Light / Dark" on:click={toggleTheme}>
					{#if darkMode}
						<IconMoon />
					{:else}
						<IconSun />
					{/if}
				</button>
			</div>
		</div>

		<select bind:value={timeRange} on:change={() => getData(timeRange)}>
			<option value="" disabled selected>Time range</option>
			{#each timeRanges as [value, label]}
				<option {value}>{label}</option>
			{/each}
		</select>
	</div>
</header>

<main>
	<section class="charts {loading ? 'loading' : ''}">
		<div class="chart-container">
			<div class="chart-title">
				<h3>Temperature</h3>
				<div>
					<div class="high-low">{displayVals.temp.low} &ndash; {displayVals.temp.high}</div>
					<h3>{displayVals.temp.current}</h3>
					<span class="font-small">&deg;c</span>
				</div>
			</div>
			<canvas class="chart" bind:this={tempCanvas}></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Humidity</h3>
				<div>
					<div class="high-low">{displayVals.humidity.low} &ndash; {displayVals.humidity.high}</div>
					<h3>{displayVals.humidity.current}</h3>
					<span class="font-small">%</span>
				</div>
			</div>
			<canvas class="chart" bind:this={humidCanvas}></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Pressure</h3>
				<div>
					<div class="high-low">{displayVals.pressure.low} &ndash; {displayVals.pressure.high}</div>
					<h3>{displayVals.pressure.current}</h3>
					<span class="font-small">hPa</span>
				</div>
			</div>
			<canvas class="chart" bind:this={pressCanvas}></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Light</h3>
				<div>
					<div class="high-low">{displayVals.light.low} &ndash; {displayVals.light.high}</div>
					<h3>{displayVals.light.current}</h3>
					<span class="font-small">lux</span>
				</div>
			</div>
			<canvas class="chart" bind:this={lightCanvas}></canvas>
		</div>
	</section>
</main>

<footer>
	<div>&copy; {year} Lee Taylor</div>
</footer>
