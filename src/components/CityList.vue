<template>
	<div v-for="city in savedCities" :key="city.id">
		<CityCard :city="city" @click="goToCityView(city)" />
	</div>

	<p v-if="savedCities.length === 0">保存されている都市がありません。</p>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import CityCard from "@/components/CityCard.vue";

const router = useRouter();

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// 保存された都市のリストを保持するためのsavedCitiesリファレンスを作成します。
const savedCities = ref([]);
const getSavedCities = async () => {
	if (localStorage.getItem("savedCities")) {
		savedCities.value = JSON.parse(localStorage.getItem("savedCities"));

		const requests = [];
		savedCities.value.forEach((city) => {
			requests.push(
				axios.get(
					`https://api.openweathermap.org/data/2.5/weather?lat=${city.coords.lat}&lon=${city.coords.lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
				)
			);
		});

		const weatherData = await Promise.all(requests);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		// 保存された都市の天気データを更新します。
		weatherData.forEach((value, index) => {
			savedCities.value[index].weather = value.data;
		});
	}
};

await getSavedCities();

const goToCityView = (city) => {
	router.push({
		name: "cityView",
		params: {
			state: city.state,
			city: city.city,
		},
		query: {
			lat: city.coords.lat,
			lng: city.coords.lng,
			id: city.id,
		},
	});
};
</script>
