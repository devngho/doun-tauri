<script lang="ts">
    import type { Row } from "../template";
    import Dropdown from "./Dropdown.svelte";
    import TemplateDropdownBody from "./TemplateDropdownBody.svelte";

    let { rows = $bindable(), idx }: { rows: Row[]; idx: number } = $props();
</script>

<Dropdown>
    <TemplateDropdownBody bind:rows {idx} />
</Dropdown>
