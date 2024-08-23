import React, { useEffect, useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import { getBtnData } from "./api/Api";

const StyleProvider = ({ children }) => {
  const { setStyles } = useContext(GlobalContext);

  const convertToCSSVariables = (stylesObj) => {
    const cssVariables = {};
    for (const [key, value] of Object.entries(stylesObj)) {
      const cssVariableName = `--${key
        .trim()
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()}`;
      cssVariables[cssVariableName] = value;
    }
    return cssVariables;
  };

  useEffect(() => {
    async function fetchStyles() {
      try {
        const data = await getBtnData("styles");
        const stylesObj = data[1]; // Certifique-se de que o data[1] realmente contém o objeto de estilos

        setStyles(stylesObj);
        const cssVariables = convertToCSSVariables(stylesObj);
        // Apply styles to document root
        for (const [key, value] of Object.entries(cssVariables)) {
          document.documentElement.style.setProperty(key, value);
        }
      } catch (error) {
        console.error("Error fetching styles:", error);
      }
    }
    fetchStyles();
  }, [setStyles]);

  return <>{children}</>;
};

export default StyleProvider;
