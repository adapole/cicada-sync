import { GitService } from "@/services/gitService";

import { App, Modal } from "obsidian";

export default class UnmergedFilesView extends Modal {
	constructor(app: App, private gitService?: GitService) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.empty();

		this.contentEl.createEl("h3", {
			text: "Loading...",
			cls: "sync-title",
		});

		this.gitService?.getConflictingFiles().then((files) => {
			this.contentEl.empty();

			if (files.length > 0) {
				this.contentEl.createEl("h3", {
					text: "Please resolve the conflicts in the following files:",
					cls: "sync-title",
				});

				const list = this.contentEl.createEl("ul");

				files.forEach((file) =>
					list
						.createEl("li")
						.createEl("strong", {
							text: file,
							cls: "sync-conflicting-files",
						})
				);
			} else {
				this.contentEl.createEl("h3", {
					text: "No unmerged files to show!",
					cls: "sync-title",
				});
			}
		});
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
