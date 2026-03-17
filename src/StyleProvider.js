import React, { useEffect, useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import { getBtnData, getOneItemColleciton } from "./api/Api";

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
        const stylesObj = await getOneItemColleciton(
          "styles",
          "Ka5eQA5um9W3vA5gyV70"
        );

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
