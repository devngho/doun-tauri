<script lang="ts">
    import type { Schedules } from "../schedule";
    import Dropdown from "./Dropdown.svelte";
    import TemplateDropdownBody from "./TemplateDropdownBody.svelte";

    interface Props {
        template: Schedules;
        idx: number;
    }

    let { template = $bindable(), idx = $bindable() }: Props = $props();
</script>

<Dropdown>
    <TemplateDropdownBody bind:template bind:idx />
</Dropdown>
