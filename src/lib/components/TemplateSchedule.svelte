<script lang="ts">
    import { get } from "svelte/store";
    import { Time } from "../daytime";
    import {
        DelaySchedule,
        GroupSchedule,
        Schedule,
        Schedules,
        SingleSchedule,
        type ScheduleCompiled,
    } from "../schedule";
    import TemplateDropdown from "./TemplateDropdown.svelte";
    import {} from "@tauri-apps/api";
    import { schedules } from "../store";
    import { log } from "../logger";
    import { getMiddleY, getXY } from "../touch";
    import { contextDropdown } from "../dropdown";
    import { createEventDispatcher } from "svelte";
    import * as dialog from "@tauri-apps/plugin-dialog";

    export let i: Schedule;
    export let idx: number;
    export let template: Schedules;

    interface Schedule {
        _uuid?: string;
        _el?: HTMLElement;
    }

    function recalc(i: Schedule) {
        if (i instanceof DelaySchedule) {
            //@ts-ignore
            if (i._hour === undefined) {
                const t = new Time(0, 0, i.delay).fix();
                //@ts-ignore
                i._hour = t.hour;
                //@ts-ignore
                i._minute = t.minute;
                //@ts-ignore
                i._second = t.second;
            }
            //@ts-ignore
            if (i._hour > 23) i._hour = 23;
            //@ts-ignore
            if (i._minute > 59) i._minute = 59;
            //@ts-ignore
            if (i._second > 59) i._second = 59;
            //@ts-ignore
            i.delay = i._hour * 3600 + i._minute * 60 + i._second;
        }

        const compiled = Schedule.compileAsTime(template.schedules);
        //@ts-ignore
        let timeIdx = compiled.findIndex((v) => v._uuid === i._uuid);

        if (timeIdx == -1) {
            time = new Time(0, 0, 0);
        } else if (timeIdx == 0) {
            time = compiled[0].time;
            beforeTime = new Time(0, 0, 0);
        } else {
            time = compiled[timeIdx].time;
            beforeTime = compiled[timeIdx - 1].time;
        }

        return i;
    }

    function getFileName(path: string) {
        return path.split(/\/|\\/).reverse()[0];
    }

    let beforeTime: Time = new Time(0, 0, 0);
    let time: Time = new Time(0, 0, 0);

    $: {
        time;
        log({ data: time });
    }

    export let anyDragging: boolean;

    const draggable = (node: HTMLElement) => {
        const noDraggableTags = [
            "input",
            "button",
            "select",
            "option",
            "h2",
            "h3",
        ];
        let dragging = false;
        let visualDragging = false;
        let left = 0;
        let top = 0;
        let firstX = 0;
        let firstY = 0;
        let highlighted: HTMLElement | null = null;

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

                try {
                    let whereIdx = template.schedules.findIndex(
                        (v) =>
                            //@ts-ignore
                            getMiddleY(v._el.getBoundingClientRect()) >
                            getMiddleY(i._el!.getBoundingClientRect()),
                    );
                    if (whereIdx === -1) {
                        const where =
                            template.schedules[template.schedules.length - 1] //@ts-ignore
                                ._el;

                        highlighted = where;
                        where.classList.add("border-b-4");
                        //@ts-ignore
                    } else if (template.schedules[whereIdx]._uuid === i._uuid) {
                        const where =
                            //@ts-ignore
                            template.schedules[whereIdx + 1]._el;

                        highlighted = where;
                        where.classList.add("border-t-4");
                    } else {
                        //@ts-ignore
                        const where = template.schedules[whereIdx]._el;

                        highlighted = where;
                        where.classList.add("border-t-4");
                    }
                } catch (e) {}
            }
        };

        const end = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();

            if (dragging) {
                const [x, y] = getXY(e);
                // remove highlight
                highlighted?.classList.remove("border-t-4");
                highlighted?.classList.remove("border-b-4");

                if (!visualDragging) {
                    dragging = false;
                    return;
                }

                // get where dropped
                let whereIdx = template.schedules.findIndex(
                    (v) =>
                        //@ts-ignore
                        getMiddleY(v._el.getBoundingClientRect()) >
                        getMiddleY(i._el!.getBoundingClientRect()),
                );

                //@ts-ignore
                if (template.schedules[whereIdx]?._uuid === i._uuid) whereIdx++;

                if (whereIdx >= template.schedules.length) whereIdx--;

                const idx =
                    whereIdx === -1
                        ? template.schedules.length
                        : //@ts-ignore
                          template.schedules[whereIdx]._el?.dataset.idx;
                // add to idx and remove from old idx
                if (idx !== undefined) {
                    let oldIdx = template.schedules.findIndex(
                        //@ts-ignore
                        (v) => v._uuid === i._uuid,
                    );
                    console.log(`${oldIdx} -> ${idx}`);
                    const uid = crypto.randomUUID();
                    const tmp = template.schedules[oldIdx].copy();
                    //@ts-ignore
                    tmp._uuid = template.schedules[oldIdx]._uuid;
                    //@ts-ignore
                    tmp._el = template.schedules[oldIdx]._el;
                    //@ts-ignore
                    template.schedules[oldIdx]._uuid = uid;
                    template.schedules.splice(idx, 0, tmp);

                    oldIdx = template.schedules.findIndex(
                        //@ts-ignore
                        (v) => v._uuid === uid,
                    );
                    template.schedules.splice(oldIdx, 1);

                    template.schedules = template.schedules;
                }
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

        node.addEventListener("mousedown", press);
        let timer: any;
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
        });
        node.addEventListener("touchmove", (e) => {
            touchPos = getXY(e);
            if (timerDone) e.preventDefault();
        });
        node.addEventListener("touchend", (e) => {
            if (timer) {
                clearTimeout(timer);
            }
        });
        window.addEventListener("mousemove", move);
        window.addEventListener("touchmove", move);
        window.addEventListener("mouseup", end);
        window.addEventListener("touchend", end);
        window.addEventListener("touchcancel", end);

        return {
            destroy() {
                node.removeEventListener("mousedown", press);
                node.removeEventListener("touchstart", press);
                window.removeEventListener("mousemove", move);
                window.removeEventListener("touchmove", move);
                window.removeEventListener("mouseup", end);
                window.removeEventListener("touchend", end);
                window.removeEventListener("touchcancel", end);
            },
        };
    };

    const dispatch = createEventDispatcher();

    $: {
        recalc(i);
        // dispatch("refresh", {});
    }
</script>

{#if i instanceof DelaySchedule}
    <div
        bind:this={i["_el"]}
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
                    bind:value={i.name}
                />
                <input
                    type="number"
                    class="w-16 bg-gray-300 dark:bg-gray-700 rounded px-1 mx-1"
                    bind:value={i._hour}
                    on:input={() => {
                        recalc(i);
                        dispatch("refresh", {});
                    }}
                />:<input
                    type="number"
                    class="w-16 bg-gray-300 dark:bg-gray-700 rounded px-1 mx-1"
                    bind:value={i._minute}
                    on:input={() => {
                        recalc(i);
                        dispatch("refresh", {});
                    }}
                />:<input
                    type="number"
                    class="w-16 bg-gray-300 dark:bg-gray-700 rounded px-1 mx-1"
                    min="0"
                    max="59"
                    bind:value={i._second}
                    on:input={() => {
                        recalc(i);
                        dispatch("refresh", {});
                    }}
                />
                ({new Time(0, 0, i.delay).fix().formatTime()})
            </h2>
            <TemplateDropdown bind:template {idx} />
            <div class="flex-grow" />
        </div>
        <h3 class="text-xl w-fit">
            {beforeTime.fix().formatTime()}~{time.fix().formatTime()}
        </h3>
    </div>
{:else if i instanceof GroupSchedule}
    <div
        use:draggable
        use:contextDropdown
        bind:this={i["_el"]}
        data-idx={idx}
        class="schedule w-full flex flex-col bg-white dark:bg-gray-700 p-4 my-2 rounded-md shadow-md"
    >
        <div class="flex flex-row items-center">
            <h2 class="text-2xl flex-grow flex">
                가져오기: <input
                    type="string"
                    class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2"
                    bind:value={i.name}
                />
                (<select
                    bind:value={i.scheduleId}
                    class="flex-grow-0 bg-gray-100 dark:bg-gray-900 rounded px-2 mr-2"
                >
                    {#each Object.keys(get(schedules)) as i}
                        <option value={i}
                            >{new Schedules($schedules[i]).getName()}</option
                        >
                    {/each}
                </select> 템플릿)
            </h2>
            <div class="mr-2" />
            <TemplateDropdown bind:template {idx} />
            <div class="flex-grow" />
        </div>
        <h3 class="text-xl w-fit">
            {beforeTime.fix().formatTime()}~{time.fix().formatTime()}
        </h3>
    </div>
{:else if i instanceof SingleSchedule}
    <div
        use:draggable
        use:contextDropdown
        bind:this={i["_el"]}
        data-idx={idx}
        class="schedule w-full flex flex-col bg-white shadow-md dark:bg-gray-700 p-4 my-2 rounded-md"
    >
        <div class="flex-grow flex flex-row items-center">
            <h2 class="text-2xl flex-grow flex">
                <input
                    type="string"
                    class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2"
                    bind:value={i.name}
                />
                <button
                    class="ml-2 text-sm"
                    on:click={async () => {
                        const d = (await dialog.open()) ?? "";
                        //@ts-ignore
                        if (typeof d !== "object") i.sound = d;
                    }}>{getFileName(i.sound)}</button
                >
            </h2>
            <div class="mr-2" />
            <TemplateDropdown bind:template {idx} />
            <div class="flex-grow" />
        </div>
        <h3 class="text-xl w-fit">
            {time.fix().formatTime()}
        </h3>
    </div>
{/if}

<style lang="postcss">
    .schedule {
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }
</style>
