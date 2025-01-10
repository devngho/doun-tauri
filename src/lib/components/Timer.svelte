<script lang="ts">
	import { nextSchedule, now } from "../store";
	import "../../app.css";
	import { Time } from "../daytime";

	export let isSlim = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<time class="m-0 flex justify-center align-middle">
	<div class="text-4xl w-fit h-fit">
		{$now.formatTime()}
		{#if $nextSchedule?.time && !isSlim}
			<span class="w-2" />다음 일정까지
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
