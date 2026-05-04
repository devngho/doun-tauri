<script lang="ts">
  import { logs } from "../logger";
  import Log from "../components/Log.svelte";
  import { onDestroy } from "svelte";
  interface Props {
    [key: string]: any;
  }

  let { ...props }: Props = $props();

  let filter = $state("");
  let filteredLogs = $state($logs);
  let autoScroll = $state(true);

  function update(logs: any[], filter: string) {
    console.log("Your filter is:" + filter);
    filteredLogs = logs.filter(
      (v) =>
        v.message?.includes(filter) === true ||
        JSON.stringify(v.data)?.includes(filter) === true,
    );
  }

  $effect(() => {
    update($logs, filter);
  });

  const unsubscribe = logs.subscribe(() => {
    if (autoScroll) {
      window.scroll({
        behavior: "smooth",
        top: document.body.scrollHeight,
      });
    }
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<article class="p-8 pt-24" id={props._page}>
  <input
    type="text"
    bind:value={filter}
    class="w-full p-2 rounded-md dark:bg-gray-700"
  />
  {#each filteredLogs as log, idx ((log.time ?? "notime") + (log.message ?? "nomsg") + (JSON.stringify(log.data) ?? "nodata") + idx)}
    <Log {log} />
  {/each}
  <input
    type="checkbox"
    bind:checked={autoScroll}
    class="fixed right-4 bottom-16 w-8 h-8"
  />
</article>
