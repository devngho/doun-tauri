<script lang="ts">
    import HoverText from "../../components/HoverText.svelte";
    import { isDev } from "../../dev";
    import { currentOS } from "../../platform";
    import { settings } from "../../store";
    import { invokeTS } from "../../tauri_invoker";
    import SettingRow from "./SettingRow.svelte";

    let audioOutputs: string[] = [];
    let defaultAudioOutput = "";

    invokeTS("get_audio_outputs", null).then((v) => {
        audioOutputs = v;
    });

    invokeTS("get_default_audio_output", null).then((v) => {
        defaultAudioOutput = v;
    });
</script>

<h2 class="text-2xl mt-2">소리</h2>
<ul>
    <!-- {#if currentOS !== "windows" || $isDev}
            <li>
                <div>
                    절전 방지
                    <p class="text-gray-500">
                        절전 모드를 방지합니다. 절전 모드에서 작동하지 않는
                        문제를 해결할 수 있습니다.
                        {#if currentOS === "windows" && !$isDev}
                            <span class="text-red-500"
                                >Windows에서는 사용할 수 없습니다.</span
                            >
                        {/if}
                    </p>
                </div>
                <div class="flex-grow" />
                <button
                    class={$settings.useAutoSleep === true ? "" : "unselected"}
                    on:click={() => {
                        $settings.useAutoSleep = true;
                    }}>활성화</button
                ><button
                    class={$settings.useAutoSleep === false ? "" : "unselected"}
                    on:click={() => {
                        $settings.useAutoSleep = false;
                    }}>비활성화</button
                >
            </li>
        {/if} -->
    <SettingRow
        selector={{
            type: "select",
            visual: "select",
            fields: audioOutputs.map((v) => ({ id: v, name: v })),
        }}
        value={$settings.audioOutput}
        on:change={(e) => {
            $settings.audioOutput = e.detail.value;
        }}
    >
        <span slot="name">오디오 출력</span>
        <span slot="description">
            오디오를 출력할 장치를 선택합니다.
            {#if currentOS == "macos" && !isDev}
                <span class="text-red-500"
                    >macOS에서는 기본 출력만 사용할 수 있습니다.<HoverText
                        >macOS는 기본 출력을 제외한 출력 장치를 지원하지
                        않습니다. 출력 장치를 변경하려면 화면 오른쪽 위의 스피커
                        또는 헤드셋 버튼을 클릭하세요. 새로고침하면 기본 출력이
                        반영됩니다.
                    </HoverText></span
                >
            {/if}
        </span>
    </SettingRow>
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
</style>
