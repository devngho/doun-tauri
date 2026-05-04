<script lang="ts">
  import { redirect } from "../page";
  import { saveState, remainTime, nextSchedule, saveAll } from "../store";
  import { isDev } from "../dev";
  import { refresh, delayCurrent } from "../play";
  import { onMount } from "svelte";

  let saveStateDelayed: "working" | "error" | "ok" = $state("ok");
  let pagePath = $state(location.pathname);

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

  onMount(() => {
    const destroy = new AbortController();

    // subscribe event listener
    window.addEventListener(
      "popstate",
      () => {
        pagePath = location.pathname;
      },
      { signal: destroy.signal },
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
    onclick={() => {
      redirect("/");
    }}>홈</button
  >
  <button class="tab" onclick={() => redirect("/info")}>정보</button>
  <button
    class="tab"
    onclick={() => {
      redirect("/template");
    }}>템플릿</button
  >
  <button
    class="tab"
    onclick={() => {
      redirect("/volume");
    }}>볼륨</button
  >
  <button
    class="tab"
    onclick={() => {
      redirect("/settings");
    }}>설정</button
  >
  {#if saveStateDelayed === "ok"}
    <button
      onclick={() => {
        saveAll();
      }}>저장하기</button
    >
  {:else}
    <button
      onclick={() => {
        saveAll();
      }}
      class="flex flex-row items-center justify-center"
      disabled
      aria-label="저장 중"
    >
      <div class="loader"></div>
    </button>
  {/if}
  <button
    onclick={() => {
      refresh(true);
    }}>새로고침</button
  >
  <button onclick={delayCurrent}> 미루기 </button>

  <div class="flex-grow"></div>

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
      onclick={() => redirect("/test-rust")}
      class="tab fixed top-0 right-0 w-32 h-8">invoke</button
    >
    <button
      onclick={() => redirect("/log")}
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
  @reference "../../app.css";
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
