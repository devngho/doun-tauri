<script lang="ts">
    import { DayOfWeek } from "../daytime";
    import type { Schedules } from "../schedule";
    import { Dates } from "../daytime";

    export let template: Schedules;

    function getDayweekName(dayOfWeek: string) {
        return DayOfWeek[dayOfWeek as keyof typeof DayOfWeek];
    }
</script>

{#if template?.name !== undefined}
    <!-- svelte-ignore a11y-invalid-attribute -->
    <input
        type="string"
        class="mr-1 bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
        placeholder="새 템플릿 이름"
        bind:value={template.name}
    />
{:else if template?.specifyDate !== undefined}
    <input
        type="date"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
        value={template.specifyDate.formatTime()}
        on:change={(e) => {
            if (e.target === null) return;
            //@ts-ignore
            template.specifyDate = Dates.parseDate(e.target.value);
        }}
    />
{:else if template?.dayOfWeek !== undefined}
    <select
        bind:value={template.dayOfWeek}
        class=" bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
    >
        {#each Object.keys(DayOfWeek) as i}
            <option value={i}>{getDayweekName(i)}</option>
        {/each}
    </select>
{:else if template?.timeTableCount !== undefined}
    <input
        type="number"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-16"
        bind:value={template.timeTableCount}
    />
    교시
    <input
        type="number"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-16"
        bind:value={template.timeTableLength}
    /> 분
{/if}
