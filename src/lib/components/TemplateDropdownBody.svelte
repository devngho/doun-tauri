<script lang="ts">
  import { getContext } from "svelte";
  import { dropdownContext, type DropdownContext } from "../dropdown";
  import type { Row } from "../template";

  let { rows = $bindable(), idx }: { rows: Row[]; idx: number } = $props();

  const { close } = getContext<DropdownContext>(dropdownContext);
</script>

<button onclick={() => rows.splice(idx, 1)}>✕ 삭제</button>
<!--Duplicate button-->
<button
  onclick={() => {
    rows.splice(idx + 1, 0, { ...rows[idx], id: crypto.randomUUID() });
    close();
  }}>🗍 복제</button
>
