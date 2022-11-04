/* eslint-disable complexity */
import type {ChatInputCommand} from '@sapphire/framework';
import {Command} from '@sapphire/framework';
import config from '../config.json';
import {updateProjects} from '../listeners/send-project-embed';
import Project from '../models/project';
import {isAdmin} from '../utils';

export class ProjectCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'project',
			description: 'Manage projects',
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
			type: 'CHAT_INPUT',
			options: [
				{
					name: 'new',
					type: 'SUB_COMMAND',
					description: 'Create a new project',
					options: [{
						name: 'airport_icao',
						type: 'STRING',
						description: 'ICAO code of the project airport',
						required: true,
						minLength: 4,
						maxLength: 4,
					}, {
						name: 'airport_name',
						type: 'STRING',
						description: 'Full name of the project airport',
						required: true,

					}, {
						name: 'project_name',
						type: 'STRING',
						description: 'Code name for the project',
						required: true,

					}, {
						name: 'project_status',
						type: 'INTEGER',
						description: 'Status of the project (0 Planned -- 1 In Progress -- 2 Complete)',
						required: false,
						minValue: 0,
						maxValue: 2,
					}, {
						name: 'project_public',
						type: 'BOOLEAN',
						description: 'Whether or not the project is public',
						required: false,
					}],
				},
				{
					name: 'edit',
					type: 'SUB_COMMAND',
					description: 'Edit a current project',
					options: [{
						name: 'airport_icao',
						type: 'STRING',
						description: 'ICAO code of the project airport',
						required: true,
						minLength: 4,
						maxLength: 4,
					},
					{
						name: 'airport_name',
						type: 'STRING',
						description: 'Full name of the project airport',
						required: false,

					},
					{
						name: 'project_name',
						type: 'STRING',
						description: 'Code name for the project',
						required: false,

					},
					{
						name: 'project_status',
						type: 'INTEGER',
						description: 'Status of the project (0 Planned -- 1 In Progress -- 2 Complete)',
						required: false,
						minValue: 0,
						maxValue: 2,
					},
					{
						name: 'project_public',
						type: 'BOOLEAN',
						description: 'Whether or not the project is public',
						required: false,
					}],
				},
				{
					name: 'list',
					type: 'SUB_COMMAND',
					description: 'List current projects',
				},
			],
		}, {
			guildIds: [config.guildId],
			idHints: ['1036068895846567986'],
		});
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		await interaction.deferReply({ephemeral: true});

		if (!(await isAdmin(interaction))) {
			await interaction.editReply('You do not have permission to use this command! (Think this is an error? Contact an admin.)');
		}

		const {options} = interaction;

		let reply = '';

		switch (options.getSubcommand()) { // eslint-disable-line default-case
			case 'new':
				await Project.create({
					airport: {
						icao: options.getString('airport_icao')?.toUpperCase(),
						name: options.getString('airport_name'),
					},
					name: options.getString('project_name'),
					status: options.getInteger('project_status') ? options.getInteger('project_status') : 0,
					public: Boolean(options.getBoolean('project_public')),
				});

				reply = `Project ${options.getString('project_name')} created`;

				break;

			case 'edit':
				const airportIcao = options.getString('airport_icao')?.toUpperCase();

				const editProject = await Project.findOne({
					'airport.icao': airportIcao, // eslint-disable-line @typescript-eslint/naming-convention
				});

				if (!editProject) {
					return interaction.editReply({content: `Project with ICAO code: ${airportIcao} not found`});
				}

				if (editProject.airport?.name && options.getString('airport_name')) {
					editProject.airport.name = String(options.getString('airport_name'));
				}

				if (editProject.name && options.getString('project_name')) {
					editProject.name = String(options.getString('project_name'));
				}

				if (editProject.status && options.getInteger('project_status')) {
					editProject.status = Number(options.getInteger('project_status'));
				}

				if (options.getBoolean('project_public') !== null) {
					editProject.public = Boolean(options.getBoolean('project_public'));
				}

				await editProject.save();

				reply = `Project with ICAO code: ${airportIcao} edited successfully`;

				break;
			case 'list':
				const projects = await Project.find({});
				const projectText: string[] = [];

				for (const project of projects) {
					const contributers = [];

					for (const contributer of project.contributers) {
						contributers.push(`<@${contributer.discordId}>`);
					}

					projectText.push(`\`\`\`Project: ${project.name}\nAirport: ${project.airport?.name} (${project.airport?.icao})\nStatus: ${project.status === 0 ? 'Planned' : (project.status === 1 ? 'Under Production' : 'Completed')}\nContributers: ${contributers.length > 0 ? contributers.join(' ') : 'None'}\nPublicity: ${project.public ? 'Public' : 'Private'}\`\`\``);
				}

				reply = projectText.length > 0 ? `List of Projects:\n${projectText.join(' ')}` : 'List of Projects:\n*No Projects Found*';

				break;
		}

		await updateProjects(this.container.client);
		await interaction.editReply({content: reply});
	}
}
