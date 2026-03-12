import typescript from '@rollup/plugin-typescript';
import sourceMaps from 'rollup-plugin-sourcemaps';

const pkg = {
  main: 'dist/validated-changeset-webforms.umd.js',
  module: 'dist/validated-changeset-webforms.es5.js',
};
const libraryName = 'validatedChangesetWebforms';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: 'umd',
      sourcemap: true,
    },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  plugins: [typescript(), sourceMaps()],
};
