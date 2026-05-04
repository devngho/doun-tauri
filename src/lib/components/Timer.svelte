<script lang="ts">
	import { nextSchedule, now } from "../store";
	import "../../app.css";
	import { Time } from "../daytime";

	interface Props {
		isSlim?: boolean;
	}

	let { isSlim = false }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<time class="m-0 flex justify-center align-middle">
	<div class="text-4xl w-fit h-fit">
		{$now.formatTime()}
		{#if $nextSchedule?.time && !isSlim}
			<span class="w-2"></span>다음 일정까지
			{#if $nextSchedule.time.compare($now) < 60}
				<span class="text-primary">
					{new Time(0, 0, $nextSchedule.time.compare($now))
						.fix()
						.formatTime()}
				</span>
			{:else}
				<span>
					{new Time(0, 0, $nextSchedule.time.compare($now))
						.fix()
						.formatTime()}
				</span>
			{/if}
		{/if}
	</div>
</time>
