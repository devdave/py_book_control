import {
  localStorageColorSchemeManager,
  createTheme,
  MantineProvider,
  Textarea,
} from "@mantine/core";

import { ReactNode, useEffect } from "react";
import { ModalsProvider } from "@mantine/modals";
import { useAppContext } from "@src/App.context";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useAppContext();

  console.log("Settings: ", settings);

  const colorSchemeManager = localStorageColorSchemeManager({
    key: "bookapp_color_scheme",
  });

  const [fontName] = settings.makeState("fontName");
  const [fontSize] = settings.makeState("fontSize");
  const [fontWeight] = settings.makeState("fontWeight");
  const [lineHeight] = settings.makeState("lineHeight");

  const safeFont = fontName || "Calibre";

  const theme = createTheme({
    components: {
      Textarea: Textarea.extend({
        styles: {
          root: {
            fontFamily: `"${safeFont}"`,
            fontSize: `${fontSize}px`,
            fontWeight,
            lineHeight: `${lineHeight}%`,
            textAlign: "justify",
            whiteSpace: "pre-wrap",
          },
          input: {
            fontFamily: `"${safeFont}"`,
            fontSize: `${fontSize}px`,
            fontWeight,
            lineHeight: `${lineHeight}%`,
            textAlign: "justify",
            whiteSpace: "pre-wrap",
          },
        },
      }),
    },
  });

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--pbc-fontFamily", fontName || null);
    rootStyle.setProperty("--pbc-fontSize", fontSize?.toString() || null);
    rootStyle.setProperty("--pbc-fontWeight", fontWeight?.toString() || null);
    rootStyle.setProperty("--pbc-lineHeight", `${lineHeight?.toString()}%`);
  }, [fontName, fontSize, fontWeight, lineHeight]);

  return (
    <MantineProvider
      defaultColorScheme="dark"
      colorSchemeManager={colorSchemeManager}
      theme={theme}
    >
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}
