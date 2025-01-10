<script lang="ts">
    import ScheduleViewer from "../components/ScheduleViewer.svelte";
    import SlimHeader from "../components/SlimHeader.svelte";
    import Timer from "../components/Timer.svelte";
    import { Time } from "../daytime";
    import { appliedSchedule } from "../play";
    import { nextSchedule, now } from "../store";

    export let isAprilFool: boolean;
    let folded: boolean = false;
</script>

<div class="grid grid-cols-5 gap-2 m-2" id={$$props._page}>
    <div
        class={"flex flex-col justify-center w-full h-full bg-gray-300 dark:bg-gray-800 p-4 shadow-md rounded-md " +
            (folded ? "col-span-4" : "col-span-3")}
    >
        <Timer isSlim={true} />
    </div>
    <SlimHeader bind:folded />
    {#if isAprilFool}
        <div class="col-span-5">
            <ScheduleViewer type="grouped" isSlim={true} showDelay={false} />
        </div>
    {/if}
    <div
        class="col-span-5 bg-gray-300 dark:bg-gray-800 p-4 shadow-md rounded-md"
    >
        <div class="flex flex-col items-center justify-center mr-4">
            <h3 class="text-2xl">
                {#if $nextSchedule?.time}
                    <span class="w-2" />다음 일정까지
                    {#if $nextSchedule.time.compare($now) < 60}
                        <span class="text-primary">
                            {new Time(0, 0, $nextSchedule.time.compare($now))
                                .fix()
                                .formatTime()}
                        </span>
                    {:else}
                        <span>
                            {new Time(0, 0, $nextSchedule.time.compare($now))
                                .fix()
                                .formatTime()}
                        </span>
                    {/if}
                {/if}
            </h3>
            <h2 class="text-lg flex flex-col items-center justify-center mr-4">
                {#if $appliedSchedule}
                    {$appliedSchedule?.getName()} 템플릿 적용됨
                {:else}
                    적용된 템플릿 없음
                {/if}
            </h2>
        </div>
    </div>
    {#if !isAprilFool}
        <div class="col-span-5">
            <ScheduleViewer type="grouped" isSlim={true} />
        </div>
    {/if}
</div>
