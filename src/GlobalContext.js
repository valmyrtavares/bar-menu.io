import React from "react";

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState("");
  const [id, setId] = React.useState("");
  const [styles, setStyles] = React.useState({
    mainBgBtnColor: "rgba(255, 0, 0, 0.753)",
    colorTextButton: "rgb(22, 92, 172)",
    fontTextButton: "Ink Free",
  });

  React.useEffect(() => {}, [styles]);
  return (
    <GlobalContext.Provider
      value={{ image, setImage, id, setId, styles, setStyles }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
