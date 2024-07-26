import React from "react";
import { app } from "../config-firebase/firebase.js";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import "../assets/styles/requestModal.css";

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState("");
  const [userData, setUserData] = React.useState([]);
  const db = getFirestore(app);

  React.useEffect(() => {
    if (localStorage.hasOwnProperty("userMenu")) {
      const currentUserNew = JSON.parse(localStorage.getItem("userMenu"));
      setCurrentUser(currentUserNew.id);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      fetchUser();
    }
  }, [currentUser]);

  //Take just one item of user collection
  async function fetchUser() {
    const userDocRef = doc(db, "user", currentUser);
    const userDocSnap = await getDoc(userDocRef);
    setUserData(userDocSnap.data());
  }

  return (
    <section className="container-modal-request">
      <p>{userData.name}</p>
      {userData &&
        userData.request.map((item) => (
          <div className="individual-dishes">
            <div className="col-7">
              <h2 className="my-0">{item.name}</h2>
              <p className="comments">{item.finalPrice}</p>
            </div>
            <img
              className="col-5 img-thumbnail img-customize"
              src={item.image}
              alt="123"
            />
          </div>
        ))}
    </section>
  );
};
export default RequestModal;
