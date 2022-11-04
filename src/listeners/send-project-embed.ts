import {Listener} from '@sapphire/framework';
import type {Client} from 'discord.js';
import project from '../models/project';
import config from '../config.json';
import {replaceMessage} from './send-static-embeds';

const updateProjects = async (client: Client) => {
	const fields = [];

	const projects = await project.find({});
	// Const projects: any[] = [];

	for (const project of projects) {
		if (project?.public) {
			const contributers = [];

			for (const contributer of project.contributers) {
				contributers.push(`<@${contributer.discordId}>`);
			}

			fields.push({
				name: `Project ${project.name}`,
				value: `Airport: *${project.airport?.name} (${project.airport?.icao})*
						Status: *${project.status === 0 ? 'Planned' : (project.status === 1 ? 'Under Production' : 'Completed')}*
						Contributers: *${contributers.length > 0 ? contributers.join(' ') : 'None'}*`,
				inline: true,
			});
		}
	}

	await replaceMessage(config.channels.projectDirectory, {
		embeds: [
			{
				title: 'Project Directory',
				color: '#a74c20',
				description: 'This is the Northern Lodge Project Directory. This is a list of all the different projects we are working on and their status.',
				fields: (projects.some(project => project.public) ? [...fields] : [{name: 'No Current Projects', value: 'There are no public projects to show'}]),
				footer: {
					text: 'The Northern Lodge © 2022',
				},

			},
		],
	}, client);
};

export class ProjectListener extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: 'ready',
		});
	}

	public run(client: Client) {
		setInterval(async () => {
			await updateProjects(client);
		}, 10_000);
	}
}

export {
	updateProjects,
};
