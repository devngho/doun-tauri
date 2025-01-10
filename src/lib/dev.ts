import { get, writable, type Writable } from "svelte/store";

export let isDev: Writable<boolean> = writable(false);