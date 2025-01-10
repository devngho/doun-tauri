<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let hidden: boolean = false;

    export let selector:
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
    export let value: string | number;
    export let inputStyle: string = "w-24";

    const dispatch = createEventDispatcher();
</script>

{#if !hidden}
    <li>
        <div>
            <slot name="name" />
            <p class="text-gray-500">
                <slot name="description" />
            </p>
        </div>
        <div class="flex-grow" />
        {#if selector.type === "select"}
            {#if selector.visual === "button"}
                {#each selector.fields as field}
                    <button
                        class={value === field.id ? "" : "unselected"}
                        on:click={() => {
                            dispatch("change", {
                                value: field.id,
                            });
                        }}>{field.name}</button
                    >
                {/each}
            {:else if selector.visual === "select"}
                <select
                    bind:value
                    class="bg-gray-300 dark:bg-gray-900 rounded px-2"
                    on:change={(e) => {
                        dispatch("change", {
                            //@ts-ignore
                            value: e.target.value,
                        });
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
                    on:input={(e) => {
                        dispatch("change", {
                            // @ts-ignore
                            value: e.target.value,
                        });
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
                    on:input={(e) => {
                        dispatch("change", {
                            // @ts-ignore
                            value: e.target.value,
                        });
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
    li {
        margin-top: 0.5rem;
        @apply flex;
    }
    button {
        @apply w-24 p-2 mx-0.5 py-0.5;
    }
</style>
