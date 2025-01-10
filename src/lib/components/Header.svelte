<script lang="ts">
  import "../../app.css";
  import { redirect } from "../page";
  import { saveState, remainTime, nextSchedule, saveAll } from "../store";
  import { isDev } from "../dev";
  import { refresh, delayCurrent } from "../play";
  import { onMount } from "svelte";

  let saveStateDelayed: "working" | "error" | "ok" = "ok";
  let pagePath = "";

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

  $: pagePath = location.pathname;

  onMount(() => {
    const destroy = new AbortController();

    // subscribe event listener
    window.addEventListener(
      "popstate",
      () => {
        pagePath = location.pathname;
      },
      { signal: destroy.signal }
    );

    // cleanup
    return () => {
      destroy.abort();
    };
  });
</script>

<header
  class="fixed top-0 w-screen grid grid-cols-24 bg-gray-100 dark:bg-gray-800 h-16 shadow-md z-10 transition-colors duration-500 !gap-0.5"
>
  <button
    class="tab"
    on:click={() => {
      redirect("/");
    }}>홈</button
  >
  <button class="tab" on:click={() => redirect("/info")}>정보</button>
  <button
    class="tab"
    on:click={() => {
      redirect("/template");
    }}>템플릿</button
  >
  <button
    class="tab"
    on:click={() => {
      redirect("/volume");
    }}>볼륨</button
  >
  <button
    class="tab"
    on:click={() => {
      redirect("/settings");
    }}>설정</button
  >
  {#if saveStateDelayed === "ok"}
    <button
      on:click={() => {
        saveAll();
      }}>저장하기</button
    >
  {:else}
    <button
      on:click={() => {
        saveAll();
      }}
      class="flex flex-row items-center justify-center"
      disabled
    >
      <div class="loader" />
    </button>
  {/if}
  <button
    on:click={() => {
      refresh(true);
    }}>새로고침</button
  >
  <button on:click={delayCurrent}> 미루기 </button>

  <div class="flex-grow" />

  {#if $nextSchedule}
    <div class="flex flex-col items-center justify-center mr-4 col-span-3">
      <h2 class="text-lg line-clamp-1">
        다음 일정:{$nextSchedule?.name}({$nextSchedule?.time?.formatTime()})
      </h2>
    </div>
    <div class="flex flex-col items-center justify-center mr-4 col-span-3">
      <h2 class="text-lg line-clamp-1">
        남은 시간 {$remainTime.formatTime()}
      </h2>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center mr-4 col-span-7">
      <h2 class="text-lg">다음 일정 없음</h2>
    </div>
  {/if}

  {#if $isDev}
    <button
      on:click={() => redirect("/test-rust")}
      class="tab fixed top-0 right-0 w-32 h-8">invoke</button
    >
    <button
      on:click={() => redirect("/log")}
      class="tab fixed top-8 right-0 w-32 h-8">로그</button
    >
    <div
      class="fixed top-16 right-0 w-32 h-8 bg-dark-900 text-white text-center"
    >
      path: {pagePath}
    </div>
  {/if}
</header>

<style lang="postcss">
  .loader {
    @apply h-6 w-6 border-t-primary border-gray-100 rounded-full;
    border-width: 4px;
    animation: spin 1s ease-out;
  }

  button {
    @apply col-span-2 break-keep flex align-middle justify-center shadow-none rounded-none items-center;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(720deg);
    }
  }
  .grid-cols-24 {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    gap: 4px;
  }
</style>
