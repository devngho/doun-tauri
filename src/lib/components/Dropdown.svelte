<script lang="ts">
    import { onMount, onDestroy, setContext } from "svelte";
    import { getXY } from "../touch";
    import { fade } from "svelte/transition";
    import { dropdownContext } from "../dropdown";
    let isOpen = false;
    let button: HTMLElement;
    let pos: number[] = [0, 0];

    const close = (e: MouseEvent | undefined) => {
        if (e?.target !== button && isOpen) {
            console.log("close");
            setImmediate(() => {
                isOpen = false;
            });
        }
    };

    onMount(() => {
        document.addEventListener("click", close);
        document.addEventListener("contextmenu", close);
    });

    onDestroy(() => {
        document.removeEventListener("click", close);
        document.addEventListener("contextmenu", close);
    });

    setContext(dropdownContext, { close });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore missing-declaration -->
<div
    on:click={(e) => {
        if (!isOpen) [pos[0], pos[1]] = getXY(e);
        setImmediate(() => {
            isOpen = !isOpen;
        });
        e.preventDefault();
    }}
    class={"dropdown grid fixed gap-2 w-32 transition-opacity bg-gray-300 dark:bg-gray-800 shadow-md rounded-md dropdown-grid " +
        (isOpen ? "p-2 opacity-1" : "opacity-0")}
    style={`left: ${pos[0]}px; top: ${pos[1]}px`}
>
    {#if isOpen}
        <slot />
    {/if}
</div>

<svelte:head>
    <style lang="postcss">
        .dropdown-grid > button {
            @apply col-span-1 row-span-1 line-clamp-1;
        }
    </style>
</svelte:head>

<style lang="postcss">
    .dropdown-grid {
        @apply grid-cols-1;
    }
</style>
