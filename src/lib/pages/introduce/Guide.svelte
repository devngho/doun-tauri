<script lang="ts">
    import { backStep, nextStep } from "./steps";
</script>

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">가이드를 참고할 수 있어요</h1>
        <p class="text-lg">
            정확한 기능이나 사용법을 알고 싶다면 나중에 가이드를 참고하세요.
        </p>
        <p class="text-lg text-gray-500">'정보' 탭에서 볼 수 있어요</p>
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
                }}>확인했어요</button
            >
        </div>
    </div>
</article>
