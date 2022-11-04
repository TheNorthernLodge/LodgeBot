/* eslint-disable @typescript-eslint/ban-types */
import {Listener} from '@sapphire/framework';
import type {AnyChannel, Channel, Client, Message, MessageEditOptions, MessageOptions, MessagePayload, TextChannel} from 'discord.js';

import config from '../config.json';

/**
 * Replace a message, if no message, send a new one
 * @param channelID ID of the channel to manage the message
 * @param content The MessagePayload object of the message
 * @param client The client to send the message with
 */
const replaceMessage = async (channelID: string, content: any, client: Client) => {
	const channel: AnyChannel | null = await client.channels.fetch(channelID);

	if (!channel || channel === null || channel.type !== 'GUILD_TEXT') {
		throw new Error('Channel not found or not guild text channel');
	}

	try {
		const message = await channel.messages.fetch(channel.lastMessageId ? channel.lastMessageId : '');
		await message.edit(content);
	} catch {
		await channel.send(content);
	}
};

export class SendEmbedsListener extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: 'ready',
		});
	}

	public async run(client: Client) {
		await replaceMessage(config.channels.rules, {
			embeds: [
				{
					title: 'Rules',
					color: '#a74c20',
					description: 'As a member of The Northern Lodge Discord server, you must follow these rules:',
					fields: [
						{
							name: 'Rule 1: Test',
							value: 'This is a test rule',
						},
					],
					footer: {
						text: 'The Northern Lodge © 2022',
					},

				},
			],
		}, client);
		await replaceMessage(config.channels.welcome, {
			embeds: [
				{
					title: 'Welcome',
					color: '#a74c20',
					description: 'Welcome to The Northern Lodge Discord Server. A scenery design studio focusing on Canadian airports in Microsoft Flight Simulator 2022.',
					fields: [
						{
							name: 'Rules',
							value: `Please read the <#${config.channels.rules}> before participating in the community.`,
							inline: true,
						},
						{
							name: 'Project Directory',
							value: `See <#${config.channels.projectDirectory}> for a list of all of our projects.`,
						},
					],
					footer: {
						text: 'The Northern Lodge © 2022',
					},

				},
			],
		}, client);
	}
}

export {
	replaceMessage,
};
