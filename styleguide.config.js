module.exports = {
	// set your styleguidist configuration here
	title: 'Cargo Style Guide',
	// components: 'src/components/**/[A-Z]*.vue',
	// defaultExample: true,
	sections: [
		{
			name: 'Basic',
			components: 'src/components/basic/**/*.vue'
		},
		{
			name: 'Application',
			components: 'src/components/application/**/*.vue'
		},
		{
			name: 'Contract',
			components: 'src/components/contract/**/*.vue'
		},
		{
			name: 'Terms',
			sections: [
				{
					name: 'Cargo',
					components: 'src/components/terms/cargo/**/*.vue'
				},
				{
					name: 'Liability',
					components: 'src/components/terms/liability/**/*.vue'
				},
				{
					name: 'Common',
					components: 'src/components/terms/common/**/*.vue'
				},
			],
		},
		{
			name: 'Agreements',
			sections: [
				{
					name: 'Commission',
					components: 'src/components/agreements/commission/**/*.vue'
				},
				{
					name: 'Input',
					components: 'src/components/agreements/input/**/*.vue'
				},
			],
			components: 'src/components/agreements/*.vue'
		},
		{
			name: 'Dictionary',
			components: 'src/components/dictionary/**/*.vue'
		},
		{
			name: 'Statistics',
			components: 'src/components/statistics/**/*.vue'
		},
		{
			name: 'Other',
			components: 'src/components/*.vue'
		},
	],
	// webpackConfig: {
	//   // custom config goes here
	// },
	exampleMode: 'expand'
}
