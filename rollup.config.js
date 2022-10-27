import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

export default {
  input: 'src/index.js',
  output: {
    name: 'boundle',
    dir: 'dist',
    format: 'umd',
  },
  plugins: [
    commonjs(),
    injectProcessEnv({
      NODE_ENV: 'production',
    }),
    nodeResolve(),
  ]
}