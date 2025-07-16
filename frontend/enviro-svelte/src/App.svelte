<script lang="ts">
	import { onMount } from 'svelte'
	import logoRasPi from '/raspi_logo.svg'
	import iconRefresh from './assets/icon-refresh.svg'
	import iconSun from './assets/icon-sun.svg'
	import iconMoon from './assets/icon-moon.svg'

	import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js'
	import 'chartjs-adapter-date-fns'

	Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend)

	const api_url = 'http://ras.pi/enviro/api/v1'
	const year = new Date().getFullYear()

	let currTemp, currHumid, currPres, currLight

	let tempCanvas: HTMLCanvasElement
	let humidCanvas: HTMLCanvasElement
	let pressCanvas: HTMLCanvasElement
	let lightCanvas: HTMLCanvasElement

	let charts: {
		temp?: Chart,
		humidity?: Chart,
		pressure?: Chart,
		light?: Chart
	 } = {}

	// Chart data and configs as you have them, but use reactive `let` if you want
	// to keep data reactive you can wrap in $: or stores if needed

	const xScaleOptions = {
		type: 'time',
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

	const data = {
		temp: {
			datasets: [
				{
					label: 'Temperature (°C)',
					data: [],
					borderColor: 'tomato',
					tension: 0.3,
				},
			],
		},
		humidity: {
			datasets: [
				{
					label: 'Humidity (%)',
					data: [],
					borderColor: 'deepskyblue',
					tension: 0.3,
				},
			],
		},
		pressure: {
			datasets: [
				{
					label: 'Pressure (hPa)',
					data: [],
					borderColor: 'mediumseagreen',
					tension: 0.3,
				},
			],
		},
		light: {
			datasets: [
				{
					label: 'Light (lux)',
					data: [],
					borderColor: 'orange',
					tension: 0.3,
				},
			],
		},
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
			},
		},
	}

	onMount(() => {
		// Initialize charts when component is mounted
		charts = {
			temp: new Chart(tempCanvas, config.temp),
			humidity: new Chart(humidCanvas, config.humidity),
			pressure: new Chart(pressCanvas, config.pressure),
			light: new Chart(lightCanvas, config.light),
		}

		getData()
	})

	async function getData() {
		try {
			const response = await fetch(api_url)
			const json = await response.json()

			json.forEach((entry) => {
				const timestamp = entry.unix * 1000
				data.temp.datasets[0].data.push({ x: timestamp, y: entry.temp })
				data.humidity.datasets[0].data.push({ x: timestamp, y: entry.humidity })
				data.pressure.datasets[0].data.push({ x: timestamp, y: entry.pressure })
				data.light.datasets[0].data.push({ x: timestamp, y: entry.light })
			})

			charts.temp.update()
			charts.humidity.update()
			charts.pressure.update()
			charts.light.update()

			currTemp = json.at(-1).temp.toFixed(1)
			currHumid = json.at(-1).humidity.toFixed(1)
			currPres = json.at(-1).pressure.toFixed(1)
			currLight = json.at(-1).light.toFixed(1)
		} catch (error) {
			console.error(error)
		}
	}
</script>

<header>
	<div class="d-flex jc-between ai-center p-4">
		<div class="d-flex ai-center">
			<img src={logoRasPi} alt="Raspberry Pi logo" width="20" class="mr-3" />
			<h1>PiZero Enviro</h1>
		</div>
		<div>27-06-25 22:55</div>
	</div>

	<div class="controls">
		<div class="d-flex">
			<button aria-label="Reload">
				<img src={iconRefresh} alt="Reload icon" />
			</button>

			<div class="dark-toggle">
				<input type="checkbox" id="theme-toggle" hidden />
				<button aria-label="Light / Dark">
					<img src={iconSun} alt="Light icon" />
					<img src={iconMoon} alt="Dark icon" />
				</button>
			</div>
		</div>

		<select>
			<option value="" disabled selected>Select time range</option>
			<option value="">Hour</option>
			<option value="">Day</option>
			<option value="">Week</option>
			<option value="">Month</option>
			<option value="">Year</option>
			<option value="">All</option>
		</select>
	</div>
</header>

<main>
	<section class="charts">
		<div class="chart-container">
			<div class="chart-title">
				<h3>Temperature</h3>
				<div>
					<h3>{currTemp}</h3>
					<span class="font-small">&deg;c</span>
				</div>
			</div>
			<canvas class="chart" bind:this={ tempCanvas }></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Humidity</h3>
				<div>
					<h3>{currHumid}</h3>
					<span class="font-small">%</span>
				</div>
			</div>
			<canvas class="chart" bind:this={ humidCanvas }></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Pressure</h3>
				<div>
					<h3>{currPres}</h3>
					<span class="font-small">hPa</span>
				</div>
			</div>
			<canvas class="chart" bind:this={ pressCanvas }></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Light</h3>
				<div>
					<h3>{currLight}</h3>
					<span class="font-small">lux</span>
				</div>
			</div>
			<canvas class="chart" bind:this={ lightCanvas }></canvas>
		</div>
	</section>
</main>

<footer>
	<div>&copy; {year} Lee Taylor</div>
</footer>
