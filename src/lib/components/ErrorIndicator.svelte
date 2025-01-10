<script type="ts">
    import { updateSchedules } from "../schedule";
    import { isError, saveAll, settings } from "../store";
    import HoverField from "./HoverField.svelte";
    import HoverText from "./HoverText.svelte";
</script>

<div class="w-24 h-16">
    {#if $isError == "parseSchedule"}
        <button class="error" disabled
            ><HoverField>
                <span slot="content">
                    <span class="m-2">
                        템플릿이 순환하는 등의 문제가 있습니다. 풀어서 보기로
                        문제를 확인하세요.</span
                    ></span
                >템플릿에 문제 있음
            </HoverField></button
        >
    {:else if $isError == "findSchedule"}
        {#if $settings.autoSchedule.enabled === true}
            <button class="error" disabled on:click={() => updateSchedules()}
                ><HoverField>
                    <span slot="content">
                        <span class="m-2">
                            자동 템플릿 찾기 조건에 맞는 템플릿이 없습니다.
                            시간표 불러오기를 실패했을 수 있습니다.</span
                        ></span
                    >템플릿을 찾지 못함
                </HoverField></button
            >
        {/if}
    {:else if $isError !== null}
        <button class="error" disabled>기타 문제: {$isError}</button>
    {/if}
</div>

<style lang="postcss">
    button {
        @apply w-24 h-16 text-sm;
    }
</style>
