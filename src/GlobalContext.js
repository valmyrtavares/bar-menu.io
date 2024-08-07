import React from "react";

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState("");
  const [id, setId] = React.useState("");
  const [styles, setStyles] = React.useState({
    btnColor: "#b02121",
    secundaryBgColor: "#b02121",
    bgColor: "#b02121",
    fontColor: "rgb(230, 235, 230)",
    titleFontColor: "#bd2828",
    titleFont: "Arial",
    textFont: "sans serif",
  });

  React.useEffect(() => {
    console.log("Updated styles in GlobalContext:", styles);
  }, [styles]);

  return (
    <GlobalContext.Provider
      value={{ image, setImage, id, setId, styles, setStyles }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
