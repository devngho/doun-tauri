<script lang="ts">
    import { onMount } from "svelte";
    import { saveAll, settings } from "../../store";
    import { backStep, nextStep } from "./steps";
    import AudioSettings from "../settings/AudioSettings.svelte";
    import { currentOS } from "../../platform";

    onMount(() => {
        if (currentOS === "macos") nextStep();
    });
</script>

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">오디오를 설정합니다</h1>
        <p class="text-lg">
            지금은 기본 오디오 출력 장치로 설정됐어요. 사용할 오디오 장치를
            선택해주세요.
        </p>
        <p class="text-lg text-gray-500 mb-6">설정에서 다시 바꿀 수 있어요</p>
        <AudioSettings />
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
