<script>
    // @ts-nocheck

    import { invoke } from "@tauri-apps/api/core";
    import { invokers } from "../tauri_invoker";

    let selectedInvokers = "";
    let invokerData = "";
    let res = "";
</script>

<article class="p-8 pt-24 w-screen" id={$$props._page}>
    <select
        class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2"
        bind:value={selectedInvokers}
    >
        {#each Object.entries(invokers) as i}
            <option>
                {i[0]}
            </option>
        {/each}
    </select>

    <input
        type="text"
        bind:value={invokerData}
        class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-1"
    />

    <button
        on:click={async () => {
            res = await invoke(
                selectedInvokers.trim(),
                JSON.parse(invokerData),
            );
        }}>보내</button
    >

    {res}
</article>
