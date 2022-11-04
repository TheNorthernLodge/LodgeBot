import {isMessageInstance} from '@sapphire/discord.js-utilities';
import type {ChatInputCommand} from '@sapphire/framework';
import {Command} from '@sapphire/framework';
import config from '../config.json';

export class PingCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'ping',
			description: 'Ping the bot to see if it\'s alive',
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
		}, {
			guildIds: [config.guildId],
			idHints: ['1035949115269464064'],
		});
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		const message = await interaction.reply({content: 'Ping?', ephemeral: true, fetchReply: true});

		// @ts-expect-error Message can be passed without error
		if (isMessageInstance(message)) {
			const diff = message.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);

			return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
		}

		return interaction.editReply('Failed to retrieve ping :(');
	}
}
