

<header>
	<div class="d-flex jc-between ai-center p-4">
		<div class="d-flex ai-center">
			<img src={ logoRasPi } alt="Raspberry Pi logo" width="20" class="mr-3" />
			<h1>PiZero Enviro</h1>
		</div>
		<div>27-06-25 22:55</div>
	</div>

	<div class="controls">
		<div class="d-flex">
			<button aria-label="Reload">
				<img src={ iconRefresh } alt="Reload icon" />
			</button>

			<div class="dark-toggle">
				<input type="checkbox" id="theme-toggle" hidden />
				<button aria-label="Light / Dark">
					<img src={ iconSun } alt="Light icon" />
					<img src={ iconMoon } alt="Dark icon" />
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
					<h3 id="curr_temp">-</h3>
					<span class="font-small">&deg;c</span>
				</div>
			</div>
			<canvas class="chart" id="temp_chart"></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Humidity</h3>
				<div>
					<h3 id="curr_humidity">-</h3>
					<span class="font-small">%</span>
				</div>
			</div>
			<canvas class="chart" id="humidity_chart"></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Pressure</h3>
				<div>
					<h3 id="curr_pressure">-</h3>
					<span class="font-small">hPa</span>
				</div>
			</div>
			<canvas class="chart" id="pressure_chart"></canvas>
		</div>

		<div class="chart-container">
			<div class="chart-title">
				<h3>Light</h3>
				<div>
					<h3 id="curr_light">-</h3>
					<span class="font-small">lux</span>
				</div>
			</div>
			<canvas class="chart" id="light_chart"></canvas>
		</div>
	</section>
</main>

<footer>
	<div>&copy; <span id="year"></span> Lee Taylor</div>
</footer>


<script lang="ts">
import logoRasPi from '/raspi_logo.svg'
import iconRefresh from './assets/icon-refresh.svg'
import iconSun from './assets/icon-sun.svg'
import iconMoon from './assets/icon-moon.svg'
//   import Counter from './lib/Counter.svelte'
</script>