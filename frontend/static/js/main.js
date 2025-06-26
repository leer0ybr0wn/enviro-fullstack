const api_url = 'http://ras.pi/enviro/api/v1'
// const api_url = 'https://api.leeroybrown.uk/enviro'
const year = new Date().getFullYear()
document.querySelector('#year').innerText = year

const currTemp = document.querySelector('#curr_temp')
const currHumid = document.querySelector('#curr_humidity')
const currPres = document.querySelector('#curr_pressure')
const currLight = document.querySelector('#curr_light')

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

const xScaleOptions = {
	type: 'time',
	time: {
		unit: 'minute',
		displayFormats: { minute: 'HH:mm' },
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
					min: 0,
					grace: '10%',
				},
			},
		},
	},
}

const charts = {
	temp: new Chart(document.querySelector('#temp_chart'), config.temp),
	humidity: new Chart(document.querySelector('#humidity_chart'), config.humidity),
	pressure: new Chart(document.querySelector('#pressure_chart'), config.pressure),
	light: new Chart(document.querySelector('#light_chart'), config.light),
}

async function getData() {
	try {
		const response = await fetch(api_url + '?limit=1week')
		// const response = await fetch(api_url)
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

		currTemp.innerText = json.at(-1).temp.toFixed(1)
		currHumid.innerText = json.at(-1).humidity.toFixed(1)
		currPres.innerText = json.at(-1).pressure.toFixed(1)
		currLight.innerText = json.at(-1).light.toFixed(1)
	} catch (error) {
		console.log(error)
	}
}

getData()
