<script lang="ts">
  import { redirect, type PageProps } from "../page";
  import { Schedules } from "../schedule";
  import { schedules } from "../store";
  import { typeOfMeta, type TemplateMeta } from "../template";
  import TemplateTypeSelector from "../components/TemplateTypeSelector.svelte";
  import TemplateTypeInfo from "../components/TemplateTypeInfo.svelte";

  let props: PageProps = $props();

  let meta: TemplateMeta = $state({ name: "새 템플릿" });
  let hasType = $derived(typeOfMeta(meta) !== undefined);
</script>

<article class="p-8 pt-24 w-screen" id={props._page}>
  <h2 class="text-2xl">기본</h2>
  <p class="text-gray-500">
    템플릿의 이름이나, 시간표 유형 등을 지정해서 어떤 템플릿인지 구분하세요.
    자동으로 템플릿을 설정하는 데에도 사용됩니다.
  </p>
  <br />
  <span>템플릿 유형</span>
  <TemplateTypeSelector bind:meta />

  <br />

  <div class="flex w-full">
    {#if hasType}
      <span class="pr-1">템플릿 정보</span>
    {/if}

    <TemplateTypeInfo bind:meta numberWidth="w-32" />
  </div>

  <br />

  {#if hasType}
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onclick={() => {
        const newId = crypto.randomUUID();
        schedules.update((v) => {
          v[newId] = new Schedules({ schedules: [], ...meta });
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
  @reference "../../app.css";
  button {
    @apply mx-2 flex-grow transition-all;
  }
</style>
