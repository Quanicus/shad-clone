import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'component_bundle.js',
    format: 'esm'
  },
  plugins: [terser()]
};