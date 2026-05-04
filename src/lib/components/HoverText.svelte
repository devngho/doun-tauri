<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    let style = $state("");

    document.addEventListener("mousemove", (e) => {
        style = `top: 0; left: 0; margin-left: ${e.clientX}px; margin-top: ${e.clientY}px;`;
    });
</script>

<div class="hover w-4">
    <span class="hover-icon">🛈</span>
    <div class="hover-content fixed" {style}>
        {@render children?.()}
    </div>
</div>

<style lang="postcss">
    .hover:hover {
        display: block;
    }
    .hover:hover > .hover-icon {
        display: block;
    }
    .hover:not(:hover) > .hover-content {
        display: none;
    }
</style>
