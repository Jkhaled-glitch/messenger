import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
// import css files
import "../home/home.css";
import "./details.css";
// import user avatar for post user image
import avatar_one from "../public/images/user3.png";
// import toast modal
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
// import useForm react hook for form validation
import { useForm } from "react-hook-form";
// import  social media buttons
import ShareButtons from "../../components/share-btns/shareButton";
// import card image
import logo from "../public/images/fleurs.jpeg";

import axios from 'axios'

const Details = () => {
  // share post state
  const [sharedTitle, setSharedTitle] = useState("");
  // loader section  state
  const [isLoading, setIsLoading] = useState(true);
  // share modal state
  const [showModal, setShowModal] = useState(false);

  //get post id from params
  const { postId } = useParams();
  //get token
  const token = localStorage.getItem("user-login");
  //state for the post data
  const [post, setPost] = useState(null);
  const [me, setMe] = useState(null)


  let comment_key = 1;

  const getPost = async () => {
    await getMe()
    try {
      
      const res = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts/${postId}`, {
        headers: { 'Authorization': token }
      });
      const postData = res.data;
      const postUserData = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/${postData.user}`);
      const postcommentsData = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts/${postId}/comments`, {
        headers: { 'Authorization': token }
      });

      // Récupération des données de l'utilisateur pour chaque commentaire
      const commentsWithUserData = await Promise.all(postcommentsData.data.map(async (comment) => {
        const commentUserData = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/${comment.user}`);
        return {
          ...comment,
          user: commentUserData.data
        };
      }));

      const postWithUserAndCommentsWithUserData = {
        ...postData,
        user: postUserData.data,
        comments: commentsWithUserData
      };

      // Mettre à jour l'état des posts avec les données de l'utilisateur associées
      setPost(postWithUserAndCommentsWithUserData);
      setIsLoading(false)
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
      return ` ${hours} hr${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(secondsDifference / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  const isUserLikeThisPost = () => {
    const userReaction = post.reactions.find(reaction => reaction.user === me._id);
    return userReaction ? true : false;

  }

  const userReactPost = async () => {
    try {
      //const updatedPosts 
      const userReaction = post.reactions.find(reaction => reaction.user === me._id);
      if (!userReaction) {
        //add reaction
        const newReactions = [...post.reactions, { user: me._id, reactionType: 'love' }];

        setPost({ ...post, reactions: newReactions })
        //share updated data to server
        await axios.put(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts/${postId}/addReaction`, { type: 'love' },
          {
            headers: { 'Authorization': token }
          });
      } else {
        //remove reaction
        const newReactions = post.reactions.filter(reaction => reaction.user !== me._id);
        setPost({ ...post, reactions: newReactions })
        //share updated data to server
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


  // starting with change page title and get data
  useEffect(() => {
    document.title = `${process.env.REACT_APP_NAME} | Post-Details`;
    getPost();
  }, []);
  // page url to share
  const postUrl = window.location.href;
  const postTitle = sharedTitle;
  // get details container by reference
  const details_container = useRef(null);

  // scroll post details page once user visit it
  useEffect(() => {
    if (details_container.current) {
      details_container.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);
  // comment input validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Comment: "I like it!",
    },
  });
  // control empty input and spaces value
  const isNotEmptyOrSpaces = (value) => {
    return value.trim().length !== 0; // Check if the value is not empty or contains only spaces
  };

  const handleComment = async (data) => {
    console.log('comment data :')
    console.log(data.comment);
    try {
      const updatedPost = () => {

        const newComments = [
          ...post.comments,
          {
            _id: comment_key++,
            user: me,
            content: data.comment,
            reactions: [],
            createdAt: new Date(),
            post: postId,
          }];

        return { ...post, comments: newComments };


      }
      // Met à jour l'état des posts avec les nouveaux posts modifiés
      setPost(updatedPost);

      //update data

      await axios.post(`${process.env.REACT_APP_SERVER_BASE_URI}/users/posts/${postId}/comments/`, { content: data.comment },
        {
          headers: { 'Authorization': token }
        });
      reset()
      return true
    } catch (error) {
      console.error("Error while updating post:", error);
      return false
    }
  }
  

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

  return (
    <>
      <div className="post-details" ref={details_container}>
        <h4 className="w-100 text-start">
          <span className="badge bg-primary shadow-3">Post details</span>
        </h4>
        {/* post card 1*/}
        <div className="card-item shadow-4-strong" data-name={`${post.user.lastName} ${post.user.name}`} >
          {/* card top-logo */}
          <div className="logo">
            <img src={post.user.profile.length > 0 ? post.user.profile[0] : avatar_one} className="shadow-4-strong " alt="" />
          </div>
          {/* user post name */}
          <h4>{`${post.user.lastName} ${post.user.name}`}</h4>
          {/* post date */}
          <p>posted : {calculateTimeAgo(post.createdAt)}</p>
          {/* post content */}
          <p className="post-body mb-1 ">{post.contentText}</p>
          {/* image content */}
          {
            post.contentType &&
            (post.contentType !== 'image' || post.contentType !== 'mixed') &&

            <img
              src={post.contentType &&
                (post.contentType === 'image' || post.contentType === 'mixed') ?
                (post.contentFiles && post.contentFiles.length > 0 ? post.contentFiles[0] : logo) : logo}
              className="position-relative w-100 post-image mb-4"
              alt="post image"
            />
          }

          {/*url content */}
          {post.contentType &&
            post.contentType === 'url' && post.contentUrl &&
            <div className="iframe-container mb-4">
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
                <i class="fas fa-heart text-danger me-1 mt-1"></i>
              )}
              {post.reactions.length > 0 && (
                post.reactions.length > 1 ? (
                  isUserLikeThisPost() ? ' you and' + post.reactions.length + ' others' : post.reactions.length
                ) : (
                  isUserLikeThisPost() ? ' you' : null
                )
              )}
            </span>
            <span className="d-flex flex-row justify-content-start align-items-center ">
              {post.comments.length} {post.comments.length > 1 ? ' comments' : ' comment'}

            </span>
          </div>
          {/* reactions btns container */}
          <div className="d-flex flex-row justify-content-center align-items-center gap-3">
            {/* like btn */}
            <div className={isUserLikeThisPost(post._id) ? "reactions like text-danger" : "reactions like "}
              onClick={() => userReactPost(post._id)}  >
              <i class="fas fa-heart  me-2"></i>
              Like
            </div>

            {/* comment btn */}
            <div className="reactions comment pe-none">
              <i class="fas fa-comment me-1"></i> comment
            </div>
            {/* share btn */}
            <div
              className="reactions share"
              onClick={(e) => {
                setShowModal(!showModal);
                setSharedTitle(
                  e.target.parentNode.parentNode.querySelector(".post-body")
                    ? e.target.parentNode.parentNode.querySelector(
                      ".post-body"
                    ).innerText
                    : "Please go back and share again !"
                );
              }}
            >
              <i class="fas fa-share me-2"></i> Share
            </div>
          </div>
          <div className="comments-section active">
            {errors.Comment && (
              <span className="error alert alert-danger">
                This field is required for max 100 character
              </span>
            )}
            <hr />
            <div className="comments">
              {/* comments */}
              {post.comments.length > 0 && post.comments.map(comment =>
                
                <div className="all-flex-row w-100" key={comment._id} >
                  <div className="badge-comment  bg-dark text-light ">{`${comment.user.lastName[0].toUpperCase()}`}</div>
                  <div className="all-flex-col">
                    <strong className="mt-1">{`${comment.user.lastName} ${comment.user.name}`}</strong>
                    <p className="comment-body">
                      <span>{comment.content}</span> 
                      <span className="space"></span> 
                      <mark className="mark">{calculateTimeAgo(comment.createdAt)}</mark>
                    </p>
                  </div>
                </div>

              )}


            </div>
            {/* input comments */}
            <form
              data-mdb-ripple-init
              className="comment-form active"
              onSubmit={handleSubmit(handleComment)}
            >
              <input
                type="search"
                className="comment-input "
                placeholder="Add comment"
                {...register("comment", {
                  required: true,
                  minLength: 1,
                  maxLength: 100,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
              />

              <button
                data-mdb-ripple-init
                className="comment-btn" type="submit"
              >
                <i class="fas fa-arrow-up"></i>
              </button>
            </form>

          </div>
        </div>
        {/* share post modal */}
        <div className={showModal ? "modal active" : "modal"}>
          <div className=" card share-modal">
            <div className="card-header flex-row-end fs-5">
              <p className="">Share post</p>
              <i
                class="fas fa-xmark mb-3 close border-0"
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
                  data-link={window.location.href}
                  onClick={(e) => {
                    navigator.clipboard
                      .writeText(e.target.getAttribute("data-link"))
                      .then(() => {
                        toast.success("Link copied to clipboard !");
                      })
                      .catch((error) => {
                        console.error(
                          "Error copying text to clipboard:",
                          error
                        );
                        alert("Failed to copy text to clipboard!");
                      });
                  }}
                >
                  <i class="far fa-clone me-2"></i> Copy link
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* toast container */}
        <ToastContainer style={{ zIndex: "10000000" }} />
      </div>
    </>
  );
};

export default Details;
