<script lang="ts">
    import { saveAll, settings } from "../../store";
    import DisplaySetting from "../settings/DisplaySetting.svelte";
    import { hexToRgb, rgbToHex } from "../../color";
    import type { RgbaColor } from "svelte-awesome-color-picker";

    import { backStep, nextStep } from "./steps";

    let defferedColorSave: any | null = null;

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

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">화면을 설정합니다</h1>
        <p class="text-lg">
            지금은 기본 설정이에요. 사용할 색상 테마 등을 선택해주세요.
        </p>
        <p class="text-lg text-gray-500 mb-6">설정에서 다시 바꿀 수 있어요</p>
        <DisplaySetting bind:rgb />
        <div class="flex-grow" />
        <div class="flex flex-row">
            <button
                class="text-2xl w-48 mr-8"
                on:click={() => {
                    backStep();
                }}>뒤로</button
            >
            <div class="flex-grow" />
            <button
                class="text-2xl w-48"
                on:click={() => {
                    nextStep();
                }}>설정했어요</button
            >
        </div>
    </div>
</article>
