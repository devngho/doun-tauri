import { writable } from "svelte/store";
import { Time } from "./daytime";

export type Log = {message?: string, data?: any, time?: string}
export const logs = writable([] as Log[])

export function log(data: Log) {
    logs.update((v) => [...v, {...data, time: Time.now().formatTime() }])
    console.log({...data, time: Time.now().formatTime() })
}