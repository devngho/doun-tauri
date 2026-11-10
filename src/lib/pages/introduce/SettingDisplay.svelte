<script lang="ts">
  import type { PageProps } from "../../page";
  import { saveAll, settings } from "../../store";
  import DisplaySetting from "../settings/DisplaySetting.svelte";
  import { hexToRgb, rgbToHex } from "../../color";
  import type { RgbaColor } from "svelte-awesome-color-picker";

  import { backStep, nextStep } from "./steps";
  let props: PageProps = $props();

  // the timer is not state: the effect below must not depend on it
  let defferedColorSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  let isDefferedColorSaveActive = $state(false);

  const p = hexToRgb($settings.primaryColor!);
  let rgb: RgbaColor | undefined = $state({
    r: p[0],
    g: p[1],
    b: p[2],
    a: 1,
  });

  function updateColor(rgb?: RgbaColor) {
    if (!rgb) return;

    const nextColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    if ($settings.primaryColor === nextColor) return;

    settings.update((v) => {
      v.primaryColor = nextColor;
      return v;
    });

    if (defferedColorSaveTimeout !== null)
      clearTimeout(defferedColorSaveTimeout);
    isDefferedColorSaveActive = true;
    defferedColorSaveTimeout = setTimeout(() => {
      saveAll();
      defferedColorSaveTimeout = null;
      isDefferedColorSaveActive = false;
    }, 250);
  }

  $effect(() => {
    updateColor(rgb);
  });
</script>

<svelte:head>
  {#if isDefferedColorSaveActive}
    <style>
  @reference "../../../app.css";
      button {
        transition-duration: 0s !important;
      }
    </style>
  {/if}
</svelte:head>

<article id={props._page}>
  <div class="w-screen h-screen flex flex-col p-8">
    <h1 class="text-5xl flex mb-6">화면을 설정합니다</h1>
    <p class="text-lg">
      지금은 기본 설정이에요. 사용할 색상 테마 등을 선택해주세요.
    </p>
    <p class="text-lg text-gray-500 mb-6">설정에서 다시 바꿀 수 있어요</p>
    <DisplaySetting bind:rgb />
    <div class="flex-grow"></div>
    <div class="flex flex-row">
      <button
        class="text-2xl w-48 mr-8"
        onclick={() => {
          backStep();
        }}>뒤로</button
      >
      <div class="flex-grow"></div>
      <button
        class="text-2xl w-48"
        onclick={() => {
          nextStep();
        }}>설정했어요</button
      >
    </div>
  </div>
</article>
