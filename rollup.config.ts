import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import nodeResolve from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';

import type { RollupOptions, WarningHandlerWithDefault } from 'rollup';

import pkg from './package.json';

const libraryHeader = `/*! ${pkg.name} v${pkg.version} ${new Date().toISOString().split("T")[0]} */`;
const useStrictHeader = "'use strict';";
const fileHeader = `${libraryHeader}\n${useStrictHeader}`;

const onwarn: WarningHandlerWithDefault = (warning, defaultHandler) => warning.code === 'CIRCULAR_DEPENDENCY' ? undefined : defaultHandler(warning);

const config: RollupOptions[] = [
	{
		input: 'src/timeline.ts',
		output: [
			{
				dir: 'dist',
				format: 'es',
				banner: fileHeader,
				sourcemap: true,
			},
			{
				file: pkg.main,
				format: 'cjs',
				banner: fileHeader,
				sourcemap: true,
			},
		],
		plugins: [
			esbuild(),
			nodeResolve(),
			visualizer({
				filename: 'dist/bundle-stats.html',
				sourcemap: true,
				gzipSize: true,
				brotliSize: true,
			}),
		],
		onwarn,
		watch: false,
	},
	{
		input: 'src/timeline.umd.ts',
		output: [
			{
				file: 'dist/timeline.umd.js',
				format: 'umd',
				name: 'timeline',
				banner: fileHeader,
				sourcemap: true,
			},
		],
		plugins: [
			esbuild(),
			nodeResolve(),
		],
		onwarn,
	},
	{
		input: 'src/timeline.umd.ts',
		output: [
			{
				file: 'dist/timeline.umd.min.js',
				format: 'umd',
				name: 'timeline',
				banner: useStrictHeader,
				sourcemap: false,
			},
		],
		plugins: [
			esbuild({
				minify: true,
			}),
			nodeResolve(),
		],
		onwarn,
		watch: false,
	},
	{
		input: 'src/timeline.ts',
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
