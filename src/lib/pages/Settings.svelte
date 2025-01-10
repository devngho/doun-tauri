<script lang="ts">
    import {} from "@tauri-apps/api";
    import {
        saveAll,
        saveState,
        schedules,
        settings,
        volumeMixer,
    } from "../store";
    import { invokeTS } from "../tauri_invoker";
    import { onMount } from "svelte";
    import { currentOS } from "../platform";
    import type { RgbaColor } from "svelte-awesome-color-picker";
    import { hexToRgb, rgbToHex } from "../color";
    import DisplaySetting from "./settings/DisplaySetting.svelte";
    import AudioSettings from "./settings/AudioSettings.svelte";
    import UtilSettings from "./settings/UtilSettings.svelte";
    import AutoScheduleSettings from "./settings/AutoScheduleSettings.svelte";
    import * as dialog from "@tauri-apps/plugin-dialog";

    let superDounCount = 0;
    let delayTimeWithSuffix = "";
    let defferedColorSave: any | null = null;

    $: {
        $settings;
        saveAll();
    }

    $: {
        delayTimeWithSuffix = $settings.delayTime + "초";
    }

    onMount(async () => {
        if (currentOS === "macos")
            $settings.audioOutput = await invokeTS(
                "get_default_audio_output",
                null,
            );
    });

    const p = hexToRgb($settings.primaryColor!);
    let rgb: RgbaColor | undefined = {
        r: p[0],
        g: p[1],
        b: p[2],
        a: 1,
    };

    function updateColor() {
        settings.update((v) => {
            if (!rgb) return v;
            v.primaryColor = rgbToHex(rgb?.r!, rgb?.g!, rgb?.b!);
            return v;
        });
        clearTimeout(defferedColorSave);
        defferedColorSave = setTimeout(() => {
            saveAll();
            defferedColorSave = null;
        }, 250);
    }

    $: {
        rgb;
        updateColor();
    }
</script>

<svelte:head>
    {#if defferedColorSave !== null}
        <style>
            button {
                transition-duration: 0s !important;
            }
        </style>
    {/if}
</svelte:head>

<article class="p-8 pt-24 w-screen" id={$$props._page}>
    <div class="flex flex-col justify-center items-center w-screen">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1
            class="text-4xl"
            on:click={() => {
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

    <div class="h-4" />
    <DisplaySetting bind:rgb />
    <AudioSettings />
    <AutoScheduleSettings />
    <UtilSettings />
</article>
