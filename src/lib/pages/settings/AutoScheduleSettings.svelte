<script lang="ts">
    import { fadeSlide } from "../../transition";
    import { settings } from "../../store";
    import { getDayFromAPI } from "../../schedule";
    import { log } from "../../logger";
    import { onMount } from "svelte";
    import SettingRow from "./SettingRow.svelte";

    let schoolSearchQuery = "";
    let folded = true;
    let req: Promise<
        {
            ATPT_OFCDC_SC_CODE: string;
            ATPT_OFCDC_SC_NM: string;
            SD_SCHUL_CODE: string;
            SCHUL_NM: string;
            ORG_RDNMA: string;
            SCHUL_KND_SC_NM: string;
        }[]
    > | null = null;
    let school: {
        ATPT_OFCDC_SC_CODE: string;
        ATPT_OFCDC_SC_NM: string;
        SD_SCHUL_CODE: string;
        SCHUL_NM: string;
        ORG_RDNMA: string;
        SCHUL_KND_SC_NM: string;
    } | null = null;
    let day: { maxPeriod: number } | null = null;

    async function getSchoolInfo(query: string) {
        const result = await fetch(
            `https://open.neis.go.kr/hub/schoolInfo?KEY=${$settings.autoSchedule.apiKey}&Type=json&SCHUL_NM=${query}`,
        )
            .then((response) => response.json())
            .then(
                (json) =>
                    json.schoolInfo[1].row as {
                        ATPT_OFCDC_SC_CODE: string;
                        ATPT_OFCDC_SC_NM: string;
                        SD_SCHUL_CODE: string;
                        SCHUL_NM: string;
                        ORG_RDNMA: string;
                        SCHUL_KND_SC_NM: string;
                    }[],
            );
        return result;
    }

    async function getSchoolInfoFromId() {
        return fetch(
            `https://open.neis.go.kr/hub/schoolInfo?KEY=${$settings.autoSchedule.apiKey}&Type=json&ATPT_OFCDC_SC_CODE=${$settings.autoSchedule.eduOfficeCode}&SD_SCHUL_CODE=${$settings.autoSchedule.schoolCode}`,
        )
            .then((response) => response.json())
            .then(
                (json) =>
                    json.schoolInfo[1].row as {
                        ATPT_OFCDC_SC_CODE: string;
                        ATPT_OFCDC_SC_NM: string;
                        SD_SCHUL_CODE: string;
                        SCHUL_NM: string;
                        ORG_RDNMA: string;
                        SCHUL_KND_SC_NM: string;
                    }[],
            )
            .then((v) =>
                v.filter(
                    (s) =>
                        s.SD_SCHUL_CODE === $settings.autoSchedule.schoolCode &&
                        s.ATPT_OFCDC_SC_CODE ===
                            $settings.autoSchedule.eduOfficeCode,
                ),
            );
    }

    onMount(() => {
        getSchoolInfoFromId().then((v) => {
            if (v.length === 1) school = v[0];
            else school = null;
            schoolSearchQuery = school?.SCHUL_NM ?? "";
        });

        getDayFromAPI().then((v) => {
            day = v;
        });
    });

    let schoolMismatch = false;

    $: {
        let result = false;
        if (school !== null) {
            switch (school.SCHUL_KND_SC_NM) {
                case "초등학교":
                    result = $settings.autoSchedule.schoolType !== "elementary";
                    break;
                case "중학교":
                    result = $settings.autoSchedule.schoolType !== "middle";
                    break;
                case "고등학교":
                    result = $settings.autoSchedule.schoolType !== "high";
                    break;
            }
        }
        schoolMismatch = result;
    }
</script>

<h2 class="text-2xl mt-2">자동 템플릿</h2>
<ul>
    <SettingRow
        selector={{
            type: "select",
            visual: "button",
            fields: [
                { id: "true", name: "활성화" },
                { id: "false", name: "비활성화" },
            ],
        }}
        value={$settings.autoSchedule.enabled ? "true" : "false"}
        on:change={(e) => {
            $settings.autoSchedule.enabled = e.detail.value === "true";
        }}
    >
        <span slot="name">자동 템플릿 찾기</span>
        <span slot="description"
            >시간표나 요일, 특정일 조건에 따라 자동으로 템플릿을 변경합니다.</span
        >
    </SettingRow>
    {#if $settings.autoSchedule.enabled === true}
        <SettingRow
            selector={{
                type: "text",
            }}
            value={$settings.autoSchedule.apiKey}
            on:change={(e) => {
                $settings.autoSchedule.apiKey = e.detail.value;
            }}
            inputStyle="w-96"
        >
            <span slot="name">나이스 API 키</span>
            <span slot="description"
                >시간표를 가져오기 위해 사용하는 나이스 API 키입니다. <a
                    href="https://open.neis.go.kr/portal/mainPage.do"
                    target="_blank">이 페이지</a
                >에서 'OPEN API 활용신청'을 통해 인증키를 발급받으세요.</span
            >
        </SettingRow>
        <li>
            <div>
                학교 설정
                <p class="text-gray-500">
                    시간표를 가져올 학교를 설정합니다.
                    <span class="text-primary">
                        {#if school !== null}
                            {school.SCHUL_NM}로 설정되어 있어요. 오늘은 {day?.maxPeriod ??
                                "알 수 없음"}교시에요.
                        {:else}
                            학교가 설정되지 않았어요.
                        {/if}
                    </span>
                </p>
            </div>
            <div class="flex-grow" />

            <form
                on:submit={(e) => {
                    req = getSchoolInfo(schoolSearchQuery);
                    e.preventDefault();

                    false;
                }}
                name="학교 검색"
            >
                <input
                    type="text"
                    placeholder="학교 이름"
                    bind:value={schoolSearchQuery}
                    class="bg-gray-300 dark:bg-gray-900 rounded px-2 w-64 h-full"
                />
                <button class="h-full" type="submit">검색</button>
            </form>
        </li>
        {#if req !== null}
            {#await req then res}
                <ul class="mt-2">
                    {#each res as s}
                        <li in:fadeSlide>
                            <div>
                                {s.SCHUL_NM}({s.SCHUL_KND_SC_NM})
                                <p class="text-gray-500">
                                    {s.ORG_RDNMA}
                                </p>
                                <p class="text-gray-500">
                                    {s.ATPT_OFCDC_SC_NM}
                                </p>
                            </div>
                            <div class="flex-grow" />
                            <button
                                on:click={() => {
                                    (async () => {
                                        $settings.autoSchedule.eduOfficeCode =
                                            s.ATPT_OFCDC_SC_CODE;
                                        $settings.autoSchedule.schoolCode =
                                            s.SD_SCHUL_CODE;
                                        switch (s.SCHUL_KND_SC_NM) {
                                            case "초등학교":
                                                $settings.autoSchedule.schoolType =
                                                    "elementary";
                                                $settings.autoSchedule.defaultPeriodTime = 40;
                                                break;
                                            case "중학교":
                                                $settings.autoSchedule.schoolType =
                                                    "middle";
                                                $settings.autoSchedule.defaultPeriodTime = 45;
                                                break;
                                            case "고등학교":
                                                $settings.autoSchedule.schoolType =
                                                    "high";
                                                $settings.autoSchedule.defaultPeriodTime = 50;
                                                break;
                                        }
                                        req = null;
                                        folded = false;
                                        await getSchoolInfoFromId().then(
                                            (v) => {
                                                if (v.length === 1)
                                                    school = v[0];
                                                else school = null;
                                                schoolSearchQuery =
                                                    school?.SCHUL_NM ?? "";
                                            },
                                        );

                                        await getDayFromAPI().then((v) => {
                                            day = v;
                                        });

                                        log({ message: "school set" });
                                    })();
                                }}>선택</button
                            >
                        </li>
                    {/each}
                </ul>
            {:catch}
                <p class="text-red-500" in:fadeSlide>
                    학교를 찾을 수 없습니다. API 키가 올바른지, 검색 내용이
                    올바른지 확인하세요.
                </p>
            {/await}
        {/if}
        <button
            class="text-gray-500 text-sm"
            on:click={() => {
                folded = !folded;
            }}
            >상세 정보 {#if folded}▲{:else}▼
            {/if}</button
        >
        {#if !folded}
            <div transition:fadeSlide>
                <SettingRow
                    selector={{
                        type: "select",
                        visual: "button",
                        fields: [
                            { id: "elementary", name: "초등학교" },
                            { id: "middle", name: "중학교" },
                            { id: "high", name: "고등학교" },
                        ],
                    }}
                    value={$settings.autoSchedule.schoolType}
                    on:change={(e) => {
                        $settings.autoSchedule.schoolType = e.detail.value;
                        switch (e.detail.value) {
                            case "elementary":
                                $settings.autoSchedule.defaultPeriodTime = 40;
                                break;
                            case "middle":
                                $settings.autoSchedule.defaultPeriodTime = 45;
                                break;
                            case "high":
                                $settings.autoSchedule.defaultPeriodTime = 50;
                                break;
                        }
                    }}
                >
                    <span slot="name">학교 종류</span>
                    <span slot="description"
                        >시간표 템플릿을 찾기 위한 학교 종류입니다. {#if schoolMismatch}
                            <span class="text-red-500"
                                >설정한 학교 유형과 나이스에서 가져온 학교 유형({school?.SCHUL_KND_SC_NM})이
                                다릅니다. 설정된 학교 유형을 확인하세요.</span
                            >
                        {/if}</span
                    >
                </SettingRow>
                <SettingRow
                    selector={{
                        type: "text",
                    }}
                    inputStyle="w-64"
                    value={$settings.autoSchedule.eduOfficeCode}
                    on:change={(e) => {
                        $settings.autoSchedule.eduOfficeCode = e.detail.value;
                    }}
                >
                    <span slot="name">시도교육청코드</span>
                    <span slot="description"
                        >시간표를 가져오기 위해 사용하는 시도교육청 코드입니다.</span
                    >
                </SettingRow>
                <SettingRow
                    selector={{
                        type: "text",
                    }}
                    inputStyle="w-64"
                    value={$settings.autoSchedule.schoolCode}
                    on:change={(e) => {
                        $settings.autoSchedule.schoolCode = e.detail.value;
                    }}
                >
                    <span slot="name">학교 행정표준코드</span>
                    <span slot="description"
                        >시간표를 가져오기 위해 사용하는 학교
                        행정표준코드입니다.</span
                    >
                </SettingRow>
                <SettingRow
                    selector={{
                        type: "number",
                        unit: "분",
                    }}
                    value={$settings.autoSchedule.defaultPeriodTime}
                    on:change={(e) => {
                        $settings.autoSchedule.defaultPeriodTime =
                            e.detail.value;
                    }}
                >
                    <span slot="name">1교시 길이</span>
                    <span slot="description"
                        >시간표 템플릿을 찾기 위한 1교시의 길이입니다.
                        기본적으로 초/중/고등학교에 따라 각각 40/45/50분으로
                        설정됩니다.</span
                    >
                </SettingRow>
            </div>
        {/if}
    {/if}
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
