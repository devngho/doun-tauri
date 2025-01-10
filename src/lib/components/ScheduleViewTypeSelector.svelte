<script lang="ts">
    export let type: "grouped" | "single" = "grouped";
    export let showDelay = false;
</script>

<section class="grid gap-4 grid-cols-5 w-screen px-4">
    <button
        on:click={() => setTimeout(() => (type = "grouped"))}
        class={type == "grouped" ? "groups" : "bg-gray-500 groups"}>묶어서 보기</button
    >
    <button
        on:click={() => setTimeout(() => (type = "single"))}
        class={type == "single" ? "groups" : "bg-gray-500 groups"}>풀어서 보기</button
    >
    <button
        on:click={() => showDelay = !showDelay}
        class={showDelay ? "transition-all" : "transition-all unselected"}
    >대기 표시</button>
</section>

<style lang="postcss">
    button.groups {
        @apply transition-all col-span-2;
    }
</style>
