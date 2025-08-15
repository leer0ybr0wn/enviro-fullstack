<script lang="ts">
	import { onMount } from 'svelte'
	import { Chart, type ChartConfiguration } from 'chart.js'
	import { registerChart } from '../stores/data'
	import { IconArrowUp, IconArrowDown, IconSpinner, IconChevronDown } from '../assets/icons/icons'

	export let title: string
	export let unit: string
	export let dataKey: 'temp' | 'humidity' | 'pressure' | 'light'
	export let config: ChartConfiguration
	export let low: string
	export let high: string
	export let current: string
	export let loading: boolean = false
	export let initExpanded: boolean

	let expanded = initExpanded
	let canvasEl: HTMLCanvasElement

	onMount(() => {
		const chart = new Chart(canvasEl, config)
		registerChart(dataKey, chart)
	})
</script>

<div class="chart-container {expanded ? 'expanded' : ''}">
	<button class="chart-title" on:click={() => (expanded = !expanded)}>
		<h3>{title}</h3>
		<div>
			<div class="high-low">
				<IconArrowDown />
				{low} &ndash; {high}
				<IconArrowUp />
			</div>
			<div class="current">
				<h3>{current}</h3>
				<span class="font-small">{unit}</span>
			</div>

			<IconChevronDown class="chevron" />
		</div>
	</button>

	<div class="canvas-container {loading ? 'loading' : ''}">
		<canvas class="chart" bind:this={canvasEl}></canvas>
		{#if loading}
			<div class="chart-loader">
				<IconSpinner class="spin" />
			</div>
		{/if}
	</div>
</div>

<style>
	.canvas-container {
		height: auto;
		overflow: hidden;
		margin-top: 1rem;
		position: relative;
	}

	.chart-container:not(.expanded) .canvas-container {
		height: 0;
		margin-top: 0;
	}

	.chart-loader {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.chart-loader :global(.spin) {
		width: 4rem;
		color: #22aaee;
	}

	.chart {
		max-height: calc(100vh - 2rem);
		width: 100%;
		height: 20rem;
	}

	.loading .chart {
		opacity: 0.25;
	}

	.chart-title {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0;
	}

	.chart-title:hover {
		color: unset;
		border-color: transparent;
	}

	.chart-title > div {
		display: flex;
		align-items: center;
	}

	:global(.chevron) {
		rotate: 0deg;
		transition: rotate 0.2s ease-in-out;
		width: 1.25rem;
		opacity: 0.5;
	}

	.expanded :global(.chevron) {
		rotate: 180deg;
	}

	.chart-title .font-small {
		opacity: 0.75;
		margin-left: 0.25rem;
	}

	.current {
		display: flex;
		align-items: baseline;
		margin-inline: 1rem;
	}

	.high-low {
		display: flex;
		align-items: center;
		font-size: 14px;
		letter-spacing: -0.25px;
		opacity: 0.8;
		padding: 3px 0 2px 0;
		border-radius: 4px;
		border: solid 1px var(--black25);
	}

	:global(.dark .high-low) {
		border-color: var(--white20);
	}
</style>
