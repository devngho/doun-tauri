<script lang="ts">
    import { DelaySchedule, GroupSchedule, SingleSchedule } from "../schedule";
    import { saveAll, schedules } from "../store";
    import { Time } from "../daytime";
    import { flip } from "svelte/animate";
    import { onMount, onDestroy } from "svelte";
    import { fadeSlide } from "../transition";
    import { log } from "../logger";
    import TemplateTypeSelector from "../components/TemplateTypeSelector.svelte";
    import TemplateTypeInfo from "../components/TemplateTypeInfo.svelte";
    import TemplateSchedule from "../components/TemplateSchedule.svelte";

    let template = $schedules[location.pathname.slice(1).split("/")[1]];
    let anyDragging = false;

    onMount(() => {
        template.schedules = template.schedules.map((v) => {
            //@ts-ignore
            v["_uuid"] = crypto.randomUUID();
            return v;
        });
    });
    onDestroy(() => {
        template.schedules = template.schedules.map((v) => {
            //@ts-ignore
            delete v["_uuid"];
            //@ts-ignore
            delete v["_el"];
            return v;
        });
    });

    function addNewSchedule(type: "group" | "delay" | "single") {
        if (type == "delay") {
            const s = new DelaySchedule("새 일정", 0);
            //@ts-ignore
            s["_uuid"] = crypto.randomUUID();
            template.schedules.push(s);
            template.schedules = template.schedules;
        } else if (type == "group") {
            const s = new GroupSchedule("새 일정", "_");
            //@ts-ignore
            s["_uuid"] = crypto.randomUUID();
            template.schedules.push(s);
            template.schedules = template.schedules;
        } else if (type == "single") {
            const s = new SingleSchedule("새 일정", "just.mp3");
            //@ts-ignore
            s["_uuid"] = crypto.randomUUID();
            template.schedules.push(s);
            template.schedules = template.schedules;
        }
    }

    $: log({ data: template });

    $: {
        template;
        saveAll();
    }

    onDestroy(() => {
        schedules.update((v) => {
            if (v["example"]) delete v["example"];
            return v;
        });
    });
</script>

<article
    class="h-fit flex flex-col justify-center items-center w-screen pt-24 px-8"
    id={$$props._page}
>
    <section class="flex flex-row px-4 items-center" in:fadeSlide>
        <TemplateTypeSelector bind:template />
    </section>

    <section
        class="bg-white dark:bg-gray-700 p-2 my-2 rounded w-64 flex flex-row justify-center gap-2"
        in:fadeSlide
    >
        <TemplateTypeInfo bind:template />
    </section>

    {#if template !== undefined}
        {#each template.schedules as i, idx (i._uuid ?? idx)}
            <div animate:flip={{ duration: 300 }} in:fadeSlide class="w-full">
                <TemplateSchedule
                    {i}
                    {idx}
                    bind:template
                    bind:anyDragging
                    on:refresh={() => {
                        template.schedules = template.schedules;
                    }}
                />
            </div>
        {/each}
    {/if}

    <div class="flex flex-row mt-2 pb-64" in:fadeSlide>
        <button
            class="flex-grow"
            on:click={() => {
                addNewSchedule("delay");
            }}>대기</button
        >
        <button
            class="flex-grow mx-4"
            on:click={() => {
                addNewSchedule("group");
            }}>가져오기</button
        >
        <button
            class="flex-grow"
            on:click={() => {
                addNewSchedule("single");
            }}>일반</button
        >
    </div>
</article>
