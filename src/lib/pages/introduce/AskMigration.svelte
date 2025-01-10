<script lang="ts">
    import { redirect } from "../../page";
    import { backStep, nextStep } from "./steps";
</script>

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">백업 파일에서 불러올까요?</h1>
        <p class="text-lg">
            백업 파일에서 불러오면 기존에 설정한 알림이나 템플릿을 그대로 사용할
            수 있어요.
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
                    redirect("migrate");
                }}>가져오기</button
            >

            <button
                class="text-2xl w-48"
                on:click={() => {
                    nextStep();
                }}>새로 시작하기</button
            >
        </div>
    </div>
</article>
