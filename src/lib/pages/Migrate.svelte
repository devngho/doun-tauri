<script lang="ts">
    import { get } from "svelte/store";
    import { loadAll, saveAll, saveAllAsRaw, schedules } from "../store";
    import { invokeTS } from "../tauri_invoker";
    import { currentOS } from "../platform";
    import { onMount } from "svelte";
    import {  } from "@tauri-apps/api";
    import { SingleSchedule } from "../schedule";
import * as dialog from "@tauri-apps/plugin-dialog"

    function getFileName(path: string) {
        return path.split(/\/|\\/).slice(-1)[0];
    }

    async function openFile(path: string) {
        // using command to open file
        let cmd = "";
        let args: string[] = [];
        const pathWithoutFilename = path.split(/\/|\\/).slice(0, -1).join("/");
        switch (currentOS) {
            case "windows":
                cmd = "powershell";
                args = ["-command", `& start {${pathWithoutFilename}}`];
                break;
            case "macos":
                cmd = "open";
                args = [pathWithoutFilename];
                break;
            case "linux":
                cmd = `xdg-open`;
                args = [pathWithoutFilename];
                break;
        }

        console.log(cmd);

        await invokeTS("call_command_line", {
            command: cmd,
            args: args,
        });
    }

    const audioFiles = [
        ...new Set(
            Array.from(Object.values(get(schedules)))
                .flatMap((v) => v.schedules)
                .map((v) => v.sound),
        ),
    ].filter(
        (s) =>
            s !== "_grouped" &&
            s !== "_delayed" &&
            s !== "_error" &&
            s !== "just.mp3" &&
            s.length > 0,
    );
    let settingFile = "";
    let zipTarget = "폴더 선택";
    let zipLoadTarget = "파일 선택";
    let workingZip: "working" | "done" = "done";

    function createZip() {
        workingZip = "working";

        const data = saveAllAsRaw();

        Object.entries(data.schedules).forEach((v) => {
            v[1].schedules.forEach((v) => {
                if (v instanceof SingleSchedule) {
                    v.sound = getFileName(v.sound);
                }
            });
        });

        invokeTS("make_zip", {
            path:
                zipTarget +
                (currentOS === "windows" ? "\\" : "/") +
                "migrated.zip",
            files: audioFiles,
            data: JSON.stringify(data),
        }).then(() => {
            workingZip = "done";
            openFile(
                zipTarget +
                    (currentOS === "windows" ? "\\" : "/") +
                    "migrated.zip",
            );
        });
    }

    function loadZip() {
        workingZip = "working";

        invokeTS("load_zip", {
            path: zipLoadTarget,
        }).then(async (dataDir) => {
            await loadAll();
            schedules.update((v) => {
                Object.values(v).forEach((v) => {
                    v.schedules.forEach((v) => {
                        if (
                            v.sound !== "_grouped" &&
                            v.sound !== "_delayed" &&
                            v.sound !== "_error" &&
                            v.sound !== "just.mp3" &&
                            v.sound.length > 0
                        )
                            v.sound =
                                dataDir +
                                (currentOS === "windows" ? "\\" : "/") +
                                v.sound;
                    });
                });
                return v;
            });
            await saveAll();
            window.location.reload();
        });
    }

    onMount(async () => (settingFile = await invokeTS("get_data_file_path")));
</script>

<article class="p-8 pt-24 w-screen" id={$$props._page}>
    <div class="flex flex-col justify-center items-center w-screen">
        <h1 class="text-4xl">백업</h1>
    </div>

    <div class="mb-8">
        <h2 class="text-2xl">가져오기</h2>
        <p class="text-gray-500">
            보낸 압축 파일을 풀어서 오디오 파일과 설정 파일을 가져옵니다.
        </p>
        <button
            on:click={async () => {
                const d = (await dialog.open()) ?? "";
                if (typeof d !== "object") zipLoadTarget = d;
            }}>{zipLoadTarget}</button
        >
        파일을
        <button on:click={loadZip}>가져오기</button>
    </div>

    <div>
        <h2 class="text-2xl">내보내기</h2>
        <p class="text-gray-500">
            오디오 파일과 설정 파일을 압축하여 보냅니다.
        </p>
        <ol>
            <h3 class="text-xl">오디오 파일</h3>
            {#each audioFiles as s}
                <li>
                    {s}<button class="ml-2" on:click={() => openFile(s)}
                        >열기</button
                    >
                </li>
            {/each}
            <h3 class="text-xl">설정 파일</h3>
            <li>
                {settingFile}<button
                    class="ml-2"
                    on:click={() => openFile(settingFile)}>열기</button
                >
            </li>
        </ol>
        <button
            on:click={async () => {
                const d = (await dialog.open({ directory: true })) ?? "";
                if (typeof d !== "object") zipTarget = d;
            }}>{zipTarget}</button
        >
        폴더에 <button on:click={createZip}>내보내기</button>
    </div>
</article>

<style lang="postcss">
    ol {
        list-style-type: decimal;
    }

    li {
        @apply ml-8;
    }
</style>
