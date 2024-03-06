import React, { useEffect, useRef, useState } from "react";
// import css file
import "./user.css";
// import user image
import userThree from "../public/images/user3.png";
// import useForm react hook for form validation
import { toast, ToastContainer } from "react-toastify";

import DataForm from './profile/dataForm';
import FriendsContainer from './friendsContainer'

import axios from 'axios'


const User = () => {

  const token = localStorage.getItem('user-login')
  
  const [me, setMe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // show/hide friends list modal state
  const [showModal, setShowModal] = useState(false);

  // preview profile image state
  const [imageUrl, setImageUrl] = useState("");
  const [imageProfile, setImageProfile] = useState(null);

  const [image, setImage] = useState(null);

  // starting with change page title
  useEffect(() => {

    const getMe = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/me`, {
          headers: { Authorization: token },
        });
        setMe(res.data);
        setIsLoading(false);
        setImageProfile( res.data.profile.length>0?res.data.profile[0] :null )
      } catch (err) {
        console.error(err);
      }
    };

    document.title = `${process.env.REACT_APP_NAME} | Profile`;
    getMe();
  }, []);
  // enable force dark mode by chrome browser
  const handleSearch = () => {
    alert(
      'To enable dark mode in this app : .\n 1 : Write in your browser url : browser-type , exp : "chrome://flags" .\n 2 : In saerch area write "Auto dark mode" .\n 3 : Choose the 4th option .\n 4 : Relaunch chrome .\n NB : if you want to disable dark mode : repeat the same steps and turn "Auto dark mode" to "Default"'
    );
  };
  
  
  // get input image by refrence to clear value after change
  const profileImageInput = useRef(null);
  // display profile image func

  const showProfileImage = (e) => {
    // get input file value
    const selectedImage = e.target.files[0];
    // push image src inside file url state
    if (selectedImage && selectedImage.size) {
      setImage(selectedImage)
      setImageUrl(URL.createObjectURL(selectedImage));

      // clear input value
      if (profileImageInput.current) profileImageInput.current.value = null;
    }
  };

  const removeImageProfile = async()=>{
    try {
        const res = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URI}/users/removeProfile`,{}, {
          headers: { Authorization: token },
        });

        setImageProfile( meprofile.length>=1 ?me.profile[1] :null )
      setImageUrl("")
      toast.success(res.data.message);

    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  }


  // chek if a spam for reset password
  const spamPassword = "http://localhost:3000/Messenger#/login/reset-password";
  useEffect(() => {
    if (window.location.href === spamPassword) {
      toast.error(
        "An action for trying to access reset-password page please if this was you  change it from here or if not please update you account password",
        {
          autoClose: false,
        }
      );
    }
  }, []);


  // user logout btn func
  const logOut = () => {
    // update user token from local storage
    localStorage.setItem("user-login", null);
    // redirect user to login page
    window.location.reload();
  };


  //update user image profile
  const updateProfileImage = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', image);

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URI}/users/profile`, formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
          }
        });
      setImageProfile(imageUrl)
      setImageUrl("")
      toast.success(res.data.message);

    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }

  }

  if (isLoading) {
    return (
      <div className="details-loader">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

    )
  }



  return (
    <>
      <ToastContainer />

      <div className="user-container container-fluid">
        <div className="profile-content">
          <h5 className="fw-bold">
            <i className="fas fa-qrcode text-primary"></i> Profile
          </h5>
          <div className="content">
            <h5>Profile informations :</h5>
            <p>update your account profile's informations and email address</p>

            {/* user profile image */}
            <div className="d-flex flex-row justify-content-between align-items-center friends-list">
              <div className="user-profile-img">
                <img
                  src={imageProfile ? imageProfile : userThree}
                  className={
                    imageUrl
                      ? "d-none"
                      : "profile-avatar shadow-4-strong p-1 me-1"
                  }
                  alt="chat"
                />
                {/* absolute section to show input file value start */}
                {/* check if already user choose an image */}
                {imageUrl && (
                  <form className="absolute-preview-image-section">
                    {/* input file image display here */}
                    <img
                      src={imageUrl}
                      className=" profile-preview-image shadow-4-strong p-1 ms-4"
                      alt="preview"
                    />
                    {/* set or cancel options */}
                    <div className="d-flex flex-row  justify-content-between align-items-center gap-2">
                      <button
                        type="submit"
                        className="btn btn-light  shadow-2  btn-floating fs-6 p-0"
                        onClick={(event) => {
                          updateProfileImage(event);
                        }}
                      >
                        <i className="fas fa-circle-check  text-success"></i>
                      </button>

                      <button
                        className=" btn btn-light btn-floating p-2 p-0 shadow-2 text-danger fs-6"
                        onClick={() => {
                          setImageUrl("");
                        }}
                      >
                        <i className="fas fa-circle-xmark"></i>
                      </button>
                    </div>
                  </form>
                )}


                {/* absolute section to show input file value end */}
              </div>
              <div className="d-flex flex-row justify-content-center align-items-center gap-2">
                <span
                  className="text-primary p-2 shadow-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  <i className="fas fa-list"></i> friends list
                </span>
                <span
                  className="p-2"
                  style={{ cursor: "pointer" }}
                  onClick={handleSearch}
                >
                  <i
                    className="far fa-moon text-warning bg-dark p-2 d-flex justify-content-center align-items-center fs-5"
                    style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                  ></i>
                </span>
              </div>
            </div>

            {/* select or remove current image */}
            <div className="d-flex flex-column flex-lg-row flex-md-row justify-content-center align-items-start gap-2 change-image">
              <label
                htmlFor="file"
                className="btn btn-transparent text-dark remove-select"
              >
                Select new photo
              </label>
              <button className="btn btn-danger text-light remove-select"
              onClick = {removeImageProfile}
              disabled={imageProfile ? false : true}
              >
                Remove photo
              </button>
              <input
                type="file"
                id="file"
                className="d-none"
                ref={profileImageInput}
                onChange={showProfileImage}
              />
            </div>
            <hr />

           {/*user data and password */}
            <DataForm user={me} />


            {/* friends list area start */}
            <div
              className={
                showModal ? "friends-list-parent show" : "friends-list-parent"
              }
            >
              <div className="d-flex flex-row justify-content-between align-items-center">
                <span className="text-primary">
                  <i className="fas fa-user-plus"></i> Friends list
                </span>
                <i
                  className="fas fa-xmark close-modal"
                  onClick={() => {
                    setShowModal(false);
                  }}
                ></i>
              </div>
              <hr />
              {/* friends list container */}

              <FriendsContainer />
              
            </div>
            {/* friends list area end */}
          </div>
          {/* Logout btn */}

          <div className="logout-section">
            <p className="mt-3 fw-bold">Logout :</p>
            <button className="Btn" onClick={logOut}>
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path
                    d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9
     406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 
     14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 
     256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64
      0c17.7 0 32 
    14.3 32 32s-14.3 32-32 32z"
                  ></path>
                </svg>
              </div>
              <div className="text">Logout</div>
            </button>
          </div>
        </div>
      </div>
    </>

  );
};

export default User;