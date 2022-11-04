import {model, Schema} from 'mongoose';

const requiredString = {
	type: String,
	required: true,
};

const requiredNumber = {
	type: Number,
	required: true,
};

const projectSchema = new Schema({
	airport: {
		icao: requiredString, // Eg. CYMM
		name: requiredString, // Fort McMurray
	},
	name: requiredString, // Eg. Jasper
	status: requiredNumber, // 0 Planned -- 1 In progress -- 2 Complete
	public: {
		type: Boolean,
		default: false,
	},
	contributers: [
		{
			discordId: String,
		},
	],
});

export default model('Project', projectSchema);
