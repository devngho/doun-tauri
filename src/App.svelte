<script lang="ts">
  import { onMount as onLoad } from "./lib/onMount";
  import { onMount } from "svelte";
  import "./app.css";
  import Header from "./lib/components/Header.svelte";
  import { pages, redirect } from "./lib/page.js";
  import { daysOfWeek, settings } from "./lib/store.js";
  import ErrorIndicator from "./lib/components/ErrorIndicator.svelte";
  import { log } from "./lib/logger";
  import { Dates, Time } from "./lib/daytime";
  import { hexToRgb, rgbToHSL } from "./lib/color";
  import SlimIndex from "./lib/pages/SlimIndex.svelte";

  let currentPage = "";
  let isAprilFool = false;

  $: isIntroducePage = currentPage.startsWith("introduce");

  daysOfWeek.subscribe((_) => {
    const now = Dates.now();
    if (now.compare(new Dates(now.year, 4, 1)) === 0) {
      isAprilFool = true;
    } else {
      isAprilFool = false;
    }
  });

  function updatePage() {
    log({ message: `path: ${window.location.pathname}` });
    currentPage =
      Object.keys(pages).findLast((v) =>
        new RegExp(v, "g").test(window.location.pathname.slice(1))
      ) ?? "";
  }

  $: log({ message: `current page: ${currentPage}` });

  window.addEventListener("popstate", updatePage);

  let isInitFunc: Promise<void> | null = null;
  onMount(() => {
    isInitFunc = onLoad();
    updatePage();
  });

  let isSlimQuery = window.matchMedia("(max-width: 1024px)");
  let isSlim = isSlimQuery.matches;
  isSlimQuery.addEventListener(
    "change",
    (e) => (isSlim = $settings.useSlim ? e.matches : false)
  );

  let cssVar = `
	--color-primary: ${hexToRgb($settings.primaryColor).join(" ")};
	--color-primary-h: ${rgbToHSL($settings.primaryColor)[0]};
	--color-primary-s: ${rgbToHSL($settings.primaryColor)[1]}%;
	--color-primary-l: ${rgbToHSL($settings.primaryColor)[2]}%;
	--theme: ${$settings.theme};
	`;

  settings.subscribe((v) => {
    cssVar = `
		--color-primary: ${hexToRgb(v.primaryColor).join(" ")};
		--color-primary-h: ${rgbToHSL(v.primaryColor)[0]};
		--color-primary-s: ${rgbToHSL(v.primaryColor)[1]}%;
		--color-primary-l: ${rgbToHSL(v.primaryColor)[2]}%;
		--theme: ${v.theme};
		`;
  });
</script>

<div
  class={$settings.theme === "dark" ? " dark" : ""}
  style={cssVar}
  id="app-div"
>
  <main class="min-h-screen overflow-y-auto overflow-x-hidden dark:text-white">
    {#if isAprilFool}
      <div class="fixed bottom-0 right-0">
        <button
          on:click={() => {
            isAprilFool = false;
          }}>만우절 모드 해제하기</button
        >
      </div>
    {/if}

    {#if !isSlim}
      {#if !isIntroducePage}
        <Header />
      {/if}

      {#await isInitFunc then}
        <svelte:component
          this={pages[currentPage].component}
          _page={currentPage}
        />
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
