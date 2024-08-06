import React, { useEffect, useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import { getBtnData } from "./api/Api";

const StyleProvider = ({ children }) => {
  const { setStyles } = useContext(GlobalContext);

  useEffect(() => {
    async function fetchStyles() {
      try {
        const data = await getBtnData("styles");
        const stylesObj = data[0]; // Assuming data[0] contains your styles
        console.log("Fetched styles from backend:", stylesObj);
        setStyles(stylesObj);

        // Apply styles to document root
        for (const [key, value] of Object.entries(stylesObj)) {
          const cssVariableName = `--${key.trim().replace("$", "")}`;
          document.documentElement.style.setProperty(cssVariableName, value);
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
