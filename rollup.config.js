import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import babel from '@rollup/plugin-babel';
import rollupTypescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
import { DEFAULT_EXTENSIONS } from '@babel/core';

import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
    {
      name: 'Sedum',
      file: pkg.umd,
      format: 'umd',
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    injectProcessEnv({
      NODE_ENV: 'production',
    }),
    rollupTypescript({
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      extensions: [
        ...DEFAULT_EXTENSIONS,
        '.ts'
      ],
    }),
    terser()
  ],
}