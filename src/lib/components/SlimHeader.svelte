<script lang="ts">
  import "../../app.css";
  import { saveState, saveAll } from "../store";
  import { delayCurrent, refresh } from "../play";
  import { fadeSlide } from "../transition";
  let saveStateDelayed: "working" | "error" | "ok" = $state("ok");

  $effect(() => {
    if ($saveState === "working") {
      saveStateDelayed = "working";
    } else if ($saveState === "error") {
      saveStateDelayed = "error";
    } else {
      const timeout = setTimeout(() => {
        saveStateDelayed = "ok";
      }, 1000);

      return () => clearTimeout(timeout);
    }
  });

  interface Props {
    folded?: boolean;
  }

  let { folded = $bindable(false) }: Props = $props();
</script>

<div class={folded ? "col-span-1" : "col-span-2"}>
  <header
    class="h-24 rounded-md flex flex-row bg-gray-300 dark:bg-gray-800 p-4 shadow-md z-10 transition-colors duration-500"
  >
    {#if !folded}
      <button class="w-24" in:fadeSlide onclick={delayCurrent}>미루기</button>
    {/if}
    <div class="flex-grow"></div>
    <button class="fold w-16" onclick={() => (folded = !folded)}>
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
