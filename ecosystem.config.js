module.exports = {
	apps: [
		{
			name: "Source Code",
			script: "./dist",
			watch: true,
		},
		{
			name: "TypeScript Compiler",
			script: "yarn",
			args: "build:watch",
		},
	],
};
