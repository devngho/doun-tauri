import { invoke } from "@tauri-apps/api/core";
import { log } from "./logger";

export const invokers = {
	check_is_dev: {
		args: null,
		resp: {} as boolean,
	},
	save_data: {
		args: {} as { data: string },
		resp: {} as boolean,
	},
	load_data: {
		args: {} as { default: string },
		resp: {} as string,
	},
	play_audio: {
		args: {} as { path: string, volume: number, output: string },
		resp: null,
	},
	get_website_text: {
		args: {} as { url: string },
		resp: {} as string,
	},
	call_command_line: {
		args: {} as { command: string, args: string[] },
		resp: null
	},
	get_audio_outputs: {
		args: null,
		resp: [] as string[]
	},
	get_default_audio_output: {
		args: null,
		resp: ''
	},
	get_data_file_path: {
		args: null,
		resp: ''
	},
	make_zip: {
		args: {} as { path: string, files: string[], data: string },
		resp: null
	},
	load_zip: {
		args: {} as { path: string },
		resp: ''
	},
	is_first_launch: {
		args: null,
		resp: false
	},
} as const;

export async function invokeTS<T extends keyof typeof invokers>(
	invoker: T,
	args?: (typeof invokers)[T]["args"] | null | undefined
): Promise<(typeof invokers)[T]["resp"]> {
	const s = performance.now();
	//@ts-ignore
	let v = await invoke(invoker, args);
	log({
		message: `${invoker}`, data: {
			request: args,
			response: v,
			duration: `${Math.round(performance.now() - s)}ms`
		}
	})
	//@ts-ignore
	return v;
}
