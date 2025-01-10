<script lang="ts">
    import type { Schedules } from "../schedule";
    import Dropdown from "./Dropdown.svelte";
    import TemplateDropdownBody from "./TemplateDropdownBody.svelte";

    export let template: Schedules;
    export let idx: number;
</script>

<Dropdown>
    <TemplateDropdownBody bind:template bind:idx />
</Dropdown>
