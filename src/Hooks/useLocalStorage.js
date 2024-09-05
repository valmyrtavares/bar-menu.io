import React from "react";

const useLocalStorage = (key, initial) => {
  const [state, setState] = React.useState(() => {
    const local = window.localStorage.getItem(key);
    return local !== null ? JSON.parse(local) : initial;
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default useLocalStorage;
