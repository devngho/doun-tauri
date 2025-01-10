<script lang="ts">
    import { saveAll, schedules, settings, volumeMixer } from "../store";
    import { fadeSlide } from "../transition";

    let audioFiles = [
        ...new Set(
            Object.values($schedules)
                .flatMap((v) => {
                    return v.schedules;
                })
                .map((v) => {
                    return v.sound;
                })
                .filter(
                    (v) =>
                        v !== "_delayed" &&
                        v !== "_grouped" &&
                        v !== "_error" &&
                        v !== "just.mp3" &&
                        v.length > 0,
                ),
        ),
    ];

    volumeMixer.update((j) => {
        audioFiles.forEach((v) => {
            j[v] = j[v] ?? 1.0;
        });
        return j;
    });

    $: {
        $schedules;
        Object.values($schedules)
            .flatMap((v) => {
                return v.schedules;
            })
            .map((v) => {
                return v.sound;
            })
            .filter(
                (v) =>
                    v !== "_delayed" &&
                    v !== "_grouped" &&
                    v !== "_error" &&
                    v !== "just.mp3" &&
                    v.length > 0,
            );
        audioFiles.forEach((v) => {
            if ($volumeMixer[v] === undefined) $volumeMixer[v] = 1.0;
        });
    }

    function getFileName(path: string) {
        return path.split(/\/|\\/).reverse()[0];
    }

    $: console.log(audioFiles);
</script>

<!--Show every audio files and bar to control decibel -->
<article
    class="h-fit flex flex-col justify-center items-center w-screen p-8 pt-24"
    id={$$props._page}
>
    <ul class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 w-max gap-2">
        {#each audioFiles as i (i)}
            <li>
                <div
                    class="col-span-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-4 rounded-md shadow-sm grid grid-cols-8 justify-between items-center transition-all"
                    in:fadeSlide
                >
                    <h2 class="text-2xl col-span-4">{getFileName(i)}</h2>
                    <h3 class="text-lg col-span-2">
                        <input
                            type="string"
                            class="mr-1 bg-gray-100 dark:bg-gray-900 rounded px-2 w-12"
                            placeholder=""
                            value={$volumeMixer[i] * 100}
                            on:change={(e) => {
                                //@ts-ignore
                                $volumeMixer[i] = e.target.value / 100;
                                saveAll();
                            }}
                        />%
                    </h3>
                    <input
                        type="range"
                        min="0.0"
                        max="4.0"
                        step="0.01"
                        class="col-span-2"
                        bind:value={$volumeMixer[i]}
                        on:change={() => {
                            volumeMixer.update((v) => v);
                            saveAll();
                        }}
                    />
                </div>
            </li>
        {/each}
        {#if audioFiles.length === 0}
            <h2 class="text-2xl">템플릿에서 사용하는 오디오 파일이 없어요.</h2>
        {/if}
    </ul>
</article>

<style lang="postcss">
    ul {
        width: 100%;
    }
</style>
