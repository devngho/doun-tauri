<script lang="ts">
    import type { Log } from "../logger";

    export let log: Log;
    let length = JSON.stringify(log.data)?.length ?? 0;
    let isLogFolded = length > 100;
</script>

<div>
    {log.message}
    {#if !isLogFolded}
        {JSON.stringify(log.data) ?? ""}
    {:else}
        <button on:click={() => (isLogFolded = false)}>
            {length}자 펼치기
        </button>
    {/if} : {log.time}
</div>

<style>
    div {
        @apply my-1;
    }
    button {
        @apply p-0;
    }
</style>
