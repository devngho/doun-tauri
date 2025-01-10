<script lang="ts">
    import { daysOfWeek, schedules } from "../store";
    import { Schedule, DelaySchedule, Schedules } from "../schedule";
    import { redirect } from "../page";
    import {} from "@tauri-apps/api";
    import TemplateListSchedule from "../components/TemplateListSchedule.svelte";
    import { compareDayOfWeek } from "../daytime";

    type GroupedSchedules = {
        timetable: {
            [key: string]: {
                [key: string]: Schedules; // separated by length of length
            };
        };
        dayOfWeek: {
            [key: string]: Schedules; // separated by length of length
        };
        specify: {
            [key: string]: Schedules; // separated by length of length
        };
        name: {
            [key: string]: Schedules; // separated by length of length
        };
    };

    function groupSchedules(schedules: {
        [key: string]: Schedules; // separated by length of length
    }) {
        // group them by type, such as week, day, etc.
        const groups: GroupedSchedules = {
            timetable: {},
            dayOfWeek: {},
            specify: {},
            name: {},
        };

        Object.entries(schedules).forEach((inp) => {
            const [k, v] = inp;

            if (v.timeTableCount != null) {
                groups.timetable[v.timeTableLength!] =
                    groups.timetable[v.timeTableLength!] || {};

                groups.timetable[v.timeTableLength!]![k] = v;
            }
            if (v.dayOfWeek != null) {
                groups.dayOfWeek[k] = v;
            }
            if (v.specifyDate != null) {
                groups.specify[k] = v;
            }
            if (v.name != null) {
                groups.name[k] = v;
            }
        });

        return groups;
    }

    function getTotalTime(schedules: Schedule[]) {
        return Schedule.compileAll(schedules)
            .filter((v) => v instanceof DelaySchedule)
            .reduce((a, b) => a + (b as DelaySchedule).delay, 0);
    }

    $: grouped = groupSchedules($schedules);
    $: sortedDayOfWeek = Array.from(Object.entries(grouped.dayOfWeek)).toSorted(
        (a, b) => compareDayOfWeek(a[1].dayOfWeek!, b[1].dayOfWeek!),
    );
</script>

<article
    class="h-fit flex flex-col justify-center items-center w-screen"
    id={$$props._page}
>
    <section
        class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 mt-16 p-8 pb-0 w-screen gap-2"
    >
        <!---Create section by group-->

        <h2 class="text-2xl col-span-1 xl:col-span-2 2xl:col-span-3">시간표</h2>
        {#each Object.entries(grouped.timetable) as v}
            <h3 class="text-xl col-span-1 xl:col-span-2 2xl:col-span-3">
                {v[0]}분 시간표
            </h3>
            {#each Object.entries(v[1]) as w, i}
                <TemplateListSchedule id={w[0]} value={w[1]} />
            {/each}
        {/each}

        <h2 class="text-2xl col-span-1 xl:col-span-2 2xl:col-span-3 mt-4">
            요일
        </h2>
        {#each sortedDayOfWeek as v}
            <TemplateListSchedule id={v[0]} value={v[1]} />
        {/each}

        <h2 class="text-2xl col-span-1 xl:col-span-2 2xl:col-span-3 mt-4">
            날짜
        </h2>
        {#each Object.entries(grouped.specify) as v}
            <TemplateListSchedule id={v[0]} value={v[1]} />
        {/each}

        <h2 class="text-2xl col-span-1 xl:col-span-2 2xl:col-span-3 mt-4">
            이름
        </h2>
        {#each Object.entries(grouped.name) as v}
            <TemplateListSchedule id={v[0]} value={v[1]} />
        {/each}
    </section>
    <div class="p-8 pt-4 w-full flex justify-end">
        <button
            on:click={() => {
                redirect("/template-new");
            }}>새 템플릿</button
        >
    </div>
</article>
