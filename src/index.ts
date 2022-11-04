import {SapphireClient} from '@sapphire/framework';
import mongoose from 'mongoose';
import config from './config.json';

const client = new SapphireClient({intents: ['GUILDS', 'GUILD_MESSAGES']});

mongoose.connect(config.mongoUri)
	.then(() => {
		client.logger.info('Successfully connected to MongoDB');
	})
	.catch(error => {
		client.logger.error('Error connecting to MongoDB', error);
	});

client.login(config.discordToken)
	.catch(error => console.error);
