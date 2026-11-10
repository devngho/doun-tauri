<script lang="ts">
    import { Dates, DayOfWeek } from "../daytime";
    import type { TemplateMeta } from "../template";

    interface Props {
        meta: TemplateMeta;
        // width class of the timetable number inputs
        numberWidth?: string;
    }

    let { meta = $bindable(), numberWidth = "w-16" }: Props = $props();
</script>

{#if meta.name !== undefined}
    <!-- svelte-ignore a11y_invalid_attribute -->
    <input
        type="string"
        class="mr-1 bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
        placeholder="새 템플릿 이름"
        bind:value={meta.name}
    />
{:else if meta.specifyDate !== undefined}
    <input
        type="date"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
        value={meta.specifyDate.formatTime()}
        onchange={(e) => {
            meta.specifyDate = Dates.parseDate(e.currentTarget.value);
        }}
    />
{:else if meta.dayOfWeek !== undefined}
    <select
        bind:value={meta.dayOfWeek}
        class=" bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
    >
        {#each Object.values(DayOfWeek) as day}
            <option value={day}>{day}</option>
        {/each}
    </select>
{:else if meta.timeTableCount !== undefined}
    <input
        type="number"
        class={"bg-gray-100 dark:bg-gray-900 rounded px-2 " + numberWidth}
        bind:value={meta.timeTableCount}
    />
    교시
    <input
        type="number"
        class={"bg-gray-100 dark:bg-gray-900 rounded px-2 " + numberWidth}
        bind:value={meta.timeTableLength}
    /> 분
{/if}
