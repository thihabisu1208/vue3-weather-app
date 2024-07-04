<template>
	<header class="sticky top-0 bg-weather-primary shadow-lg">
		<nav
			class="container flex flex-col sm:flex-row items-center gap-4 text-white py-6"
		>
			<RouterLink :to="{ name: 'home' }">
				<div class="flex items-center gap-3 flex-1">
					<i class="fa-solid fa-sun text-2xl"></i>
					<p class="text-2xl">天気予報</p>
				</div>
			</RouterLink>

			<div class="flex gap-3 flex-1 justify-end">
				<i
					@click="toggleModal"
					class="fa-solid fa-circle-info text-xl hover:text-weather-secondary duration-150 cursor-pointer"
				></i>
				<i
					class="fa-solid fa-plus text-xl hover:text-weather-secondary duration-150 cursor-pointer"
					@click="addCity"
					v-if="route.query.preview"
				></i>
			</div>

			<BaseModal :modalActive="modalActive" @close-modal="toggleModal">
				<div class="text-black">
					<h1 class="text-2xl mb-1">このアプリについて</h1>
					<p class="mb-4">
						このアプリでは、OpenWeatherMap
						APIを使用して天気予報を取得します。選択した都市の天気予報を表示することができます。
					</p>
					<h2 class="text-2xl">使い方</h2>
					<ol class="list-decimal list-inside mb-4">
						<li>検索エリアに都市の名前を入力します。</li>
						<li>都市名をクリックすると、その都市の天気予報が表示されます。</li>
						<li>
							"+"
							アイコンをクリックするとその都市の天気予報がホームで表示できるようになります。
						</li>
					</ol>
					<h2 class="text-2xl">追加した都市を削除する</h2>
					<p>
						ホームページで削除したい都市を選択し、詳細ページの削除ボタンをクリックしてください。
					</p>
				</div>
			</BaseModal>
		</nav>
	</header>
</template>

<script setup>
import { ref } from "vue";
import { uid } from "uid";
import { RouterLink, useRoute, useRouter } from "vue-router";
import BaseModal from "@/components/BaseModal.vue";

// モーダルの表示状態を管理します。
const modalActive = ref(null);
const toggleModal = () => {
	modalActive.value = !modalActive.value;
};

// ホームページに都市を追加します。
const savedCities = ref([]);
const route = useRoute();
const router = useRouter();
const addCity = () => {
	if (localStorage.getItem("savedCities")) {
		savedCities.value = JSON.parse(localStorage.getItem("savedCities"));
	}

	const locationObj = {
		id: uid(),
		state: route.params.state,
		city: route.params.city,
		coords: {
			lat: route.query.lat,
			lng: route.query.lng,
		},
	};

	savedCities.value.push(locationObj);
	localStorage.setItem("savedCities", JSON.stringify(savedCities.value));

	let query = Object.assign({}, route.query);
	delete query.preview;
	query.id = locationObj.id;

	router.replace({
		query,
	});
};
</script>
