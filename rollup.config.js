import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import svgo from 'rollup-plugin-svgo';
import postcss from 'rollup-plugin-postcss';

export default [
	{
    input: 'src/index.tsx',
		output: {
      name: 'index',
			file: pkg.main,
			format: 'cjs'
		},
		plugins: [
      resolve(),
      commonjs({
        include: ["node_modules/**"],
        namedExports: {
          "node_modules/react/react.js": [
            "Children",
            "Component",
            "PropTypes",
            "createElement"
          ],
          "node_modules/react-dom/index.js": ["render"]
        }
      }),
      typescript({
        rollupCommonJSResolveHack: true,
        exclude: "**/__tests__/**",
        clean: true
      }),
      svgo(),
      postcss({
        extract: true
      }),
		]
	},
];