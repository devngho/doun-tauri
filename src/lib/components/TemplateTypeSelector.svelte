<script lang="ts">
    import { Dates, DayOfWeek } from "../daytime";
    import type { Schedules } from "../schedule";

    export let template: Schedules;

    function getValue(template: Schedules) {
        if (template.name !== undefined) {
            return "name";
        } else if (template.specifyDate !== undefined) {
            return "specifyDate";
        } else if (template.dayOfWeek !== undefined) {
            return "dayOfWeek";
        } else if (template.timeTableCount !== undefined) {
            return "timeTableCount";
        }
    }

    $: value = getValue(template);
</script>

<select
    class="bg-gray-100 dark:bg-gray-900 rounded px-2 w-32"
    {value}
    on:change={(e) => {
        if (e.target === null) return;
        template.name = undefined;
        template.dayOfWeek = undefined;
        template.timeTableCount = undefined;
        template.timeTableLength = undefined;
        template.specifyDate = undefined;
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
        template = template;
    }}
>
    <option value="name">이름</option>
    <option value="dayOfWeek">요일</option>
    <option value="timeTableCount">시간표</option>
    <option value="specifyDate">날짜</option>
</select>
