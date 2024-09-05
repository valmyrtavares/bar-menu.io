import React from "react";
import Input from "../../component/Input.js";
import "../../assets/styles/form.css";
import Title from "../../component/title.js";
import { auth } from "../../config-firebase/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Error from "../../component/error.js";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = React.useState(false);

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;
      localStorage.setItem("token", JSON.stringify(user.accessToken));
      navigate("/admin");

      //navigate("/admin");
    } catch (error) {
      setErrorMessage(true);
      console.log(error);
    }
  };

  return (
    <div className="container mt-5 p-3 bg-body-tertiar">
      <Title mainTitle="Login" />
      {errorMessage && (
        <Error
          setErrorPopup={setErrorMessage}
          error="Sua senha ou email estão incorretos"
        />
      )}
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="email"
          label="email"
          value={form.email}
          type="email"
          onChange={handleChange}
        />

        <Input
          id="password"
          label="Password"
          value={form.password}
          type="password"
          onChange={handleChange}
        />

        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}

export default Login;
