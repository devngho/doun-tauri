<script lang="ts">
    import { onMount } from "svelte";
    import { saveAll, settings } from "../../store";
    import AutoScheduleSettings from "../settings/AutoScheduleSettings.svelte";

    import { backStep, nextStep } from "./steps";
    onMount(() => {
        if ($settings.autoSchedule.enabled === false) nextStep();
    });

    $: {
        $settings;
        saveAll();
    }
</script>

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">자동 템플릿 찾기를 설정합니다</h1>
        <p class="text-lg">
            초/중/고 학교 시간표를 알아서 나이스에서 가져오려면 설정이 필요해요.
        </p>
        <p class="text-lg text-gray-500 mb-6">설정에서 다시 바꿀 수 있어요</p>
        <AutoScheduleSettings />
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
