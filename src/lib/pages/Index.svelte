<script lang="ts">
    import NextSchedule from "../components/NextSchedule.svelte";
    import ScheduleViewTypeSelector from "../components/ScheduleViewTypeSelector.svelte";
    import ScheduleViewer from "../components/ScheduleViewer.svelte";
    import Timer from "../components/Timer.svelte";
    import { fadeSlide } from "../transition";

    let viewType: "grouped" | "single" = "grouped";
    let showDelay = false;
</script>

<article
    class="h-fit flex flex-col justify-center items-center w-screen"
    id={$$props._page}
>
    <section
        class="w-screen py-12 pb-8 fixed top-12 shadow-md rounded-3xl bg-gray-200 dark:bg-gray-900"
        in:fadeSlide
    >
        <Timer />
        <NextSchedule />
        <ScheduleViewTypeSelector bind:type={viewType} bind:showDelay />
    </section>

    <section class="mt-56 p-4">
        <ScheduleViewer type={viewType} {showDelay} />
    </section>
</article>
