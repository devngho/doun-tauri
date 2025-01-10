import type { SvelteComponentTyped } from "svelte";
import Index from "./pages/Index.svelte";
import { writable, type Writable } from "svelte/store";
import Info from "./pages/Info.svelte";
import Licenses from "./pages/Licenses.svelte";
import Template from "./pages/Template.svelte";
import TemplateList from "./pages/TemplateList.svelte";
import TestRust from "./pages/TestRust.svelte";
import VolumeMixer from "./pages/VolumeMixer.svelte";
import Settings from "./pages/Settings.svelte";
import Guide from "./pages/Guide.svelte";
import { log } from "./logger";
import Migrate from "./pages/Migrate.svelte";
import Logs from "./pages/Logs.svelte";
import FirstStep from "./pages/introduce/FirstStep.svelte";
import AskAutoSelect from "./pages/introduce/AskAutoSelect.svelte";
import AskMigration from "./pages/introduce/AskMigration.svelte";
import SettingAutoSelect from "./pages/introduce/SettingAutoSelect.svelte";
import SettingDisplay from "./pages/introduce/SettingDisplay.svelte";
import SettingAudio from "./pages/introduce/SettingAudio.svelte";
import TemplateGuide from "./pages/introduce/TemplateGuide.svelte";
import GuideIntro from "./pages/introduce/Guide.svelte";
import TemplateNew from "./pages/TemplateNew.svelte";

export const pages: { [key: string]: { component: ConstructorOfATypedSvelteComponent } } = {
	"": {
		'component': Index
	},
	"info": {
		'component': Info
	},
	"license/apache-2.0": {
		'component': Licenses
	},
	"license/mit": {
		'component': Licenses
	},
	"template": {
		'component': TemplateList
	},
	"template[/].+": {
		'component': Template
	},
	"template-new": {
		'component': TemplateNew
	},
	"test-rust": {
		component: TestRust
	},
	"volume": {
		component: VolumeMixer
	},
	"settings": {
		component: Settings
	},
	"guide": {
		component: Guide
	},
	"migrate": {
		component: Migrate
	},
	"log": {
		component: Logs
	},
	"introduce0": {
		component: FirstStep
	},
	"introduce1": {
		component: AskMigration
	},
	"introduce2": {
		component: AskAutoSelect
	},
	"introduce3": {
		component: SettingAutoSelect
	},
	"introduce4": {
		component: SettingDisplay
	},
	"introduce5": {
		component: SettingAudio
	},
	"introduce6": {
		component: GuideIntro
	},
	"introduce7": {
		component: TemplateGuide
	}
} as const;

export function redirect(path: string) {
	log({ message: `Redirecting to ${path}` });
	history.pushState(null, "", path);
	window.dispatchEvent(new Event("popstate"));
}