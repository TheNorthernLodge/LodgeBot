import type {CommandInteraction} from 'discord.js';
import config from '../config.json';

/**
 * Check if the user who sent a command has the admin role
 * @param interaction The interaction of which to check if the user has admin permissions
 * @returns true if user has permission, else false
 */
const isAdmin = async (interaction: CommandInteraction) => {
	const member = interaction.guild?.members.cache.get(interaction.user.id);

	if (member?.roles.cache.has(config.roles.admin)) {
		return true;
	}

	return false;
};

export {
	isAdmin,
};
