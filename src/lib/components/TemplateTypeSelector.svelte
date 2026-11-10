<script lang="ts">
    import { metaOfType, typeOfMeta, type TemplateMeta, type TemplateType } from "../template";

    let { meta = $bindable() }: { meta: TemplateMeta } = $props();
</script>

<select
    class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-32"
    value={typeOfMeta(meta)}
    onchange={(e) => {
        meta = metaOfType(e.currentTarget.value as TemplateType);
    }}
>
    <option value="name">이름</option>
    <option value="dayOfWeek">요일</option>
    <option value="timeTableCount">시간표</option>
    <option value="specifyDate">날짜</option>
</select>
