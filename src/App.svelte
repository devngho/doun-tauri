<script lang="ts">
  import { onMount as onLoad } from "./lib/onMount";
  import { onMount } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import "./app.css";
  import Header from "./lib/components/Header.svelte";
  import { pages } from "./lib/page.js";
  import { daysOfWeek, settings } from "./lib/store.js";
  import ErrorIndicator from "./lib/components/ErrorIndicator.svelte";
  import { log } from "./lib/logger";
  import { Dates } from "./lib/daytime";
  import { hexToRgb, rgbToHSL } from "./lib/color";
  import SlimIndex from "./lib/pages/SlimIndex.svelte";

  let currentPage = $state("");
  let isAprilFool = $state(false);

  let isIntroducePage = $derived(currentPage.startsWith("introduce"));

  // re-check on every day change
  $effect(() => {
    $daysOfWeek;
    const now = Dates.now();
    isAprilFool = now.compare(new Dates(now.year, 4, 1)) === 0;
  });

  function updatePage() {
    log({ message: `path: ${window.location.pathname}` });
    currentPage =
      Object.keys(pages).findLast((v) =>
        new RegExp(v, "g").test(window.location.pathname.slice(1)),
      ) ?? "";
  }

  $effect(() => {
    log({ message: `current page: ${currentPage}` });
  });

  let isInitFunc: Promise<void> | null = $state(null);
  onMount(() => {
    isInitFunc = onLoad();
    updatePage();
  });

  const slimQuery = new MediaQuery("max-width: 1024px");
  let isSlim = $derived($settings.useSlim && slimQuery.current);

  let cssVar = $derived.by(() => {
    const [h, s, l] = rgbToHSL($settings.primaryColor);
    return `
		--color-primary: ${hexToRgb($settings.primaryColor).join(" ")};
		--color-primary-h: ${h};
		--color-primary-s: ${s}%;
		--color-primary-l: ${l}%;
		--theme: ${$settings.theme};
		`;
  });
</script>

<svelte:window onpopstate={updatePage} />

<div
  class={$settings.theme === "dark" ? " dark" : ""}
  style={cssVar}
  id="app-div"
>
  <main class="min-h-screen overflow-y-auto overflow-x-hidden dark:text-white">
    {#if isAprilFool}
      <div class="fixed bottom-0 right-0">
        <button
          onclick={() => {
            isAprilFool = false;
          }}>만우절 모드 해제하기</button
        >
      </div>
    {/if}

    {#if !isSlim}
      {#if !isIntroducePage}
        <Header />
      {/if}

      <!-- also renders before loading starts, so intro transitions play once data arrives -->
      {#await isInitFunc then}
        {@const Page = pages[currentPage].component}
        <Page _page={currentPage} />
      {/await}
    {:else}
      <SlimIndex {isAprilFool} />
    {/if}

    {#if !isIntroducePage}
      <div class="fixed left-4 bottom-4">
        <ErrorIndicator />
      </div>
    {/if}
  </main>
</div>

<svelte:head>
  {#if isAprilFool}
    <style>
  @reference "app.css";
      .flex-col {
        flex-direction: column-reverse !important;
      }

      .grid {
        direction: rtl !important;
      }

      * {
        text-align: right;
      }
    </style>
  {/if}
</svelte:head>
