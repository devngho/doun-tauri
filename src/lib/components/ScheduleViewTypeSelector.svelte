<script lang="ts">
    interface Props {
        type?: "grouped" | "single";
        showDelay?: boolean;
    }

    let { type = $bindable("grouped"), showDelay = $bindable(false) }: Props = $props();
</script>

<section class="grid gap-4 grid-cols-5 w-screen px-4">
    <button
        onclick={() => setTimeout(() => (type = "grouped"))}
        class={type == "grouped" ? "groups" : "bg-gray-500 groups"}>묶어서 보기</button
    >
    <button
        onclick={() => setTimeout(() => (type = "single"))}
        class={type == "single" ? "groups" : "bg-gray-500 groups"}>풀어서 보기</button
    >
    <button
        onclick={() => showDelay = !showDelay}
        class={showDelay ? "transition-all" : "transition-all unselected"}
    >대기 표시</button>
</section>

<style lang="postcss">
    button.groups {
        @apply transition-all col-span-2;
    }
</style>
