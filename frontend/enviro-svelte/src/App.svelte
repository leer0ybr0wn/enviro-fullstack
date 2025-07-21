<script lang="ts">
	import { onMount } from 'svelte'
	import { mainStore, getData, toggleTheme } from './stores/data'
	import LogoRasPi from '/raspi_logo.svg'
	import ChartCard from './components/ChartCard.svelte'
	import { IconRefresh, IconSpinner, IconSun, IconMoon } from './assets/icons/icons'

	const chartItems = [
		{
			key: 'temp',
			title: 'Temperature',
			unit: '°c',
		},
		{
			key: 'humidity',
			title: 'Humidity',
			unit: '%',
		},
		{
			key: 'pressure',
			title: 'Pressure',
			unit: 'hPa',
		},
		{
			key: 'light',
			title: 'Light',
			unit: 'lux',
		},
	] as const

	onMount(() => {
		getData()
	})
</script>

<header class="shadow">
	<div class="d-flex jc-between ai-center px-4 py-5">
		<a href="." class="d-flex ai-center">
			<img src={LogoRasPi} alt="Raspberry Pi logo" width="18" class="mr-3" />
			<h1>PiZero Enviro</h1>
		</a>
		<div class="d-flex ai-center">
			<div class="header-date mr-3">{$mainStore.displayVals.lastReading.date}</div>
			<div class="font-700">{$mainStore.displayVals.lastReading.time}</div>
		</div>
	</div>

	<div class="controls">
		<div class="d-flex">
			<button aria-label="Reload" on:click={() => getData($mainStore.timeRange)} disabled={$mainStore.loading}>
				{#if !$mainStore.loading}
					<IconRefresh />
				{:else}
					<IconSpinner class="spin" />
				{/if}
			</button>

			<div class="dark-toggle">
				<input type="checkbox" id="theme-toggle" hidden />
				<button aria-label="Light / Dark" on:click={toggleTheme}>
					{#if $mainStore.darkMode}
						<IconMoon />
					{:else}
						<IconSun />
					{/if}
				</button>
			</div>
		</div>

		<select name="time-range" bind:value={$mainStore.timeRange} on:change={() => getData($mainStore.timeRange)}>
			<option value="" disabled>Time range</option>
			{#each $mainStore.timeRanges as [value, label]}
				<option {value}>{label}</option>
			{/each}
		</select>
	</div>
</header>

<main>
	<section class="charts {$mainStore.loading ? 'loading' : ''}">
		{#each chartItems as { key, title, unit }}
			<ChartCard
				{title}
				{unit}
				config={$mainStore.config[key]}
				low={$mainStore.displayVals[key].low}
				high={$mainStore.displayVals[key].high}
				current={$mainStore.displayVals[key].current}
				dataKey={key}
			/>
		{/each}
	</section>
</main>

<footer>
	<div>&copy; {$mainStore.year} Lee Taylor</div>
</footer>
