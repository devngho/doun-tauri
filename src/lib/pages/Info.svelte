<script>
  import { redirect } from "../page";
</script>

<article class="p-8 pt-24 w-screen" id={$$props._page}>
  <div class="flex flex-col justify-center items-center w-screen">
    <h1 class="text-4xl">타종기</h1>
    <span class="text-xl">v1.0.6</span>
  </div>

  <div class="h-4" />
  <h2 class="text-2xl">오픈 소스 라이선스</h2>
  <ul>
    <li>
      <a href="https://github.com/tauri-apps/tauri" target="_blank">tauri</a>
      -
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/apache-2.0")}>Apache-2.0</a
      >,
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/mit")}>MIT License</a>
      Copyright (c) 2017 - Present Tauri Apps Contributors
    </li>
    <li>
      <a href="https://tailwindcss.com" target="_blank">tailwindcss</a>
      -
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/mit")}>MIT License</a>
      Copyright (c) Tailwind Labs, Inc.
    </li>
    <li>
      <a href="https://svelte.dev" target="_blank">Svelte</a> -
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/mit")}>MIT License</a>
      Copyright (c) 2016-23
      <a
        href="https://github.com/sveltejs/svelte/graphs/contributors"
        target="_blank">these people</a
      >
    </li>
    <li>
      <a href="https://github.com/postcss/postcss" target="_blank">PostCSS</a>
      -
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/mit")}>MIT License</a>
      Copyright 2013 Andrey Sitnik {"<andrey@sitnik.ru>"}
    </li>
    <li>
      <a href="https://github.com/microsoft/TypeScript/" target="_blank"
        >TypeScript</a
      >
      -
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/apache-2.0")}>Apache-2.0</a
      >
      Microsoft Corporation
    </li>
    <li>
      <a href="https://github.com/RustAudio/rodio" target="_blank">rodio</a>
      -
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/mit")}>MIT License</a>
      or
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" on:click={() => redirect("/license/apache-2.0")}>Apache-2.0</a
      >
    </li>
  </ul>
  <h2 class="text-2xl mt-4">가이드</h2>
  <p>
    <a
      href="https://exuberant-pleasure-243.notion.site/16faaf74b4ac80e0bd97f63c164069e0"
      >가이드(v2)</a
    >
  </p>
  <p>
    <button
      on:click={() => {
        redirect("/guide");
      }}>기능 설명</button
    >
  </p>
</article>

<style lang="postcss">
  ul {
    list-style: disc;
    margin-left: 1rem;
  }
</style>
