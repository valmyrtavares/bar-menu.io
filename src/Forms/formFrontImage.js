import React from 'react';
import Input from '../component/Input';
import { app, storage } from '../config-firebase/firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import '../assets/styles/form.css';

const FormFrontImage = () => {
  const [url, setUrl] = React.useState('');
  const [progress, setProgress] = React.useState('');

  //FIRESTORE
  const db = getFirestore(app);

  const onfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = `frontImage/${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_change',
        (snapshot) => {
          const progress = (snapshot.bytesTrans / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          console.log(url);
          setDoc(doc(db, 'frontImage', 'oIKq1AHF4cHMkqgOcz1h'), {
            image: downloadURL,
          })
            .then(() => {
              console.log('Document successfully updated !');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      );
    }
  };
  return (
    <>
      {' '}
      <Input
        id="uploadImage"
        label="Upload image"
        type="file"
        onChange={onfileChange}
      />
      <progress value={progress} max="100" />
      {url && <img className="image-preview" src={url} alt="Uploaded file" />}
    </>
  );
};

export default FormFrontImage;
