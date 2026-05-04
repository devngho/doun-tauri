<script lang="ts">
  interface Props {
    hidden?: boolean;
    selector:
      | {
          type: "select";
          visual: "button" | "select";
          fields: {
            id: string;
            name: string;
          }[];
        }
      | {
          type: "text";
        }
      | {
          type: "number";
          unit: string;
        };
    value: string | number;
    inputStyle?: string;
    name?: import("svelte").Snippet;
    description?: import("svelte").Snippet;
    change?: (value: string | number) => void;
  }

  let {
    hidden = false,
    selector,
    value = $bindable(),
    inputStyle = "w-24",
    name,
    description,
    change,
  }: Props = $props();
</script>

{#if !hidden}
  <li>
    <div>
      {@render name?.()}
      <p class="text-gray-500">
        {@render description?.()}
      </p>
    </div>
    <div class="flex-grow"></div>
    {#if selector.type === "select"}
      {#if selector.visual === "button"}
        {#each selector.fields as field}
          <button
            class={value === field.id ? "" : "unselected"}
            onclick={() => {
              change?.(field.id);
            }}>{field.name}</button
          >
        {/each}
      {:else if selector.visual === "select"}
        <select
          bind:value
          class="bg-gray-300 dark:bg-gray-900 rounded px-2"
          onchange={(e) => {
            // dispatch("change", {
            //   //@ts-ignore
            //   value: e.target.value,
            // });
            //@ts-ignore
            change?.(e.target.value);
          }}
        >
          {#each selector.fields as field}
            <option value={field.id} selected={field.id === value}
              >{field.name}</option
            >
          {/each}
        </select>
      {/if}
    {:else if selector.type === "text"}
      <div class="bg-gray-100 dark:bg-gray-900 rounded flex items-center">
        <input
          type="text"
          {value}
          oninput={(e) => {
            //@ts-ignore
            change?.(e.target.value);
          }}
          class={"h-full bg-gray-100 dark:bg-gray-900 rounded px-2 " +
            inputStyle}
        />
      </div>
    {:else if selector.type === "number"}
      <div class="bg-gray-100 dark:bg-gray-900 rounded flex items-center">
        <input
          type="number"
          {value}
          oninput={(e) => {
            //@ts-ignore
            change?.(e.target.value);
          }}
          class={"text-right h-full bg-gray-100 dark:bg-gray-900 rounded px-2 " +
            inputStyle}
        />
        {selector.unit}
      </div>
    {/if}
  </li>
{/if}

<style lang="postcss">
  @reference "../../../app.css";

  li {
    margin-top: 0.5rem;
    @apply flex;
  }
  button {
    @apply w-24 p-2 mx-0.5 py-0.5;
  }
</style>
