import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import esquery, { Literal } from "esquery";

const registry = new Set<string>();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "material-symbols",
      enforce: "pre",
      moduleParsed: function ({ id, ast }) {
        const nodes = esquery.query(
          ast,
          "CallExpression[callee.name='jsx'][arguments.0.name='Icon'] > .arguments > Property[key.name='children'] Literal",
        ) as unknown as Literal[];
        this.debug({ id, message: "value" });
        for (const { value } of nodes) {
          if (typeof value === "string") registry.add(value);
        }
      },
      transformIndexHtml: (html) =>
        html.replace(
          "__MATERIAL_SYMBOLS__",
          registry.size
            ? `icon_names=${Array.from(registry.values()).toSorted().join(",")}`
            : "", // dev mode, all icons
        ),
    },
  ],
});
