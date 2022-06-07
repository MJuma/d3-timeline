import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import nodeResolve from '@rollup/plugin-node-resolve';

import type { OutputPlugin, RollupOptions, WarningHandlerWithDefault } from 'rollup';

import pkg from './package.json';

const isProduction = process.env.BUILD === 'production';
const plugins: OutputPlugin[] = [
	esbuild({
		minify: isProduction,
	}),
	nodeResolve(),
];

const onwarn: WarningHandlerWithDefault = (warning, defaultHandler) => warning.code === 'CIRCULAR_DEPENDENCY' ? undefined : defaultHandler(warning);

const config: RollupOptions[] = [
	{
		input: 'src/timeline/timeline.umd.ts',
		output: [
			{
				banner: `// D3 Timeline v${pkg.version} - ${pkg.homepage}`,
				file: pkg.browser,
				format: 'umd',
				name: 'timeline',
				sourcemap: !isProduction,
			}
		],
		plugins,
		onwarn,
	},
	{
		input: 'src/timeline/timeline.ts',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
				sourcemap: !isProduction,
			},
			{
				file: pkg.module,
				format: 'es',
				sourcemap: !isProduction,
			},
		],
		plugins,
		onwarn,
		watch: false,
	},
	{
		input: 'src/timeline/timeline.ts',
		output: [
			{
				file: pkg.typings,
				format: 'es',
			},
		],
		plugins: [
			dts(),
		],
		onwarn,
		watch: false,
	}
];

export default config;
