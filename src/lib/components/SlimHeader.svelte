<script lang="ts">
	import "../../app.css";
	import { saveState, saveAll } from "../store";
	import { delayCurrent, refresh } from "../play";
	import { fadeSlide } from "../transition";
	let saveStateDelayed: "working" | "error" | "ok" = "ok";

	$: {
		$saveState;
		if ($saveState !== "ok") {
			saveStateDelayed = $saveState;
			let k = setInterval(() => {
				if ($saveState === "ok") {
					saveStateDelayed = "ok";
					clearInterval(k);
				}
			}, 1000);
		}
	}

	export let folded = false;
</script>

<div class={folded ? "col-span-1" : "col-span-2"}>
	<header
		class="h-24 rounded-md flex flex-row bg-gray-300 dark:bg-gray-800 p-4 shadow-md z-10 transition-colors duration-500"
	>
		{#if !folded}
			<button class="w-24" in:fadeSlide on:click={delayCurrent}
				>미루기</button
			>
		{/if}
		<div class="flex-grow" />
		<button class="fold w-16" on:click={() => (folded = !folded)}>
			{#if folded}
				{"<"}
			{:else}
				{">"}
			{/if}
		</button>
	</header>
</div>

<style lang="postcss">
	button:not(.fold) {
		@apply mr-2 p-1;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(720deg);
		}
	}
</style>
