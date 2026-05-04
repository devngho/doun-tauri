<script lang="ts">
  import { getContext, setContext } from "svelte";
  import type { Schedules } from "../schedule";
  import Dropdown from "./Dropdown.svelte";
  import { dropdownContext } from "../dropdown";
  import { redirect } from "../page";

  interface Props {
    template: Schedules;
    idx: number;
  }

  let { template = $bindable(), idx }: Props = $props();

  const { close } = getContext<{
    close: (e?: MouseEvent) => void;
  }>(dropdownContext);
</script>

<button
  onclick={() => {
    template.schedules.splice(idx, 1);
    template.schedules = template.schedules;
  }}>✕ 삭제</button
>
<!--Duplicate button-->
<button
  onclick={() => {
    const s = template.schedules[idx].copy();
    //@ts-ignore
    s["_uuid"] = crypto.randomUUID();
    template.schedules.splice(idx + 1, 0, s);
    template.schedules = template.schedules;
    close();
  }}>🗍 복제</button
>
