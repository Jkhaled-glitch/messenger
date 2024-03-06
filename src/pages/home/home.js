import React, { useEffect, useState } from "react";
// import home css file
import "./home.css";
// import card image
import logo from "../public/images/fleurs.jpeg";
// import toast modal
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
// import  social media buttons
import ShareButtons from "../../components/share-btns/shareButton";
// import user avatar for post user image
import avatar_one from "../public/images/user2.png";
import avatar_tow from "../public/images/user3.png";
import avatar_three from "../public/images/user4.png";
import { NavLink } from "react-router-dom";
import axios from 'axios'





const Home = () => {
  // share post state
  const [sharedTitle, setSharedTitle] = useState("");
  // shared url  state
  const [postSharedURL, setPostSharedURL] = useState("");
  // share modal state
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("user-login");
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null)
  const getPosts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts`, {
        headers: { 'Authorization': token }
      });
      const postData = res.data;

      const postPromises = postData.map(post => {
        return axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/${post.user}`);
      });

      const postUserData = await Promise.all(postPromises);

      const postsWithUserData = postData.map((post, index) => {
        return {
          ...post,
          user: postUserData[index].data
        };
      });

      // Mettre à jour l'état des posts avec les données de l'utilisateur associées
      setPosts(postsWithUserData);
    } catch (err) {
      console.error(err);
    }
  };
  const getMe = async () => {

    try {
      const res = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/me`, {
        headers: { 'Authorization': token }
      });
      setMe(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTimeAgo = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();

    // Calculer la différence entre maintenant et la date de création du post en millisecondes
    const timeDifference = now - date;

    // Convertir la différence en secondes
    const secondsDifference = Math.floor(timeDifference / 1000);

    // Convertir les secondes en un texte descriptif
    if (secondsDifference < 60) {
      return 'A few seconds ago';
    } else if (secondsDifference < 3600) {
      const minutes = Math.floor(secondsDifference / 60);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (secondsDifference < 86400) {
      const hours = Math.floor(secondsDifference / 3600);
      return ` ${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(secondsDifference / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const isUserLikeThisPost = (postId) => {
    const post = posts.find(post => post._id === postId);
    const userReaction = post.reactions.find(reaction => reaction.user === me._id);
    return userReaction ? true : false;

  }

  const userReactPost = async (postId) => {
    try {
      let userHasReaction = false;
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {

          const userReaction = post.reactions.find(reaction => reaction.user === me._id);
          if (!userReaction) {

            const newReactions = [...post.reactions, { user: me._id, reactionType: 'love' }];

            return { ...post, reactions: newReactions };
          } else {
            userHasReaction = true;
            const newReactions = post.reactions.filter(reaction => reaction.user !== me._id);
            return { ...post, reactions: newReactions };
          }
        } else {
          return post;
        }
      });
      // Met à jour l'état des posts avec les nouveaux posts modifiés
      setPosts(updatedPosts);

      //update data
      if (!userHasReaction) {
        await axios.put(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts/${postId}/addReaction`, { type: 'love' },
          {
            headers: { 'Authorization': token }
          });
      } else {
        await axios.put(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts/${postId}/removeReaction`, {},
          {
            headers: { 'Authorization': token }
          });

      }
      return true
      //return userHasReaction;
    } catch (error) {
      console.error("Error while updating post:", error);
      return false
    }
  }





  useEffect(() => {
    document.title = `${process.env.REACT_APP_NAME} | Home`;
    
    getMe();
    getPosts();
  }, []);
  // page url to share
  const postUrl = `${window.location.href}#/posts/details/${postSharedURL}`;
  const postTitle = sharedTitle;
  // filter posts input func
  const filterPosts = (e) => {
    const filtred_name = e.target.value;

    // get all posts
    const posts = document.querySelectorAll(".card-items");

    if (posts) {
      posts.forEach((post) => {
        if (
          post
            .getAttribute("data-name")
            .toLowerCase()
            .includes(filtred_name.toLocaleLowerCase())
        ) {
          document.querySelector(".no-result").innerHTML = "";
        } else {
          document.querySelector(".no-result").innerHTML = "No result found";
        }
      });
      // show post if equal to input value
      for (let i = 0; i < posts.length; i++) {
        // get post name
        const post_name = posts[i].getAttribute("data-name");
        if (
          post_name.toLowerCase().includes(filtred_name.toLocaleLowerCase())
        ) {
          posts[i].style.display = "flex";
          // document.querySelector(".no-result").innerHTML =""
        } else {
          posts[i].style.display = "none";
        }
      }
    }
  };

  return (
    <>
      <div className="home-page">
        <div className="card-container p-3 d-flex flex-column gap-3 justify-content-center align-items-center mb-5 ">
          {/* search area */}
          <div className="d-flex flex-row justify-content-between text-align-center p-3 align-items-center mb-5 w-100">
            <span className="d-lg-none d-md-none"></span>
            <h4 className="d-none d-md-flex d-md-flex bg-transparent mb-4">
              All posts
            </h4>
            {/* search form */}
            <form className="d-flex input-group w-auto">
              <input
                type="search"
                className="form-control rounded mb-4 bg-transparent"
                placeholder="Search"
                aria-label="Search"
                id="search"
                aria-describedby="search-addon"
                onChange={filterPosts}
              />
              <span className="input-group-text border-0" id="search-addon">
                <label htmlFor="search">
                  <i className="fas fa-search"></i>
                </label>
              </span>
            </form>
          </div>
          {/* area search not found label */}
          <div
            className="no-result bg-transparent text-info fs-4"
            style={{
              position: "absolute",
            }}
          ></div>
          <div className="d-flex flex-lg-row gap-3 flex-md-row flex-column justify-content-satart align-items-start">

            {posts && posts.length > 0 && posts.map(post => {

              {/* post card */ }
              return (

                <div key={post._id}
                  className="card-items shadow-4-strong"
                  data-name={post.user.name + ' ' + post.user.lastName}
                >
                  {/* card top-logo */}
                  <div className="logo">
                    <img src={post.user.profile && post.user.profile.length > 0 ? post.user.profile[0] : avatar_tow} className="shadow-4-strong " alt={post.user.name ? post.user.name : 'user'} />
                  </div>
                  {/* user post name */}
                  <h4>{post.user.name + ' ' + post.user.lastName}</h4>
                  {/* post date */}
                  <p>posted : {calculateTimeAgo(post.createdAt)}</p>
                  {/* post content */}
                  <p className="post-body  text-left">
                    {post.contentText}
                  </p>
                  {/*image content */}
                  {
                    post.contentType &&
                    (post.contentType !== 'image' || post.contentType !== 'mixed') &&

                    <img
                      src={post.contentType &&
                        (post.contentType === 'image' || post.contentType === 'mixed') ?
                        (post.contentFiles && post.contentFiles.length > 0 ? post.contentFiles[0] : logo) : logo}
                      className="position-relative w-100 post-image"
                      alt="post image"
                    />
                  }
                  {/*url content */}

                  {post.contentType &&
                    post.contentType === 'url' && post.contentUrl &&
                    <div className="iframe-container">
                      <iframe
                        src={post.contentUrl} // Utilisation de l'URL de post.contentUrl ou une URL par défaut
                        className="post-iframe"
                        title="post-iframe"
                      />
                      <a href={!post.contentUrl ? post.contentUrl : 'Open link in the Navigator'} className="iframe-link">
                        {"post.contentUrl"}
                      </a>
                    </div>
                  }
                  {/* likes number + comments */}
                  <div className="d-flex flex-row justify-content-between align-items-center mt-2 mb-3 w-100">
                    <span className="d-flex flex-row justify-content-start align-items-center ">
                    {post.reactions.length > 0 && (
                      <i className="fas fa-heart text-danger me-1 mt-1"></i>
                    )}
                      {post.reactions.length > 0 && (
                        post.reactions.length > 1 ? (
                          isUserLikeThisPost(post._id) ? ' you and'+post.reactions.length+' others' : post.reactions.length
                        ) : (
                          isUserLikeThisPost(post._id) ? ' you' : null
                        )
                      )}
                    </span>
                    <span className="d-flex flex-row justify-content-start align-items-center ">
                      {post.comments.length} {post.comments.length > 1 ? ' comments' : ' comment'}

                    </span>
                  </div>
                  {/* reactions btns container */}
                  <div className="d-flex flex-row justify-content-center align-items-center gap-3 mb-2">
                    {/* like btn */}
                    <div className={isUserLikeThisPost(post._id) ? "reactions like text-danger" : "reactions like "}
                      onClick={() => userReactPost(post._id)}  >
                      <i className="fas fa-heart  me-2"></i>
                      Like
                    </div>
                    {/* comment btn */}
                    <NavLink
                      to={`/posts/details/${post._id}`}
                      className="reactions comment"
                    >
                      <i className="fas fa-comment me-1"></i> comment
                    </NavLink>
                    {/* share btn */}
                    <div
                      className="reactions share"
                      onClick={(e) => {
                        setShowModal(!showModal);
                        let postUrl = (!/#$/.test(window.location.href) && !/\/$/.test(window.location.href)) ?
                         `${window.location.href}#/posts/details/${post._id}` : (!/#$/.test(window.location.href)) ? 
                         `${window.location.href}#/posts/details/${post._id}` : (!/\/$/.test(window.location.href)) ?
                          `${window.location.href}/posts/details/${post._id}` : `${window.location.href}posts/details/${post._id}`;

                        setPostSharedURL(postUrl);
                        setSharedTitle(
                          e.target.parentNode.parentNode.querySelector(".post-body")
                            ? e.target.parentNode.parentNode.querySelector(
                              ".post-body"
                            ).innerText
                            : "Please go back and share again !"
                        );
                      }}
                    >
                      <i className="fas fa-share me-2"></i> Share
                    </div>
                  </div>
                </div>
              )
            })}


          </div>
        </div>
      </div>
      {/* share post modal */}
      <div className={showModal ? "modal active" : "modal"}>
        <div className=" card share-modal">
          <div className="card-header flex-row-end fs-5">
            <p className="">Share post</p>
            <i
              className="fas fa-xmark mb-3 close border-0"
              onClick={() => {
                setShowModal(!showModal);
              }}
            ></i>
          </div>
          <div className="card-body d-flex flex-column flex-lg-row flex-md-row justify-content-around gap-2 align-items-center">
            <div>
              <ShareButtons url={postUrl} title={postTitle} />
            </div>

            <div className="copy-link w-auto p-1">
              <span
                onClick={(e) => {
                  setShowModal(!showModal);
                  navigator.clipboard
                    .writeText(postSharedURL)
                    .then(() => {
                      toast.success("Link successfully copied !");
                    })
                    .catch((error) => {
                      console.error("Error copying text to clipboard:", error);
                      alert("Failed to copy text to clipboard!");
                    });
                }}
              >
                <i className="far fa-clone me-2"></i> Copy link
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* toast container */}
      <ToastContainer style={{ zIndex: "10000000" }} />
    </>
  );
};

export default Home;

