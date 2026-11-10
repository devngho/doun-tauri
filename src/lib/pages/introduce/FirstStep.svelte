<script lang="ts">
    import type { PageProps } from "../../page";
    import Logo from "../../components/Logo.svelte";

    import { nextStep } from "./steps";
    let props: PageProps = $props();
</script>

<article id={props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-6xl flex">
            타종기를 시작합니다
            <div class="flex-grow"></div>
            <div class="col-span-1 h-0">
                <Logo />
            </div>
        </h1>
        <p class="text-lg mt-6 col-span-6">튜토리얼과 기본 설정을 진행할게요</p>
        <div class="flex-grow"></div>
        <div class="flex flex-row">
            <div class="flex-grow"></div>
            <button class="text-2xl w-48" onclick={() => nextStep()}
                >시작하기</button
            >
        </div>
    </div>
</article>
