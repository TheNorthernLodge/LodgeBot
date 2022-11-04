import type {ChatInputCommand} from '@sapphire/framework';
import {Command} from '@sapphire/framework';
import {toWords} from 'number-to-words';
import emoji from 'node-emoji';
import config from '../config.json';
import {isAdmin} from '../utils';

export class PollCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'poll',
			description: 'Create a poll to question the community.',
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'description',
					type: 'STRING',
					description: 'The description of the poll. What are the users voting on?',
					required: true,
				},
				{
					name: 'choices',
					type: 'STRING',
					description: 'The choices the user is able to select from, separated with commas. (Min: 1, Max: 9)',
					required: true,
				},
				{
					name: 'mention',
					type: 'MENTIONABLE',
					description: 'Who to notify about the poll.',
					required: false,
				},
			],
		}, {
			guildIds: [config.guildId],
			idHints: ['1037477130856042556'],
		});
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		await interaction.deferReply({ephemeral: true});

		if (!(await isAdmin(interaction))) {
			await interaction.editReply('You do not have permission to use this command! (Think this is an error? Contact an admin.)');
		}

		const {options} = interaction;

		const description = options.getString('description') ?? '';
		const choices = options.getString('choices')?.split(',') ?? [];
		const mention = options.getMentionable('mention') ?? '';

		const choicesTextArray: string[] = [];

		for (let i = 0; i < choices?.length && i <= 8; i++) {
			const choice = choices[i];

			choicesTextArray.push(`:${toWords(i + 1)}: | ${choice}`);
		}

		const message = await interaction.channel?.send({
			content: `${mention} New Poll:`, // eslint-disable-line @typescript-eslint/no-base-to-string
			embeds: [{
				title: 'Community Poll',
				description,
				fields: [{
					name: 'Choices:',
					value: choicesTextArray.join('\n'),
				}],
			}],
		});

		for (let i = 0; i < choices?.length && i <= 8; i++) {
			message?.react(emoji.find(toWords(i + 1))?.emoji ?? '').catch(error => {
				this.container.logger.error(error);
			});
		}

		await interaction.editReply({content: 'Poll created'});
	}
}
