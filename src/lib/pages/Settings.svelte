<script lang="ts">
  import type { PageProps } from "../page";
  import {
    saveAll,
    saveState,
    schedules,
    settings,
    volumeMixer,
  } from "../store";
  import { invokeTS } from "../tauri_invoker";
  import { onDestroy, onMount } from "svelte";
  import { currentOS } from "../platform";
  import type { RgbaColor } from "svelte-awesome-color-picker";
  import { hexToRgb, rgbToHex } from "../color";
  import DisplaySetting from "./settings/DisplaySetting.svelte";
  import AudioSettings from "./settings/AudioSettings.svelte";
  import UtilSettings from "./settings/UtilSettings.svelte";
  import AutoScheduleSettings from "./settings/AutoScheduleSettings.svelte";
  import * as dialog from "@tauri-apps/plugin-dialog";
  let props: PageProps = $props();

  let superDounCount = $state(0);
  let delayTimeWithSuffix = $derived($settings.delayTime + "초");
  let defferedColorSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  let isDefferedColorSaveActive = $state(false);

  const settingsSubscription = settings.subscribe(() => saveAll());
  onDestroy(settingsSubscription);

  onMount(async () => {
    if (currentOS === "macos")
      $settings.audioOutput = await invokeTS("get_default_audio_output", null);
  });

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
      @reference "../../app.css";
      button {
        transition-duration: 0s !important;
      }
    </style>
  {/if}
</svelte:head>

<article class="p-8 pt-24 w-screen" id={props._page}>
  <div class="flex flex-col justify-center items-center w-screen">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <h1
      class="text-4xl"
      onclick={() => {
        superDounCount++;
        if (superDounCount >= 5) {
          $settings.superDoun = !$settings.superDoun;
          superDounCount = 0;
        }
      }}
    >
      {$settings.superDoun ? "슈퍼" : ""}설정
    </h1>
  </div>

  <div class="h-4"></div>
  <DisplaySetting bind:rgb />
  <AudioSettings />
  <AutoScheduleSettings />
  <UtilSettings />
</article>
