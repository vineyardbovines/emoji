/**
 * Babel config for the library build.
 *
 * bob picks this up because the commonjs/module targets in package.json pass
 * `configFile: true`. The React Compiler plugin runs before the RN-bob preset
 * so it sees original JSX/hooks syntax.
 */
module.exports = {
  presets: ["react-native-builder-bob/babel-preset"],
  plugins: [["babel-plugin-react-compiler", { target: "19" }]],
};
