<script lang="ts">
	import { onMount } from 'svelte'
	import { Chart, type ChartConfiguration } from 'chart.js'
	import { registerChart } from '../stores/data'
	import { IconArrowUp, IconArrowDown } from '../assets/icons/icons'

	export let title: string
	export let unit: string
	export let dataKey: 'temp' | 'humidity' | 'pressure' | 'light'
	export let config: ChartConfiguration
	export let low: string
	export let high: string
	export let current: string

	let canvasEl: HTMLCanvasElement

	onMount(() => {
		const chart = new Chart(canvasEl, config)
		registerChart(dataKey, chart)
	})
</script>

<div class="chart-container">
	<div class="chart-title">
		<h3>{title}</h3>
		<div>
			<div class="high-low">
				<IconArrowDown />
				{low} &mdash; {high}
				<IconArrowUp />
			</div>
			<h3>{current}</h3>
			<span class="font-small">{unit}</span>
		</div>
	</div>
	<canvas class="chart" bind:this={canvasEl}></canvas>
</div>
