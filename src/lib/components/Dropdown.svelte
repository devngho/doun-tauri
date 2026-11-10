<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { getXY } from "../touch";
  import { dropdownContext, type DropdownContext } from "../dropdown";

  let { children }: { children?: Snippet } = $props();

  let isOpen = $state(false);
  let pos = $state([0, 0]);

  // deferred so the click that triggered it finishes first
  const close = () => {
    if (isOpen) setTimeout(() => (isOpen = false));
  };

  setContext<DropdownContext>(dropdownContext, { close });
</script>

<svelte:document onclick={close} oncontextmenu={close} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  onclick={(e) => {
    if (!isOpen) pos = getXY(e);
    setTimeout(() => (isOpen = !isOpen));
    e.preventDefault();
  }}
  aria-haspopup="true"
  role="button"
  tabindex="0"
  class={"dropdown grid fixed gap-2 w-32 transition-opacity bg-gray-300 dark:bg-gray-800 shadow-md rounded-md dropdown-grid " +
    (isOpen ? "p-2 opacity-100" : "opacity-0")}
  style={`left: ${pos[0]}px; top: ${pos[1]}px`}
>
  {#if isOpen}
    {@render children?.()}
  {/if}
</div>

<svelte:head>
  <style lang="postcss">
  @reference "../../app.css";
    .dropdown-grid > button {
      @apply col-span-1 row-span-1 line-clamp-1;
    }
  </style>
</svelte:head>

<style lang="postcss">
  @reference "../../app.css";
  .dropdown-grid {
    @apply grid-cols-1;
  }
</style>
