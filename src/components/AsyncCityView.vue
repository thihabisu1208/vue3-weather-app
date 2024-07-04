<template>
	<div class="flex flex-col flex-1 items-center">
		<!-- バナー -->
		<div
			v-if="route.query.preview"
			class="text-white p-4 bg-weather-secondary w-full text-center"
		>
			<p>"+" アイコンをクリックしてホームに追加してください。</p>
		</div>
		<!-- 天気予報 -->
		<div class="flex flex-col items-center text-white py-12">
			<h1 class="text-4xl mb-2">{{ route.params.city }}</h1>
			<p class="text-sm mb-12">
				{{
					new Date(weatherData.currentTime).toLocaleString("ja-JP", {
						weekday: "short",
						day: "2-digit",
						month: "long",
					})
				}}
				{{
					new Date(weatherData.currentTime).toLocaleString("ja-JP", {
						timeStyle: "short",
					})
				}}
			</p>
			<p class="text-8xl mb-8">
				{{ Math.round((weatherData.current.temp - 32) * (5 / 9)) }}&deg;C
			</p>
			<div class="text-center">
				<p>
					{{
						Math.round((weatherData.current.feels_like - 32) * (5 / 9))
					}}&deg;C に感じる
				</p>
				<p>{{ weatherData.current.weather[0].description }}</p>
				<img
					class="w-[150px] h-auto"
					:src="`https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`"
					alt=""
				/>
			</div>
		</div>

		<hr class="border-white border-opacity-10 border w-full" />

		<!-- 時間単位の天気 -->
		<div class="max-w-screen-md w-full py-12">
			<div class="mx-8 text-white">
				<h2 class="text-2xl mb-4">時間ごとの天気</h2>
				<div class="flex gap-10 overflow-x-scroll">
					<div
						v-for="hourData in weatherData.hourly"
						:key="hourData.dt"
						class="flex flex-col gap-4 items-center"
					>
						<p class="whitespace-nowrap text-md">
							{{
								new Date(hourData.currentTime).toLocaleString("ja-JP", {
									hour: "numeric",
								})
							}}
						</p>
						<img
							class="w-auto h-[50px] object-cover"
							:src="`https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`"
							alt=""
						/>
						<p class="text-xl">
							{{ Math.round((hourData.temp - 32) * (5 / 9)) }}&deg;C
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- 週ごとの天気 -->
		<div class="max-w-screen-md w-full py-12">
			<div class="mx-8 text-white">
				<h2 class="text-2xl mb-4">7日間の天気予報</h2>
				<div
					v-for="day in weatherData.daily"
					:key="day.dt"
					class="flex items-center"
				>
					<p class="flex-1">
						{{
							new Date(day.dt * 1000).toLocaleString("ja-JP", {
								weekday: "long",
							})
						}}
					</p>
					<img
						class="w-[50px] h-[50px] object-cover"
						:src="`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`"
						alt=""
					/>
					<div class="flex gap-2 flex-1 justify-end">
						<p>
							最高気温：{{ Math.round((day.temp.max - 32) * (5 / 9)) }}&deg;C
						</p>
						<p>
							最低気温：{{ Math.round((day.temp.min - 32) * (5 / 9)) }}&deg;C
						</p>
					</div>
				</div>
			</div>
		</div>

		<div
			v-if="isCitySaved"
			class="flex items-center gap-2 py-12 text-white cursor-pointer duration-150 hover:text-red-500"
			@click="removeCity"
		>
			<i class="fa-solid fa-trash"></i>
			<p>この都市を削除する</p>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const OPENWEATHER_API_KEY = "d006ed7c26f68c01a847fd6b6295f92d";

// OpenWeatherMap APIを使用して天気データを取得します。
const getWeatherData = async () => {
	let weatherData = null;

	try {
		weatherData = await axios.get(
			`https://api.openweathermap.org/data/3.0/onecall?lat=${route.query.lat}&lon=${route.query.lng}&exclude=minutely&appid=${OPENWEATHER_API_KEY}&units=imperial&timezone=Asia/Tokyo`
		);

		// 天気データのタイムスタンプをローカルタイムに変換します。
		weatherData.data.currentTime = weatherData.data.current.dt * 1000;

		// 毎時の天気データのタイムスタンプをローカルタイムに変換します。
		weatherData.data.hourly.forEach((hour) => {
			hour.currentTime = hour.dt * 1000;
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return weatherData.data;
	} catch (error) {
		console.error(error);
	}
};

// 天気データを取得します。
const weatherData = await getWeatherData();

// この都市が保存されているかどうかを確認します。
const isCitySaved = computed(() => {
	const savedCitiesString = localStorage.getItem("savedCities");
	if (!savedCitiesString) return false;

	const savedCities = JSON.parse(savedCitiesString);

	// 現在の都市のキーとしてlat, lngを取得します。
	const currentCityKey = `${route.query.id}`;
	return savedCities.some((city) => city.id === currentCityKey);
});

// 保存された都市を削除します。
const removeCity = () => {
	const savedCities = JSON.parse(localStorage.getItem("savedCities"));
	const updatedCities = savedCities.filter(
		(city) => city.id !== route.query.id
	);
	localStorage.setItem("savedCities", JSON.stringify(updatedCities));
	router.push({ name: "home" });
};
</script>
