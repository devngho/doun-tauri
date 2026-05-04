<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
        content?: import('svelte').Snippet;
    }

    let { children, content }: Props = $props();
    let style = $state("");

    document.addEventListener("mousemove", (e) => {
        style = `top: 0; left: 0; margin-left: ${e.clientX}px; margin-top: ${e.clientY}px;`;
    });
</script>

<div class="hover w-full h-full">
    <div class="w-full h-full flex justify-center items-center">
        {@render children?.()}
    </div>
    <div class="hover-content fixed" {style}>
        {@render content?.()}
    </div>
</div>

<style lang="postcss">
    .hover:hover {
        display: block;
    }
    .hover:not(:hover) > .hover-content {
        display: none;
    }
</style>
