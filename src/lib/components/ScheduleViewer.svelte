<script lang="ts">
    import { fadeSlide } from "../transition";
    import { schedule, schedules, settings } from "../store";
    import { Time } from "../daytime";
    import { Schedule, Schedules, type ScheduleCompiled } from "../schedule";
    import { lastComputed } from "../play";
    import { get } from "svelte/store";

    export let type: "grouped" | "single";
    export let showDelay: boolean;
    let single = $lastComputed as ScheduleWithParent[];
    let grouped = Schedule.compileAsTime($schedule) as ScheduleWithParent[];
    type ScheduleWithParent = ScheduleCompiled & {
        parent?: string;
    };
    let typed: ScheduleWithParent[] =
        type === "single"
            ? ($lastComputed as ScheduleWithParent[])
            : (Schedule.compileAsTime($schedule) as ScheduleWithParent[]);
    $: typed = type === "single" ? single : grouped;

    $: {
        $schedule;
        typed =
            type === "single"
                ? ($lastComputed as ScheduleWithParent[])
                : (Schedule.compileAsTime($schedule) as ScheduleWithParent[]);
    }

    function getFileName(path: string) {
        return path.split(/\/|\\/).reverse()[0];
    }

    export let isSlim = false;
</script>

<section class={"flex flex-col " + (isSlim ? "w-inhert" : "w-screen px-8")}>
    {#each typed as i, idx (i.name + i.sound + i.time + idx)}
        {#if $settings.dev}
            {JSON.stringify(i)}
        {/if}
        {#if i.sound == "_delayed"}
            {#if showDelay}
                <div
                    class={"w-100 bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-4 rounded-md shadow-sm flex flex-row justify-between items-center " +
                        (isSlim ? "mb-2 " : "mb-4 ")}
                    transition:fadeSlide
                >
                    <h2 class="text-2xl">
                        대기: {i.name}
                        {new Time(0, 0, i.delay ?? 0).fix().formatTime()}
                    </h2>
                    <h3 class="text-xl flex">
                        {new Time(
                            i.time.hour,
                            i.time.minute,
                            i.time.second - (i.delay ?? 0)
                        )
                            .fix()
                            .formatTime()} ~ {i.time.formatTime()}
                        {#if i.parent !== undefined}
                            <h3
                                class="text-xl mx-1 text-gray-500 dark:text-gray-300"
                            >
                                ({(() => {
                                    //@ts-ignore
                                    return get(schedules)[i.parent].getName();
                                })()} 템플릿)
                            </h3>
                        {/if}
                    </h3>
                </div>
            {/if}
        {:else if i.sound == "_grouped" && i.group !== undefined}
            <div
                class={"w-100 bg-white dark:bg-gray-700 p-4 rounded-md shadow-md " +
                    (isSlim ? "mb-2" : "mb-4")}
                in:fadeSlide
            >
                <h2 class="text-2xl">
                    {i.name}({new Schedules($schedules[i.group]).getName()} 템플릿)
                </h2>
                <h3 class="text-xl">
                    {new Time(
                        i.time.hour,
                        i.time.minute,
                        i.time.second - (i.delay ?? 0)
                    )
                        .fix()
                        .formatTime()} ~ {i.time.formatTime()}
                </h3>
            </div>
        {:else if i.sound == "_error"}
            <div
                class={"w-100 bg-red-300 dark:bg-red-700 p-4 rounded-md shadow-md " +
                    (isSlim ? "mb-2" : "mb-4")}
                in:fadeSlide
            >
                <h2 class="text-2xl">{i.name}({i.group})</h2>
                <h3 class="text-xl">
                    {new Time(
                        i.time.hour,
                        i.time.minute,
                        i.time.second - (i.delay ?? 0)
                    )
                        .fix()
                        .formatTime()} ~ {i.time.formatTime()}
                </h3>
            </div>
        {:else}
            <div
                class={"w-100 bg-white shadow-md dark:bg-gray-700 p-4 rounded-md " +
                    (isSlim ? "mb-2" : "mb-4")}
                in:fadeSlide
            >
                <h2 class="text-2xl flex flex-row items-center">
                    {i.name}
                    {#if !isSlim}
                        <h3
                            class="text-xl mx-1 text-gray-500 dark:text-gray-300"
                        >
                            {getFileName(i.sound)}
                        </h3>
                    {/if}
                    {#if i.parent !== undefined}
                        <h3
                            class="text-xl mx-1 text-gray-500 dark:text-gray-300"
                        >
                            ({(() => {
                                //@ts-ignore
                                return get(schedules)[i.parent].getName();
                            })()} 템플릿)
                        </h3>
                    {/if}
                </h2>
                <h3 class="text-xl">
                    {i.time.formatTime()}
                </h3>
            </div>
        {/if}
    {/each}
</section>

<style lang="postcss">
</style>
