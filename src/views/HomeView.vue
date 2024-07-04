<template>
	<main class="container text-white">
		<div class="pt-4 mb-8 relative">
			<input
				type="text"
				v-model="searchQuery"
				@input="getSearchResults"
				placeholder="都市を選んでください"
				class="py-2 px-1 w-full bg-transparent border-b focus:border-weather-secondary focus:outline-none focus:shadow-[0px_1px_0_0_#004e71]"
			/>
			<ul
				v-if="mapboxSearchResults"
				class="absolute bg-weather-secondary text-white w-full shadow-md py-2 px-1 top-[66px]"
			>
				<p v-if="searchError">
					何かのエラーが発生しました。もう一度検索してください。
				</p>
				<p v-if="!searchError && mapboxSearchResults.length === 0">
					検索した都市がありません。再度検索してください。
				</p>
				<template v-else>
					<li
						v-for="searchResult in mapboxSearchResults"
						:key="searchResult.id"
						class="py-2 cursor-pointer"
						@click="previewCity(searchResult)"
					>
						{{ searchResult.place_name }}
					</li>
				</template>
			</ul>
		</div>
		<div class="flex flex-col gap-4">
			<Suspense>
				<CityList />
				<template #fallback>
					<CityCardSkeleton />
				</template>
			</Suspense>
		</div>
	</main>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import CityList from "@/components/CityList.vue";
import CityCardSkeleton from "@/components/CityCardSkeleton.vue";

const router = useRouter();

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
const searchQuery = ref("");
const queryTimeout = ref(null);
const mapboxSearchResults = ref(null);
const searchError = ref(null);

// searchQueryの変更を監視し、getSearchResults関数を呼び出します。
const getSearchResults = () => {
	if (!searchQuery.value) {
		mapboxSearchResults.value = null;
		return;
	}

	// queryTimeoutをクリアします。
	clearTimeout(queryTimeout.value);

	queryTimeout.value = setTimeout(async () => {
		// searchQuery.valueが空でない場合は、Mapbox APIを使用して検索結果を取得します。
		if (searchQuery.value !== "") {
			try {
				const result = await axios.get(
					`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery.value}.json?access_token=${MAPBOX_API_KEY}&types=place`
				);
				mapboxSearchResults.value = result.data.features;
			} catch {
				// searchQuery.valueが空でない場合は、searchErrorをtrueに設定します。
				searchError.value = true;
			}

			return;
		}

		// searchQuery.valueが空の場合は、mapboxSearchResultsをnullに設定します。
		mapboxSearchResults.value = null;
	}, 300);
};

// searchResultを受け取り、都市のプレビューを表示します。
const previewCity = (searchResult) => {
	if (!searchResult) return;
	const [city, state] = searchResult.place_name.split(", ");

	router.push({
		name: "cityView",
		params: {
			state: state.replaceAll(" ", ""),
			city,
		},
		query: {
			lat: searchResult.geometry.coordinates[1],
			lng: searchResult.geometry.coordinates[0],
			preview: true,
		},
	});
};
</script>
