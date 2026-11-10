<script lang="ts">
    import type { Log } from "../logger";

    interface Props {
        log: Log;
    }

    let { log }: Props = $props();
    let length = $derived(JSON.stringify(log.data)?.length ?? 0);
    let unfolded = $state(false);
    let isLogFolded = $derived(length > 100 && !unfolded);
</script>

<div>
    {log.message}
    {#if !isLogFolded}
        {JSON.stringify(log.data) ?? ""}
    {:else}
        <button onclick={() => (unfolded = true)}>
            {length}자 펼치기
        </button>
    {/if} : {log.time}
</div>

<style lang="postcss">
  @reference "../../app.css";
    div {
        @apply my-1;
    }
    button {
        @apply p-0;
    }
</style>
