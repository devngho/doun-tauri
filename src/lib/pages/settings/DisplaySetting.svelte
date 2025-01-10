<script lang="ts">
    import { settings } from "../../store";
    import ColorPicker, { type RgbaColor } from "svelte-awesome-color-picker";
    import SettingRow from "./SettingRow.svelte";

    export let rgb: RgbaColor | undefined;
</script>

<h2 class="text-2xl">화면</h2>
<ul>
    <SettingRow
        selector={{
            type: "select",
            visual: "button",
            fields: [
                { id: "light", name: "라이트" },
                { id: "dark", name: "다크" },
            ],
        }}
        value={$settings.theme}
        on:change={(e) => {
            $settings.theme = e.detail.value;
        }}
    >
        <span slot="name">테마</span>
        <span slot="description">테마를 선택합니다.</span>
    </SettingRow>

    <SettingRow
        selector={{
            type: "select",
            visual: "button",
            fields: [
                { id: "true", name: "활성화" },
                { id: "false", name: "비활성화" },
            ],
        }}
        value={$settings.useSlim ? "true" : "false"}
        on:change={(e) => {
            $settings.useSlim = e.detail.value === "true";
        }}
    >
        <span slot="name">슬림 모드</span>
        <span slot="description"
            >화면의 크기가 작아지면 슬림 모드를 사용합니다.</span
        >
    </SettingRow>

    <li class="items-center">
        <div>
            색상
            <p class="text-gray-500">
                버튼 등의 색상을 선택합니다. 기본 값은 <span
                    style="color: #3b82f6;">#3b82f6(RGB 59 130 246)</span
                >입니다.
            </p>
        </div>
        <div class="mr-4" />
        <div class="flex justify-center items-center h-max">
            <ColorPicker bind:rgb isAlpha={false} label={""} isDark={true} />
        </div>
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
</style>
