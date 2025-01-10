<script lang="ts">
    import { backStep, nextStep } from "./steps";
    import { settings } from "../../store";
</script>

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">자동 템플릿 찾기를 사용할까요?</h1>
        <p class="text-lg">
            특정 날짜나 초/중/고 학교 시간표, 특정 요일에만 사용하는 하루동안의
            종소리 일정 템플릿을 만들면 알아서 적용해줘요.
        </p>
        <p class="text-lg text-gray-500">설정에서 다시 바꿀 수 있어요</p>
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
                class="text-2xl w-48 mr-8 unselected"
                on:click={() => {
                    $settings.autoSchedule.enabled = false;
                    nextStep();
                }}>사용하지 않기</button
            >
            <button
                class="text-2xl w-48"
                on:click={() => {
                    $settings.autoSchedule.enabled = true;
                    nextStep();
                }}>사용하기</button
            >
        </div>
    </div>
</article>
