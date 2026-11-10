<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
        content?: import('svelte').Snippet;
    }

    let { children, content }: Props = $props();
    let style = $state("");

</script>

<svelte:document
    onmousemove={(e) => {
        style = `top: 0; left: 0; margin-left: ${e.clientX}px; margin-top: ${e.clientY}px;`;
    }}
/>

<div class="hover w-full h-full">
    <div class="w-full h-full flex justify-center items-center">
        {@render children?.()}
    </div>
    <div class="hover-content fixed" {style}>
        {@render content?.()}
    </div>
</div>

<style lang="postcss">
  @reference "../../app.css";
    .hover:hover {
        display: block;
    }
    .hover:not(:hover) > .hover-content {
        display: none;
    }
</style>
