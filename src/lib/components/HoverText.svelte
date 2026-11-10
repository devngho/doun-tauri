<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    let style = $state("");

</script>

<svelte:document
    onmousemove={(e) => {
        style = `top: 0; left: 0; margin-left: ${e.clientX}px; margin-top: ${e.clientY}px;`;
    }}
/>

<div class="hover w-4">
    <span class="hover-icon">🛈</span>
    <div class="hover-content fixed" {style}>
        {@render children?.()}
    </div>
</div>

<style lang="postcss">
  @reference "../../app.css";
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
