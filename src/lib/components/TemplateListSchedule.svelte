<script lang="ts">
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

  let { id, value }: { id: string; value: Schedules } = $props();
</script>

<div
  class="flex flex-row bg-white dark:bg-gray-700 items-center shadow-md p-4 rounded-md transition-all"
  in:fadeSlide
  use:contextDropdown
>
  <div class="flex flex-row items-center">
    <h2 class="text-2xl">
      {value.getName()}
    </h2>
    <h3 class="text-xl mx-1 text-gray-500 dark:text-gray-300">
      총 길이 {new Time(0, 0, getTotalTime(value.schedules)).fix().formatTime()}
    </h3>
  </div>
  <div class="mx-2"></div>
  <Dropdown>
    {#if $isDev}
      {id}
      <button
        onclick={() => {
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
      onclick={async () => {
        if (
          await dialog.confirm(
            `정말로 ${value.getName()} 템플릿을 삭제하시겠어요?`,
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
      onclick={() => {
        const id = crypto.randomUUID();
        $schedules[id] = value.copy();
        if (value.name) $schedules[id].name = value.name + " 복제";
        redirect(`/template/${id}`);
      }}>🗍 복제</button
    >
    <button onclick={() => redirect(`/template/${id}`)}>✎ 편집</button>
    <button
      onclick={() => {
        const newSchedule = value.schedules;
        Schedules.addDetails(newSchedule);
        $schedule = newSchedule;

        redirect("/");
      }}>☑ 사용</button
    >
  </Dropdown>
</div>
