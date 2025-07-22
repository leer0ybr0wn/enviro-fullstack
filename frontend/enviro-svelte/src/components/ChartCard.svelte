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
				{low} &ndash; {high}
				<IconArrowUp />
			</div>
			<h3>{current}</h3>
			<span class="font-small">{unit}</span>
		</div>
	</div>
	<canvas class="chart" bind:this={canvasEl}></canvas>
</div>

<style>
	.chart {
		max-height: calc(100vh - 2rem);
		width: 100%;
		height: 20rem;
	}

	.chart-title {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.chart-title > div {
		display: flex;
		align-items: baseline;
	}

	.chart-title .font-small {
		opacity: 0.75;
		margin-left: 0.25rem;
	}

	.high-low {
		display: flex;
		align-items: center;
		font-size: 14px;
		opacity: 0.8;
		padding: 3px 1px 2px 1px;
		border-radius: 4px;
		border: solid 1px var(--black25);
		margin-right: 0.75rem;
	}

	:global(.dark .high-low) {
		border-color: var(--white20);
	}
</style>
