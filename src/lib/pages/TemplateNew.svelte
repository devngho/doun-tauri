<script lang="ts">
  import { Dates, DayOfWeek } from "../daytime";
  import { redirect } from "../page";
  import { Schedules } from "../schedule";
  import { schedules } from "../store";
  import Template from "./Template.svelte";

  export let template: {
    name: string | undefined;
    dayOfWeek: DayOfWeek | undefined;
    timeTableCount: number | undefined;
    timeTableLength: number | undefined;
    specifyDate: Dates | undefined;
  } = {
    name: "새 템플릿",
    dayOfWeek: undefined,
    timeTableCount: undefined,
    timeTableLength: undefined,
    specifyDate: undefined,
  };

  function getDayweekName(dayOfWeek: string) {
    return DayOfWeek[dayOfWeek as keyof typeof DayOfWeek];
  }
</script>

<article class="p-8 pt-24 w-screen" id={$$props._page}>
  <h2 class="text-2xl">기본</h2>
  <p class="text-gray-500">
    템플릿의 이름이나, 시간표 유형 등을 지정해서 어떤 템플릿인지 구분하세요.
    자동으로 템플릿을 설정하는 데에도 사용됩니다.
  </p>
  <br />
  <span>템플릿 유형</span>
  <select
    class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-32"
    on:change={(e) => {
      if (e.target === null) return;
      //@ts-ignore
      template = {
        name: undefined,
        dayOfWeek: undefined,
        timeTableCount: undefined,
        timeTableLength: undefined,
        specifyDate: undefined,
      };
      //@ts-ignore
      switch (e.target.value) {
        case "name":
          template.name = "";
          break;
        case "dayOfWeek":
          template.dayOfWeek = DayOfWeek.월;
          break;
        case "timeTableCount":
          template.timeTableCount = 7;
          template.timeTableLength = 45;
          break;
        case "specifyDate":
          template.specifyDate = Dates.now();
          break;
      }
      console.log(template);
    }}
  >
    <option value="name">이름</option>
    <option value="dayOfWeek">요일</option>
    <option value="timeTableCount">시간표</option>
    <option value="specifyDate">날짜</option>
  </select>

  <br />

  <div class="flex w-full">
    {#if template?.name !== undefined || template?.specifyDate !== undefined || template?.dayOfWeek !== undefined || template?.timeTableCount !== undefined}
      <span class="pr-1">템플릿 정보</span>
    {/if}

    {#if template?.name !== undefined}
      <!-- svelte-ignore a11y-invalid-attribute -->
      <input
        type="string"
        class="mr-1 bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
        placeholder="새 템플릿 이름"
        bind:value={template.name}
      />
    {:else if template?.specifyDate !== undefined}
      <input
        type="date"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
        value={template.specifyDate.formatTime()}
        on:change={(e) => {
          if (e.target === null) return;
          //@ts-ignore
          template.specifyDate = Dates.parseDate(e.target.value);
        }}
      />
    {:else if template?.dayOfWeek !== undefined}
      <select
        bind:value={template.dayOfWeek}
        class=" bg-gray-100 dark:bg-gray-900 rounded px-2 w-64"
      >
        {#each Object.keys(DayOfWeek) as i}
          <option value={i}>{getDayweekName(i)}</option>
        {/each}
      </select>
    {:else if template?.timeTableCount !== undefined}
      <input
        type="number"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-32"
        bind:value={template.timeTableCount}
      />
      교시
      <input
        type="number"
        class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-32"
        bind:value={template.timeTableLength}
      /> 분
    {/if}
  </div>

  <br />

  {#if template?.name !== undefined || template?.specifyDate !== undefined || template?.dayOfWeek !== undefined || template?.timeTableCount !== undefined}
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      on:click={() => {
        const newId = crypto.randomUUID();
        schedules.update((v) => {
          v[newId] = new Schedules({ schedules: [], ...template });
          return v;
        });
        redirect(`/template/${newId}`);
      }}
    >
      만들기
    </button>
  {/if}
</article>

<style lang="postcss">
  button {
    @apply mx-2 flex-grow transition-all;
  }
</style>
