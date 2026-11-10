<script lang="ts">
  import { Time } from "../daytime";
  import TemplateDropdown from "./TemplateDropdown.svelte";
  import { schedules } from "../store";
  import { log } from "../logger";
  import { getMiddleY, getXY } from "../touch";
  import { contextDropdown } from "../dropdown";
  import { delayOf, type DelayRow, type Row } from "../template";
  import * as dialog from "@tauri-apps/plugin-dialog";

  interface Props {
    row: Row;
    idx: number;
    rows: Row[];
    // when this row starts and ends
    beforeTime: Time;
    time: Time;
    anyDragging: boolean;
  }

  let {
    row = $bindable(),
    idx,
    rows = $bindable(),
    beforeTime,
    time,
    anyDragging = $bindable(),
  }: Props = $props();

  function getFileName(path: string) {
    return path.split(/\/|\\/).reverse()[0];
  }

  // keeps a delay within 23:59:59
  function clamp(row: DelayRow) {
    if (row.hour !== null && row.hour > 23) row.hour = 23;
    if (row.minute !== null && row.minute > 59) row.minute = 59;
    if (row.second !== null && row.second > 59) row.second = 59;
  }

  $effect(() => {
    log({ data: time });
  });

  const draggable = (node: HTMLElement) => {
    const noDraggableTags = ["input", "button", "select", "option", "h2", "h3"];
    let dragging = false;
    let visualDragging = false;
    let left = 0;
    let top = 0;
    let firstX = 0;
    let firstY = 0;
    let highlighted: HTMLElement | null = null;

    // all row elements, in row order
    const rowElements = () =>
      Array.from(document.querySelectorAll<HTMLElement>(".schedule"));
    // first row whose middle is below this (dragged) one, or -1
    const dropIndex = (els: HTMLElement[]) =>
      els.findIndex(
        (el) =>
          getMiddleY(el.getBoundingClientRect()) >
          getMiddleY(node.getBoundingClientRect()),
      );

    const press = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent && e.button !== 0) return;

      const [x, y] = getXY(e);
      const where = document.elementFromPoint(x, y);

      if (anyDragging) {
        e.preventDefault();
        return;
      }

      if (
        noDraggableTags.some((v) => where?.closest(v) !== null) &&
        where !== node
      ) {
        return;
      }

      left = node.getBoundingClientRect().left;
      top = node.getBoundingClientRect().top;
      firstX = x;
      firstY = y;
      dragging = true;
      // e.preventDefault();
      anyDragging = true;

      if (e instanceof TouchEvent) {
        node.style.opacity = "0.5";
        node.style.position = "fixed";
        node.style.left = x + "px";
        node.style.top = y + "px";
        node.style.cursor = "grabbing";
        visualDragging = true;
      }
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (anyDragging) e.preventDefault();
      if (dragging) {
        const [x, y] = getXY(e);

        const distance = Math.sqrt(
          Math.pow(x - firstX, 2) + Math.pow(y - firstY, 2),
        );

        if (distance > 5 || visualDragging || e instanceof TouchEvent) {
          node.style.opacity = "0.5";
          node.style.position = "fixed";
          node.style.left = x + "px";
          node.style.top = y + "px";
          node.style.cursor = "grabbing";
          visualDragging = true;
        }

        if (!visualDragging) return;

        // highlight where dropped
        highlighted?.classList.remove("border-t-4");
        highlighted?.classList.remove("border-b-4");

        const els = rowElements();
        const whereIdx = dropIndex(els);
        if (whereIdx === -1) {
          highlighted = els[els.length - 1];
          highlighted.classList.add("border-b-4");
        } else {
          // dropping onto itself points at the next row
          highlighted = els[whereIdx === idx ? whereIdx + 1 : whereIdx] ?? null;
          highlighted?.classList.add("border-t-4");
        }
      }
    };

    const end = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      if (dragging) {
        // remove highlight
        highlighted?.classList.remove("border-t-4");
        highlighted?.classList.remove("border-b-4");

        if (!visualDragging) {
          dragging = false;
          return;
        }

        // get where dropped
        let whereIdx = dropIndex(rowElements());
        if (whereIdx === idx) whereIdx++;
        if (whereIdx >= rows.length) whereIdx--;
        const newIdx = whereIdx === -1 ? rows.length : whereIdx;

        console.log(`${idx} -> ${newIdx}`);
        // insert before newIdx, then drop the old entry
        const oldIdx = idx;
        rows.splice(newIdx, 0, rows[oldIdx]);
        rows.splice(newIdx <= oldIdx ? oldIdx + 1 : oldIdx, 1);
      }
      node.style.position = "";
      node.style.left = "";
      node.style.top = "";
      node.style.transform = "";
      node.style.cursor = "";
      node.style.opacity = "1";
      node.classList.remove("scale-95");
      dragging = false;
      anyDragging = false;
      visualDragging = false;
    };

    // removes every listener below on destroy
    const destroy = new AbortController();
    const signal = destroy.signal;

    node.addEventListener("mousedown", press, { signal });
    let timer: ReturnType<typeof setTimeout> | undefined;
    let touchPos = [0, 0];
    let timerDone = false;
    const touchLength = 300;

    node.addEventListener("touchstart", (e) => {
      const where = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY,
      );
      if (noDraggableTags.some((v) => where?.closest(v) !== null)) {
        console.log("no draggable");
        return;
      }
      timerDone = false;
      timer = setTimeout(() => {
        if (
          document
            .elementFromPoint(touchPos[0], touchPos[1])
            ?.closest(".schedule") === node
        ) {
          press(e);
          timerDone = true;
        }
      }, touchLength);
    }, { signal });
    node.addEventListener("touchmove", (e) => {
      touchPos = getXY(e);
      if (timerDone) e.preventDefault();
    }, { signal });
    node.addEventListener("touchend", () => clearTimeout(timer), { signal });
    window.addEventListener("mousemove", move, { signal });
    window.addEventListener("touchmove", move, { signal });
    window.addEventListener("mouseup", end, { signal });
    window.addEventListener("touchend", end, { signal });
    window.addEventListener("touchcancel", end, { signal });

    return { destroy: () => destroy.abort() };
  };

</script>

{#if row.kind === "delay"}
  <div
    use:draggable
    use:contextDropdown
    data-idx={idx}
    class="schedule w-full bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-4 my-2 rounded-md shadow-sm flex flex-col justify-center"
  >
    <div class="flex flex-row items-center">
      <h2 class="text-2xl w-fit flex flex-row flex-grow">
        대기: <input
          type="string"
          class="flex-grow bg-gray-300 dark:bg-gray-700 rounded px-2 mr-2"
          bind:value={row.name}
        />
        <input
          type="number"
          class="w-16 bg-gray-300 dark:bg-gray-700 rounded px-1 mx-1"
          bind:value={row.hour}
          oninput={() => clamp(row)}
        />:<input
          type="number"
          class="w-16 bg-gray-300 dark:bg-gray-700 rounded px-1 mx-1"
          bind:value={row.minute}
          oninput={() => clamp(row)}
        />:<input
          type="number"
          class="w-16 bg-gray-300 dark:bg-gray-700 rounded px-1 mx-1"
          min="0"
          max="59"
          bind:value={row.second}
          oninput={() => clamp(row)}
        />
        ({new Time(0, 0, delayOf(row)).fix().formatTime()})
      </h2>
      <TemplateDropdown bind:rows {idx} />
      <div class="flex-grow"></div>
    </div>
    <h3 class="text-xl w-fit">
      {beforeTime.formatTime()}~{time.formatTime()}
    </h3>
  </div>
{:else if row.kind === "group"}
  <div
    use:draggable
    use:contextDropdown
    data-idx={idx}
    class="schedule w-full flex flex-col bg-white dark:bg-gray-700 p-4 my-2 rounded-md shadow-md"
  >
    <div class="flex flex-row items-center">
      <h2 class="text-2xl flex-grow flex">
        가져오기: <input
          type="string"
          class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2"
          bind:value={row.name}
        />
        (<select
          bind:value={row.scheduleId}
          class="flex-grow-0 bg-gray-100 dark:bg-gray-900 rounded px-2 mr-2"
        >
          {#each Object.entries($schedules) as [id, template]}
            <option value={id}>{template.getName()}</option>
          {/each}
        </select> 템플릿)
      </h2>
      <div class="mr-2"></div>
      <TemplateDropdown bind:rows {idx} />
      <div class="flex-grow"></div>
    </div>
    <h3 class="text-xl w-fit">
      {beforeTime.formatTime()}~{time.formatTime()}
    </h3>
  </div>
{:else}
  <div
    use:draggable
    use:contextDropdown
    data-idx={idx}
    class="schedule w-full flex flex-col bg-white shadow-md dark:bg-gray-700 p-4 my-2 rounded-md"
  >
    <div class="flex-grow flex flex-row items-center">
      <h2 class="text-2xl flex-grow flex">
        <input
          type="string"
          class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2"
          bind:value={row.name}
        />
        <button
          class="ml-2 text-sm"
          onclick={async () => {
            row.sound = (await dialog.open()) ?? "";
          }}>{getFileName(row.sound)}</button
        >
      </h2>
      <div class="mr-2"></div>
      <TemplateDropdown bind:rows {idx} />
      <div class="flex-grow"></div>
    </div>
    <h3 class="text-xl w-fit">
      {time.formatTime()}
    </h3>
  </div>
{/if}

<style lang="postcss">
  @reference "../../app.css";
  .schedule {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
</style>
