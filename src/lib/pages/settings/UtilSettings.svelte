<script lang="ts">
    import {  } from "@tauri-apps/api";
    import { isDev } from "../../dev";
    import { schedules, settings, volumeMixer } from "../../store";
    import { invokeTS } from "../../tauri_invoker";
    import { get } from "svelte/store";
    import { redirect } from "../../page";
import * as dialog from "@tauri-apps/plugin-dialog"

    let swapFrom = "";
    let swapTarget = "just.mp3";
    let playTarget = "";
</script>

<h2 class="text-2xl mt-2">도구</h2>
<ul>
    <li>
        <div>
            개발자 모드
            <p class="text-gray-500">
                수동으로 개발자 모드 기능을 활성화합니다.
            </p>
        </div>
        <div class="flex-grow" />
        <button
            class={$settings.dev === true ? "" : "unselected"}
            on:click={() => {
                settings.update((v) => {
                    $isDev = true;
                    v.dev = true;
                    return v;
                });
            }}>활성화</button
        ><button
            class={$settings.dev === false || $settings.dev === null
                ? ""
                : "unselected"}
            on:click={() => {
                settings.update((v) => {
                    $isDev = false;
                    v.dev = false;
                    return v;
                });
            }}>비활성화</button
        >
    </li>
    <li class="flex flex-col">
        <div>
            파일 일괄 변경
            <p class="text-gray-500">
                특정 오디오 파일을 다른 오디오 파일로 한번에 변경합니다. 파일
                이름이 바뀌거나 폴더를 옮겼을 때 사용할 수 있습니다.
            </p>
        </div>
        <div>
            <select
                bind:value={swapFrom}
                class="bg-gray-300 dark:bg-gray-900 rounded px-2 w-2/3"
            >
                {#each [...new Set(Array.from(Object.values(get(schedules)))
                            .flatMap((v) => v.schedules)
                            .map((v) => v.sound))] as s}
                    {#if s !== "_grouped" && s !== "_delayed"}
                        <option value={s}>{s}</option>
                    {/if}
                {/each}
            </select>
            를
            <button
                on:click={async () => {
                    const d = (await dialog.open()) ?? "";
                    if (typeof d !== "object") swapTarget = d;
                }}>{swapTarget}</button
            >로
            <button
                on:click={() => {
                    dialog
                        .confirm(
                            `정말로 ${swapFrom}를 ${swapTarget}로 변경하시겠어요?`,
                        )
                        .then((v) => {
                            if (v) {
                                schedules.update((v) => {
                                    Object.values(v).forEach((v) => {
                                        v.schedules.forEach((v) => {
                                            if (v.sound === swapFrom)
                                                v.sound = swapTarget;
                                        });
                                    });
                                    return v;
                                });
                            }
                        });
                }}>변경</button
            >
        </div>
    </li>
    <li class="flex flex-col">
        <div>
            파일 들어보기
            <p class="text-gray-500">
                볼륨 설정과 오디오 출력이 적용된 상태로 파일을 재생합니다.
            </p>
        </div>
        <div>
            <select
                bind:value={playTarget}
                class=" bg-gray-300 dark:bg-gray-900 rounded px-2 w-2/3"
            >
                {#each [...new Set(Array.from(Object.values(get(schedules)))
                            .flatMap((v) => v.schedules)
                            .map((v) => v.sound))] as s}
                    {#if s !== "_grouped" && s !== "_delayed"}
                        <option value={s}>{s}</option>
                    {/if}
                {/each}
            </select>
            <button
                on:click={() => {
                    invokeTS("play_audio", {
                        path: playTarget,
                        volume: $volumeMixer[playTarget] ?? 1.0,
                        output: $settings.audioOutput,
                    });
                }}
            >
                재생
            </button>
        </div>
    </li>
    <li>
        <div>
            미루기
            <p class="text-gray-500">
                상단 미루기 버튼을 눌렀을 때 지연될 시간을 설정합니다.
            </p>
        </div>
        <div class="flex-grow" />

        <div class="bg-gray-100 dark:bg-gray-900 rounded flex items-center">
            <input
                type="number"
                bind:value={$settings.delayTime}
                class="text-right w-24 h-full bg-gray-100 dark:bg-gray-900 rounded px-2"
            />
            초
        </div>
    </li>
    <li>
        <div>
            백업
            <p class="text-gray-500">
                설정과 오디오 파일을 묶어 내보냅니다. 백업이나 다른 컴퓨터로
                옮길 때 사용할 수 있습니다.
            </p>
        </div>
        <div class="flex-grow" />
        <button on:click={() => redirect("migrate")}> 시작 </button>
    </li>
</ul>

<style lang="postcss">
    ul {
        list-style: none;
        margin-left: 0.5rem;
    }
    li {
        margin-top: 0.5rem;
        @apply flex;
    }
    button {
        @apply w-24 p-2 mx-0.5 py-0.5;
    }
</style>
