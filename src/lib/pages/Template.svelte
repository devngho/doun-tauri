<script lang="ts">
  import type { PageProps } from "../page";
  import {
    DelaySchedule,
    GroupSchedule,
    Schedule,
    SingleSchedule,
  } from "../schedule";
  import { saveAll, schedules } from "../store";
  import { Time } from "../daytime";
  import { flip } from "svelte/animate";
  import { onDestroy } from "svelte";
  import { fadeSlide } from "../transition";
  import { log } from "../logger";
  import { toRow, toSchedule, type TemplateMeta } from "../template";
  import TemplateTypeSelector from "../components/TemplateTypeSelector.svelte";
  import TemplateTypeInfo from "../components/TemplateTypeInfo.svelte";
  import TemplateSchedule from "../components/TemplateSchedule.svelte";
  let props: PageProps = $props();

  // the stored template; edited through the reactive copies below
  const template = $schedules[location.pathname.slice(1).split("/")[1]];

  let meta: TemplateMeta = $state({
    name: template.name,
    dayOfWeek: template.dayOfWeek,
    timeTableCount: template.timeTableCount,
    timeTableLength: template.timeTableLength,
    specifyDate: template.specifyDate,
  });
  let rows = $state(template.schedules.map(toRow));
  let anyDragging = $state(false);

  let built = $derived(rows.map(toSchedule));
  let compiled = $derived(Schedule.compileAsTime(built));

  const newSchedules = {
    delay: () => new DelaySchedule("새 일정", 0),
    group: () => new GroupSchedule("새 일정", "_"),
    single: () => new SingleSchedule("새 일정", "just.mp3"),
  };

  function addNewSchedule(type: keyof typeof newSchedules) {
    rows.push(toRow(newSchedules[type]()));
  }

  // write every edit back and save
  $effect(() => {
    Object.assign(template, meta);
    // in place: the schedule in use may share this array
    template.schedules.splice(0, Infinity, ...built);
    log({ data: template });

    saveAll();
  });

  onDestroy(() => {
    schedules.update((v) => {
      if (v["example"]) delete v["example"];
      return v;
    });
  });
</script>

<article
  class="h-fit flex flex-col justify-center items-center w-screen pt-24 px-8"
  id={props._page}
>
  <section class="flex flex-row px-4 items-center" in:fadeSlide>
    <TemplateTypeSelector bind:meta />
  </section>

  <section
    class="bg-white dark:bg-gray-700 p-2 my-2 rounded w-64 flex flex-row justify-center gap-2"
    in:fadeSlide
  >
    <TemplateTypeInfo bind:meta />
  </section>

  {#each rows as row, idx (row.id)}
    <div animate:flip={{ duration: 300 }} in:fadeSlide class="w-full">
      <TemplateSchedule
        bind:row={rows[idx]}
        {idx}
        bind:rows
        bind:anyDragging
        beforeTime={compiled[idx - 1]?.time ?? new Time(0, 0, 0)}
        time={compiled[idx]?.time ?? new Time(0, 0, 0)}
      />
    </div>
  {/each}

  <div class="flex flex-row mt-2 pb-64" in:fadeSlide>
    <button
      class="flex-grow"
      onclick={() => {
        addNewSchedule("delay");
      }}>대기</button
    >
    <button
      class="flex-grow mx-4"
      onclick={() => {
        addNewSchedule("group");
      }}>가져오기</button
    >
    <button
      class="flex-grow"
      onclick={() => {
        addNewSchedule("single");
      }}>일반</button
    >
  </div>
</article>
