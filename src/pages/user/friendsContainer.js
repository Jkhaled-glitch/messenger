import React, { useEffect, useRef, useState } from "react";

// import user image
import userThree from "../public/images/user3.png";
// import useForm react hook for form validation
import { toast } from "react-toastify";

import axios from 'axios'


const FriendsContainer = () => {

  const token = localStorage.getItem('user-login')


  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [suggestions, setSuggestions] = useState([])

  // set states for friends list and friends request to toggle show
  const [showRequestList, setShowRequestList] = useState("friends-list");

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState(null)

  // preview image src state
  const [fileUrl, setFileUrl] = useState("");

  // file image src state
  const [file, setFile] = useState(null);

  // content post state
  const [content, setContent] = useState(null);

  // get input file for post image
  const fileInput = useRef(null);

  // get post btn
  const postBtn = useRef(null);


  const getData = async () => {
    const headers = { Authorization: token };
    try {

      // Fetch friends data
      const friendsResponse = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/getFriends`, { headers });
      setFriends(friendsResponse.data);

      // Fetch friend requests data
      const requestsResponse = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/getRequests`, { headers });
      setRequests(requestsResponse.data);

      // Fetch friend suggestions data
      const suggestionsResponse = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/getSuggestions`, { headers });
      setSuggestions(suggestionsResponse.data);

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsLoading(false);
      setError(err.message)
    }
  }

  const handleAddPost = async (e) => {
    e.preventDefault();
    let type = 'mixed';
    if (!file) {
      type = 'mixed'
    }

    const formData = new FormData();
    formData.append('contentType', type); // Get type for the post
    formData.append('contentText', content); // Get content for the post
    file && formData.append('file', file); // Append file image to formData

    const headers = {
      'Authorization': token,
      'Content-Type': 'multipart/form-data',
    };

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts`, formData, { headers });
      toast.success("Post created successfully!")
      setFile(null)
      setFileUrl("")
      setContent("")
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
    console.log('submit post')
  }





  // preview image from input file in create post
  const displayPostImage = (event) => {
    // get input file value
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      //update file state 
      setFile(selectedFile)
      // Create object URL for the selected file
      const objectUrl = URL.createObjectURL(selectedFile);
      // push image src inside file url state
      setFileUrl(objectUrl);
      // remove disabled class from submit btn
      const postBTN = postBtn.current;
      postBTN.classList.remove("disabled");
    }
  };
  // remove disble class for submit post btn
  const removeDisabledClass = (e) => {
    const postBTN = postBtn.current;
    // remove disabled class from submit btn
    if (e.target.value.trim().length !== 0) {
      postBTN.classList.remove("disabled");
    } else if (
      e.target.value.trim().length === 0 &&
      fileInput.current.value !== ""
    ) {
      postBTN.classList.remove("disabled");
    } else {
      postBTN.classList.add("disabled");
    }
  };


  const handleChange = (e) => {
    // remove disble class for submit post btn
    removeDisabledClass(e);
    setContent(e.target.value);
  }


  // Remove post image btn
  const closePostImage = (e) => {
    setFile(null);
    setFileUrl("");
    const inputFile = fileInput.current;
    if (inputFile) inputFile.value = "";
    postBtn.current.classList.add("disabled");
  };

  useEffect(() => {
    getData()
  }, [])



  if (isLoading) {
    return (
      <div class="details-loader">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>

    )
  }
  if (error) {
    return (
      <div class="details-loader">
        {error}
      </div>

    )
  }
  return (
    <div className="friends-list-container">
      <div className="d-flex flex-row justify-content-between align-items-center gap-2">
        <button
          className={
            showRequestList === "friends-list"
              ? "lists-nav-btns active"
              : "lists-nav-btns"
          }
          onClick={() => {
            setShowRequestList("friends-list");
          }}
        >
          Friends list
        </button>
        <button
          className={
            showRequestList === "requests-list"
              ? "lists-nav-btns active"
              : "lists-nav-btns"
          }
          onClick={() => {
            setShowRequestList("requests-list");
          }}
        >
          Requests
        </button>
        <button
          className={
            showRequestList === "create-post"
              ? "lists-nav-btns active"
              : "lists-nav-btns"
          }
          onClick={() => {
            setShowRequestList("create-post");
          }}
        >
          Create post
        </button>
      </div>
      {/* lists are start*/}
      <div className="lists-area">
        {/* user friends list */}
        <div
          className={
            showRequestList === "friends-list"
              ? "user-friends-list active"
              : "user-friends-list"
          }
        >
          <p className="fw-bold text-dark mb-2">Friends :</p>
          {/* friends */}
          {friends.map(friend => {

            return (
              <div key={friend._id}
                className="chat mb-2 gap-auto" style={{ width: "100%" }} >
                <img
                  src={friend.profile.length > 0 ? friend.profile[0] : userThree}
                  className="chat-avatar shadow-4-strong p-1"
                  alt="chat"
                />
                <div className="chat-details w-100 text-start">
                  <strong className="mt-2">{friend.name+' '+friend.lastName}</strong>
                  <p>
                    <i class="fas fa-check text-success icon-user-list"></i>{" "}
                    friend
                  </p>
                </div>
                <i class="far fa-trash-can text-danger icon-user-list"></i>
              </div>
            )
          })
          }


        </div>
        {/* user request list */}
        <div
          className={
            showRequestList === "requests-list"
              ? "user-requests-list active"
              : "user-requests-list"
          }
        >
          <div className="answer-friends-request-area w-100">
            <p className="fw-bold mb-2">Friends requests :</p>
            {/* requests */}
            {requests.map(request => {
               return (
              <div key={request._id}
                className="friends-section gap-auto mb-2 "
                style={{ width: "100%" }}
              >
                <img
                  src={request.profile.length > 0 ? request.profile[0] : userThree}
                  className="chat-avatar shadow-4-strong p-1"
                  alt="chat"
                />
                <div className="chat-details w-100 text-start">
                  <strong className="mt-2">{request.name+' '+request.lastName}</strong>
                  <p className="row-center">
                    <i class="fas fa-clock"></i> waiting
                  </p>
                </div>
                <div className="d-flex flex-row w-100 justify-content-end align-items-end gap-2">
                  <button className="btn btn-success">
                    <i class="fas fa-circle-check text-light icon-user-list"></i>
                  </button>
                  <button className="btn btn-danger">
                    <i class="far fa-trash-can text-light icon-user-list"></i>
                  </button>
                </div>
              </div>
               )
            })
            }
          </div>
          <hr />
          <div className="send-friend-request-area w-100">
            <p className="fw-bold mb-2">You may know :</p>
            {/* suggestions */}
            {suggestions.map(suggestion => {
               return (
              <div key={suggestion._id}
                className="friends-section gap-auto mb-2"
                style={{ width: "100%" }}
              >
                <img
                  src={suggestion.profile.length > 0 ? suggestion.profile[0] : userThree}
                  className="chat-avatar shadow-4-strong p-1"
                  alt="chat"
                />
                <div className="chat-details w-100 text-start">
                  <strong className="mt-2">{suggestion.name+' '+suggestion.lastName} </strong>
                  <p>
                    <i class="fas fa-user-plus text-primary"></i> user
                  </p>
                </div>
                <button className="btn btn-primary d-flex flex-row gap-1 justify-content-center align-items-center">
                  <i class="fas fa-user-plus text-light"></i> Add
                </button>
              </div>
               )
            })
            }
          </div>
        </div>
        {/* create post area start */}
        <div
          className={
            showRequestList === "create-post"
              ? "create-post-list w-100 active"
              : "create-post-list"
          }
        >
          <p className="fw-bold mb-2">Let's create your post :</p>
          <div className="alert alert-warning">
            Please chose your image first to see however it is suitable
            with your post
          </div>
          <form
            onSubmit={handleAddPost}
            className="d-flex flex-column justify-content-center align-items-center post-form gap-1"
          >
            {/* Display image from input file */}
            {fileUrl && (
              <div className="image-display-area w-100 p-2 mb-4">
                {/* Remove post image */}
                <span
                  className="close-preview-post-image"
                  onClick={closePostImage}
                >
                  X
                </span>
                {fileUrl && (
                  <img
                    src={fileUrl}
                    className="preview-image"
                    alt="Preview"
                  />
                )}
              </div>
            )}
            {/* User post text area */}
            <div className="form-floating w-100">
              <textarea
                className="form-control h-50"
                cols={59}
                id="post-input"
                rows={6}
                data-mdb-input-init
                style={{ resize: "none" }}
                onChange={handleChange}
              ></textarea>
              <label className="form-label" htmlFor="textAreaExample">
                What is in your mind 😊
              </label>
            </div>
            {/* post file + submit btns */}
            <div className="d-flex flex-row justify-content-between align-items-center p-2 post-btns-parent">
              <label
                className="d-flex flex-row justify-content-center align-items-center gap-2 post-image-btn"
                htmlFor="image-file"
              >
                <input
                  type="file"
                  className="d-none"
                  id="image-file"
                  onChange={displayPostImage}
                  ref={fileInput}
                />
                <i class="far fa-image"></i> Photos
              </label>
              <button
                type="submit"
                className="btn post-btn btn-dark disabled"
                ref={postBtn}
              >
                post
              </button>
            </div>
          </form>
        </div>
        {/* create post area end */}
      </div>
      {/* lists area end */}
    </div>
  );
}

export default FriendsContainer;
