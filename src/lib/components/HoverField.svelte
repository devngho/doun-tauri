<script lang="ts">
    let style = "";

    document.addEventListener("mousemove", (e) => {
        style = `top: 0; left: 0; margin-left: ${e.clientX}px; margin-top: ${e.clientY}px;`;
    });
</script>

<div class="hover w-full h-full">
    <div class="w-full h-full flex justify-center items-center">
        <slot />
    </div>
    <div class="hover-content fixed" {style}>
        <slot name="content" />
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
