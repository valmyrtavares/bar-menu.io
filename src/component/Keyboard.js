import React from "react";
import "../assets/styles/Keyboard.css";

const Keyboard = ({ addCharacter, closeKeyboard, id }) => {
  const handleCharacterClick = (char) => {
    addCharacter(char, id);
  };

  return (
    <div>
      <div className="character-container">
        <div className="character" onClick={() => handleCharacterClick("1")}>
          1
        </div>
        <div className="character" onClick={() => handleCharacterClick("2")}>
          2
        </div>
        <div className="character" onClick={() => handleCharacterClick("3")}>
          3
        </div>
        <div className="character" onClick={() => handleCharacterClick("4")}>
          4
        </div>
        <div className="character" onClick={() => handleCharacterClick("5")}>
          5
        </div>
        <div className="character" onClick={() => handleCharacterClick("6")}>
          6
        </div>
        <div className="character" onClick={() => handleCharacterClick("7")}>
          7
        </div>
        <div className="character" onClick={() => handleCharacterClick("8")}>
          8
        </div>
        <div className="character" onClick={() => handleCharacterClick("9")}>
          9
        </div>
        <div
          className="character"
          onClick={() => handleCharacterClick("clearField")}
        >
          Limpar
        </div>
        <div className="character" onClick={() => handleCharacterClick("0")}>
          0
        </div>

        <div
          className="character "
          onClick={() => handleCharacterClick("Bcksp")}
        >
          Bcksp
        </div>
        <div className="character enter" onClick={closeKeyboard}>
          Enter
        </div>
      </div>
    </div>
  );
};
export default Keyboard;
