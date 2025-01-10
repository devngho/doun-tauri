<script lang="ts">
  import {} from "@tauri-apps/api";
  import { Time } from "../daytime";
  import { isDev } from "../dev";
  import { contextDropdown } from "../dropdown";
  import {
    DelaySchedule,
    GroupSchedule,
    Schedule,
    Schedules,
  } from "../schedule";
  import { schedule, schedules } from "../store";
  import { fadeSlide } from "../transition";
  import Dropdown from "./Dropdown.svelte";
  import { redirect } from "../page";
  import * as dialog from "@tauri-apps/plugin-dialog";

  function getTotalTime(schedules: Schedule[]) {
    return Schedule.compileAll(schedules)
      .filter((v) => v instanceof DelaySchedule)
      .reduce((a, b) => a + (b as DelaySchedule).delay, 0);
  }

  export let id: string;
  export let value: Schedules;
</script>

<div
  class="flex flex-row bg-white dark:bg-gray-700 items-center w-100 shadow-md p-4 rounded-md transition-all"
  in:fadeSlide
  use:contextDropdown
>
  <h2 class="text-2xl flex flex-row items-center">
    {value.getName()}
    <h3 class="text-xl mx-1 text-gray-500 dark:text-gray-300">
      총 길이 {new Time(0, 0, getTotalTime(value.schedules)).fix().formatTime()}
    </h3>
  </h2>
  <div class="mx-2" />
  <Dropdown>
    {#if $isDev}
      {id}
      <button
        on:click={() => {
          const newId = crypto.randomUUID();
          const s = value.copy();
          schedules.update((v) => {
            delete v[id];
            v[newId] = s;
            Object.entries(v).forEach((x) => {
              x[1].schedules.forEach((w) => {
                if (w instanceof GroupSchedule) {
                  if (w.scheduleId == id) {
                    w.scheduleId = newId;
                  }
                }
              });
            });
            return v;
          });
        }}>UUID 재발급</button
      >
    {/if}
    <button
      on:click={async () => {
        if (
          await dialog.confirm(
            `정말로 ${value.getName()} 템플릿을 삭제하시겠어요?`
          )
        ) {
          schedules.update((v) => {
            delete v[id];
            return v;
          });
        }
      }}>✕ 삭제</button
    >
    <button
      on:click={() => {
        const id = crypto.randomUUID();
        $schedules[id] = value.copy();
        if (value.name) $schedules[id].name = value.name + " 복제";
        redirect(`/template/${id}`);
      }}>🗍 복제</button
    >
    <button on:click={() => redirect(`/template/${id}`)}>✎ 편집</button>
    <button
      on:click={() => {
        const newSchedule = value.schedules;
        Schedules.addDetails(newSchedule);
        $schedule = newSchedule;

        redirect("/");
      }}>☑ 사용</button
    >
  </Dropdown>
</div>
