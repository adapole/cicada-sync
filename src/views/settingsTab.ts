import CicadaPlugin from "@/main";

import { App, PluginSettingTab, Setting } from "obsidian";

import os from "os";
import simpleGit, { SimpleGit } from "simple-git";

const GITHUB_ISSUE_LINK =
	"https://github.com/adapole/cicada-sync/issues/new/choose";
const SAMPLE_REPO = "git@github.com:adapole/obsidian-yaos.git";

export interface YaosSettings {
	deviceName: string;
	remoteRepo: string;
	basePath: string;
	branchName: string;
	syncImages: boolean;
	syncAudio: boolean;
	syncVideos: boolean;
	syncPdfs: boolean;
	syncOtherFiles: boolean;
	syncMainSettings: boolean;
	syncAppearanceSettings: boolean;
	syncThemesAndSnippets: boolean;
	syncHotkeys: boolean;
	syncCorePluginSettings: boolean;
	syncCommunityPluginSettings: boolean;
}

export const DEFAULT_YAOS_SETTINGS: YaosSettings = {
	deviceName: os.hostname(),
	remoteRepo: SAMPLE_REPO,
	basePath: __dirname,
	branchName: "main",
	syncImages: false,
	syncAudio: false,
	syncVideos: false,
	syncPdfs: false,
	syncOtherFiles: false,
	syncMainSettings: false,
	syncAppearanceSettings: false,
	syncThemesAndSnippets: false,
	syncHotkeys: false,
	syncCorePluginSettings: false,
	syncCommunityPluginSettings: false,
};

export default class YaosSettingTab extends PluginSettingTab {
	plugin: CicadaPlugin;
	private gitProvider: SimpleGit;

	constructor(app: App, plugin: CicadaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.gitProvider = simpleGit();
	}

	display() {
		const { containerEl } = this;

		containerEl.empty();

		this.addGeneralSection(containerEl);
		this.addGitSetup(containerEl);
	}

	private addGeneralSection(containerEl: HTMLElement) {
		new Setting(containerEl).setName("General").setHeading();
		this.addDeviceNameSetting(containerEl);
		this.addCreateIssueSetting(containerEl);
	}

	private addGitSetup(containerEl: HTMLElement) {
		new Setting(containerEl).setName("Setup Git").setHeading();
		this.addBranchName(containerEl);
		this.addRemoteRepoURL(containerEl);
	}

	private addDeviceNameSetting(el: HTMLElement) {
		new Setting(el)
			.setName("Device name")
			.setDesc(
				"This name will be displayed in the commit messages to indicate the sync source. Leave empty to use the default name."
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_YAOS_SETTINGS.deviceName)
					.setValue(this.plugin.settings.deviceName)
					.onChange(async (deviceName) => {
						this.plugin.settings.deviceName = deviceName;
						await this.plugin.saveSettings();
					})
			);
	}

	private addCreateIssueSetting(el: HTMLElement) {
		new Setting(el)
			.setName("Contact support")
			.setDesc(
				"If you run into any issues working with this plugin, please let us know by creating an issue on our GitHub page."
			)
			.addButton((button) =>
				button
					.setButtonText("Create issue")
					.setTooltip("Create an issue on GitHub")
					.setCta()
					.onClick(() =>
						self.open(GITHUB_ISSUE_LINK, "_blank", "norefferrer")
					)
			);
	}

	private addRemoteRepoURL(el: HTMLElement) {
		new Setting(el)
			.setName("Import repository")
			.setDesc(
				"If you want to import a vault from a remote repository, add the URL and Import to the directory you want."
			)
			.addText((text) =>
				text
					.setPlaceholder(SAMPLE_REPO)
					.setValue(this.plugin.settings.remoteRepo)
					.onChange(async (remoteRepo) => {
						this.plugin.settings.remoteRepo = remoteRepo;
						await this.plugin.saveSettings();
					})
			);
		new Setting(el)
			.setDesc("The local vault directory to link the remote repository.")
			.addText((text) =>
				text
					.setPlaceholder("C:/Users/")
					.setValue(this.plugin.settings.basePath)
					.onChange(async (basePath) => {
						this.plugin.settings.basePath = basePath;
						await this.plugin.saveSettings();
					})
			);

		new Setting(el).addButton((button) =>
			button
				.setButtonText("Import")
				.setTooltip("Import a remote repository")
				.setCta()
				.onClick(async () => {
					try {
						const remoteRepo = `${this.plugin.settings.remoteRepo}`;
						await this.gitProvider
							.clone(
								remoteRepo,
								`${this.plugin.settings.basePath}`
							)
							.fetch();
					} catch (error) {
						console.error(error);
					}
				})
		);
	}

	private addBranchName(el: HTMLElement) {
		new Setting(el)
			.setName("Select branch")
			.setDesc("Set the working branch.")
			.addText((text) =>
				text
					.setPlaceholder("main")
					.setValue(this.plugin.settings.branchName)
					.onChange(async (branchName) => {
						this.plugin.settings.branchName = branchName;
						await this.plugin.saveSettings();
					})
			);
		new Setting(el).addButton((button) =>
			button
				.setButtonText("Switch")
				.setTooltip("Switch to this branch")
				.setCta()
				.onClick(async () => {
					let git = simpleGit(this.plugin.settings.basePath);
					try {
						await git.checkoutBranch(
							`${this.plugin.settings.branchName}`,
							"HEAD"
						);
					} catch (error) {
						await git.checkout(
							`${this.plugin.settings.branchName}`
						);
					}
				})
		);
	}
}
