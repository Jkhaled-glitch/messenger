import React, { useEffect, useRef, useState } from "react";
// import css file
import "./messages.css";
// import users avatars
import userOne from "../public/images/user1.png";
import userTow from "../public/images/user2.png";
import userThree from "../public/images/user3.png";
import userFour from "../public/images/user4.png";
import userFive from "../public/images/user5.png";
// import emoji picker
import EmojiPicker from "emoji-picker-react";
// import toast modal
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import message photo example
import photo from "../public/images/fleurs.jpeg";
import { NavLink } from "react-router-dom";
// import verified icon
import verified from "../public/images/téléchargement.png";

//axios to fetch api
import axios from 'axios'
import calculateTimeAgo from '../../utilities/calculateTimeAgo'
//socket for real time messages 
import { io } from 'socket.io-client';
const Messages = () => {

  //token 
  const token = localStorage.getItem('user-login')
  // left side bar state
  const [getSideBar, setGetSideBar] = useState(false);
  // starting with change page title
  useEffect(() => {
    document.title = `${process.env.REACT_APP_NAME} | Messages`
  }, []);
  // states for emoji and message
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // video call section state hide and show
  const [showCallSection, setShowCallSection] = useState(false);
  // reply sent or received messgae states
  const [replySentMessage, setReplySentMessage] = useState("");
  const [replyReceivedMessage, setReplyReceivedMessage] = useState("");
  const [replyImageMessage, setReplyImageMessage] = useState(null);
  // user profile show/hide state
  const [showProfile, setShowProfile] = useState(false);
  // photo modal show/hide state
  const [showModal, setShowModal] = useState(false);
  // photo modal image src state
  const [modalImageSrc, setModalImageSrc] = useState("");
  // show/hide message image modal state
  const [getMessageModal, setGetMessageModal] = useState(false);
  // preview image src state
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState(null);
  // use a state to chek if selected image is a message or profile image for reason to hide reactions aria in profile photo
  // and display them in message photo only
  const [isMessagePhoto, setIsMessagePhoto] = useState(false);

  //socket state
  const [socket, setSocket] = useState(null);

  // prevouis chat reference for reverse chats usage
  const previous = useRef(null);

  const [me, setMe] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  

  // filter previous chat by name
  const filterUsersByName = (e) => {
    const input_value = e.target.value;
    const chats = document.querySelectorAll(".chat");
    if (chats) {
      // show not found labem if no reqult match the input value
      chats.forEach((chat) => {
        const chat_lower_name = chat.querySelector("strong").innerText;
        if (
          chat_lower_name
            .toLocaleLowerCase()
            .includes(input_value.toLocaleLowerCase())
        ) {
          document.querySelector(".no-result").innerHTML = "";
        } else {
          document.querySelector(".no-result").innerHTML = "No result found";
        }
      });

      // show posts if name equal to input value and hide enequal posts
      for (let i = 0; i < chats.length; i++) {
        const chat_name = chats[i].querySelector("strong").innerText;
        if (chat_name.toLowerCase().includes(input_value.toLocaleLowerCase())) {
          chats[i].style.display = "flex";
        } else {
          chats[i].style.display = "none";
        }
      }
    }
  };

  // Reverse chat from down to top and reverse
  const reverseChat = () => {
    const reversed_chat = previous.current;
    if (reversed_chat) {
      reversed_chat.classList.toggle("reverse");
    }
  };
  // push emoji inside message state
  const handleEmojiSelect = (emoji) => {
    setMessage(message + emoji.emoji);
  };

  // get chat btn to  auto focus when user click reply btn
  const chat_btn = useRef(null);

  // handle reply for himself

  const handleReplySentMessage = (e) => {
    // set scroll to true to make auto scroll for chat footer
    chat_btn.current.focus();
    const sent_message =
      e.target.parentNode.parentNode.querySelector(".initial-message");
    if (sent_message) {
      setReplySentMessage(sent_message.innerText);
      setReplyReceivedMessage("");
      setReplyImageMessage(null);
    } else {
      setReplySentMessage("Something went wrong");
      setReplyReceivedMessage("");
      setReplyImageMessage(null);
    }
  };

  // handle reply for a received message

  const handleReplyReceivedMessage = (e) => {
    // set scroll to true to make auto scroll for chat footer
    chat_btn.current.focus();
    const received_message =
      e.target.parentNode.parentNode.parentNode.querySelector(
        ".initial-message"
      );
    if (received_message) {
      setReplyReceivedMessage(received_message.innerText);
      setReplySentMessage("");
      setReplyImageMessage(null);
    } else {
      setReplyReceivedMessage("Something went wrong");
      setReplySentMessage("");
      setReplyImageMessage(null);
    }
  };
  // Hnadle reply message image
  const replyPhoto = (e) => {
    chat_btn.current.focus();
    setShowModal(false);
    const imageSRC =
      e.target.parentNode.parentNode.parentNode.querySelector(".message-photo");
    if (imageSRC) {
      setReplyImageMessage(imageSRC.src);
      setReplyReceivedMessage("");
      setReplySentMessage("");
    } else {
      setReplyImageMessage("error");
      setReplyReceivedMessage("");
      setReplySentMessage("");
    }
  };

  // get profile func
  const getProfile = () => {
    setShowProfile(true);
  };

  // preview image from input file
  const displayPostImage = (event) => {
    // get input file value
    const selectedFile = event.target.files[0];

    // Create object URL for the selected file
    const objectUrl = URL.createObjectURL(selectedFile);
    // push image src inside file url state
    if (selectedFile) {
      setFileUrl(objectUrl);
      setGetMessageModal(true);
      setFile(selectedFile)
    }
  };
  // get hidden a for downloading image
  const downloadImageSRC = useRef(null);
  // download image func

  const download = () => {
    if (downloadImageSRC.current) {
      downloadImageSRC.current.click();
    }
  };

  const isURL = (str) => {
    const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return pattern.test(str);
  };

  // send message btn func
  const handleSendSimpleMessage = async (e) => {
    e.preventDefault();
    let type = 'text'
    if (isURL(message)) {
      type = 'url';
    }

    if (message.trim().length === 0) {
      toast.error("message content can not be empty");
      return null;
    } else {
      const data = {
        type: type,
        content: message,
      }
      try {
        await axios.post(`${process.env.REACT_APP_SERVER_BASE_URI}/conversations/${selectedConversation._id}/message/send`, data,
          {
            headers: {
              'Authorization': token,
            }
          });
        setMessage('')
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
      }

    }
  };

  // send file btn func
  const handleSendFileMessage = async (e) => {
    e.preventDefault();

    let type = 'file';
    const mimeType = file.type;
    if (mimeType && mimeType.startsWith('image/')) {
      type = 'image';
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    try {
       await axios.post(`${process.env.REACT_APP_SERVER_BASE_URI}/conversations/${selectedConversation._id}/message/send`, formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
          }
        });

      //Delete file data and hide modal
      setGetMessageModal(false)
      setFile(null)
      setFileUrl('')



    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  }



  // emoji aria hide once user click outside
  const emojisAria = useRef(null);
  const emojisDisplayBtn = useRef(null);
  window.onclick = (event) => {
    if (emojisAria.current && emojisDisplayBtn.current) {
      if (
        event.target !== emojisDisplayBtn.current &&
        !emojisAria.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
  };





  useEffect(() => {
    const getData = async () => {
      try {
        const resMe = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/me`, {
          headers: { Authorization: token },
        });
        setMe(resMe.data);


        const resFriends = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/users/getFriends`, {
          headers: { Authorization: token },
        });
        setOnlineUsers(resFriends.data);


        const resConversations = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URI}/conversations/getAllConversations`, {
          headers: { Authorization: token },
        });
        setConversations(resConversations.data);
        resConversations.data.length > 0 && setSelectedConversation(resConversations.data[0]);
        // Mise à jour des messages
        if (resConversations.data.length > 0) {
          const firstConversationMessages = resConversations.data[0].messages;
          setMessages(firstConversationMessages);
        }

        // Mise à jour du participant
        if (resConversations.data.length > 0 && resMe.data) {
          const firstConversationParticipants = resConversations.data[0].participants;
          const otherParticipant = firstConversationParticipants.find(participant => participant._id !== resMe.data._id);
          setParticipant(otherParticipant);
        }


        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  
  useEffect(() => {
    // Connexion au serveur Socket.IO
    const newSocket = io(process.env.REACT_APP_SERVER_BASE_URI);
    setSocket(newSocket);

    // Nettoyage des écouteurs d'événements lors du démontage du composant
    return () => {
      newSocket.off('disconnect');
    };
  }, []);
  
  //receive message
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
     
      console.log(conversations.length)
      const updatedMessages = [message, ...messages];
      const updatedConversations = conversations.map(conversation => {
      
        if (conversation?._id === message.conversationId) {
          return {
            ...conversation,
            updatedAt: message.createdAt,
            messages: updatedMessages
          };
        }
        return conversation;
      });
    
      // Mettre à jour la conversation sélectionnée si l'ID correspond
      if (message.conversationId === selectedConversation?._id) {
        setSelectedConversation({
          ...selectedConversation,
          updatedAt: message.createdAt,
          messages: updatedMessages
        });
        setMessages(updatedMessages);
      }
    
      // Mettre à jour les conversations
      setConversations(updatedConversations);
    };

    // Écoute de l'événement 'getMessage'
    socket.on('message', handleMessage);
    
  }, [socket, selectedConversation]);



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
    // messages area parent
    <div className="messages-area-parent">
      {/* messages container ==> leftSideBar + chatBox */}
      <div className="messages-container flex-center ">
        {/*left side bar */}
        <div
          className={
            getSideBar
              ? "left-bar  text-center active"
              : "left-bar  text-center"
          }
          style={{ backgroundColor: "whitesmoke" }}
          onClick={() => {
            setShowEmojiPicker(false);
          }}
        >
          {/* top title */}
          <div className="flex-center p-2 fs-5">
            <h4 className="fw-bold">Chat Room</h4>
            <i
              class="fas fa-arrow-down-z-a"
              onClick={reverseChat}
              style={{ cursor: "pointer" }}
              title="reverse chats"
            ></i>
          </div>
          {/* search area form */}
          <form className="form center">
            <input
              type="search"
              placeholder="Search"
              onChange={filterUsersByName}
            />
            <i class="fas fa-magnifying-glass"></i>
          </form>
          {/* online users start */}
          <div className="online-users">
            {onlineUsers.map(onlineUser => {
              return (
                <div key={onlineUser._id}
                  className="user">
                  <img
                    src={onlineUser.profile.length > 0 ? onlineUser.profile[0] : userOne}
                    className="avatar shadow-5-strong"
                    alt="user"
                  />
                  <span className="user-badge"></span>
                </div>
              )
            })}

          </div>
          {/* online users end */}

          {/* previous-chat area start */}
          <div className="previous-chat" ref={previous}>
            {/* chat 1 */}
            {conversations.length == 0 &&
              <div
                className="chat"
                onClick={() => {
                  setGetSideBar(!getSideBar);
                }}
              >
                <div className="chat-details w-100 text-start">
                  <div className="d-flex flex-row justify-content-center align-items-center w-100 alert-danger">
                    <p>You haven't any conversation</p>
                  </div>

                </div>
              </div>
            }
            {conversations.map(conversation => {

              const isUserSendEndMessage = conversation.messages.length > 0 && conversation.messages[0]?.sender == me._id;
              const chatName = conversation.messages[0].sender == me._id ? conversation.participants[1].lastName + ' ' + conversation.participants[1].name : conversation.participants[0].lastName + ' ' + conversation.participants[0].name
              const profileUrl = conversation.participants[0]._id == me._id ?
                (conversation.participants[1].profile.lenfth > 0 ? conversation.participants[1].profile[0] : userThree) :
                (conversation.participants[0].profile.lenfth > 0 ? conversation.participants[0].profile[0] : userThree)

              return (
                <div
                  className="chat"
                  onClick={() => {
                    setGetSideBar(!getSideBar);
                    setParticipant(conversation.participants[0]._id == me.id ? conversation.participants[1] : conversation.participants[0])
                    setMessages(conversation.messages);
                    setSelectedConversation(conversation);
                  }}
                >
                  <img
                    src={profileUrl}
                    className="chat-avatar shadow-4-strong p-1"
                    alt="chat"
                  />
                  <div className="chat-details w-100 text-start">
                    <div className="d-flex flex-row justify-content-between align-items-center w-100">
                      <strong>{chatName}</strong>
                      <mark className="rounded-5">{calculateTimeAgo(conversation.updatedAt)}</mark>
                    </div>
                    <p>
                      {isUserSendEndMessage && <b>You: </b>}

                      {
                        conversation.messages.length > 0 ? (
                          conversation.messages[0].type === "text" || conversation.messages[0].type === "url" ?
                            conversation.messages[0].content :
                            conversation.messages[0].type === "image" ? 'sent an image' : 'sent a file'
                        ) : ' '
                      }
                    </p>
                  </div>
                </div>
              )
            })}

          </div>
          {/* area search not found label */}
          <div
            className="no-result text-info fs-4"
            style={{
              position: "absolute",
              top: "29vh",
              zIndex: "1",
              left: "15vh",
            }}
          ></div>
          {/* previous-chat area end */}
        </div>
        {/* chat box start */}
        <div
          className={
            getSideBar
              ? "chat-box text-align-left   active h-100"
              : "chat-box text-align-left h-100"
          }
        >
          {/* chatBox header */}
          {conversations.length > 0 &&
            <div className="card-header chat-header">
              <div className="user-details">
                <i
                  class="fas fa-arrow-left-long me-2 d-flex d-lg-none d-md-none get-side-bar"
                  onClick={() => {
                    setGetSideBar(!getSideBar);
                  }}
                ></i>
                <img
                  src={participant.profile.length > 0 ? participant.profile[0] : userThree}
                  className="chat-avatar shadow-4-strong p-1 me-1"
                  alt="chat"
                />
                <div className="chat-details w-100 text-start">
                  <div className="d-flex flex-row justify-content-between align-items-center w-100">
                    <strong className="pt-3">{participant.lastName + ' ' + participant.name}</strong>
                  </div>
                  <p>online</p>
                </div>
              </div>
              {/* call btns */}
              <div className="d-flex flex-row justify-content-center align-items-center call-center shadow-2-strong">
                <i
                  class="fas fa-phone  border-end"
                  title="Audio call"
                  onClick={() => {
                    setShowCallSection(true);
                  }}
                ></i>
                <i
                  class="far fa-circle-user text-primary"
                  title="Profile"

                  onClick={getProfile}
                ></i>
              </div>
            </div>
          }
          {/* chat box body */}
          <div className="card-body chat-body">

            {messages.map((message, index) => {
              const isSender = message.sender === me._id;
              const isTextMessage = message.type === "text";
              const isFileMessage = message.type === "file";
              const isImageMessage = message.type === "image";
              const isUrlMessage = message.type === "url";

              return (
                <div key={index} className={isSender ? "sender" : "receiver"}>
                  {isSender && (
                    <span className="d-flex flex-row justify-content-center align-items-center gap-3 message-sender-options">
                      <i className="fas fa-heart text-danger" title="Like message"></i>
                      <i className="fas fa-reply text-primary" title="Reply message" onClick={isSender ? handleReplySentMessage : handleReplyReceivedMessage}></i>
                      <i className="fas fa-clone text-warning" title="Copy message" onClick={(e) => { navigator.clipboard.writeText(message.content).then(toast.success("text or link successfully copied")); }}></i>
                      <i className="fas fa-trash-can text-danger" title="Delete message"></i>
                    </span>
                  )}
                  {isTextMessage && (
                    <>
                      <span className="d-flex flex-row justify-content-center  align-items-center gap-3 message-sender-options">
                        <i class="fas fa-heart text-danger" title="Like message"></i>
                        <i
                          class="fas fa-reply text-primary"
                          title="Reply message"
                          onClick={handleReplySentMessage}
                        ></i>
                        <i
                          class="fas fa-clone text-warning"
                          title="Copy message"
                          onClick={(e) => {
                            navigator.clipboard
                              .writeText(
                                message.content
                              )
                              .then(toast.success("Message successfully copied"));
                          }}
                        ></i>
                        <i
                          class="fas fa-trash-can text-danger"
                          title="Delete message"
                        ></i>
                      </span>
                      <p className="sender-message mb-0 initial-message">
                        {message.content}
                      </p>
                    </>
                  )}
                  {isFileMessage && (
                    <div class="file-message">
                      <span class="file-icon"><i class="fas fa-file"></i></span>
                      <a href={message.content} download>file</a>
                    </div>
                  )}
                  {isImageMessage && (
                    <>
                      <p
                        className="sender-message mb-0"
                        onClick={(e) => {
                          setShowModal(!showModal);
                          setModalImageSrc(
                            e.target.parentNode.querySelector(".message-photo").src
                          );
                          setIsMessagePhoto(true);
                        }}
                      >
                        <img
                          src={message.content}
                          className="message-photo"
                          width={200}
                          height={200}
                          alt="message"
                          style={{ cursor: "pointer" }}
                        />
                        {/* hidden a element for downloading image */}
                        <a
                          href={message.content}
                          className="d-none"
                          ref={downloadImageSRC}
                          download={message.content}
                        ></a>
                      </p>
                    </>
                  )}
                  {isUrlMessage && (
                    <div class="url-message">
                      <span class="url-icon"><i class="fas fa-link"></i></span>
                      <a href={message.content} target="_blank">{message.content}</a>
                    </div>

                  )}
                  <span className="d-flex justify-content-end align-items-center time">{calculateTimeAgo(message.createdAt)}</span>
                </div>
              );
            })}

          </div>
          {/* chat box footer */}
          <div className="card-footer chat-footer  p-3">
            {/* replied message and images area */}
            {
              // check if sender reply himself's message
              replySentMessage !== "" && (
                <div className="alert alert-dark border-green">
                  <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                    <span className="text-success">You</span>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setReplySentMessage("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        // set scroll to false to close auto scroll for chat footer
                      }}
                    >
                      X
                    </span>
                  </div>
                  {replySentMessage}{" "}
                </div>
              )
            }
            {
              // check if sender reply received message
              replyReceivedMessage !== "" && (
                <div className="alert alert-dark   border-secondary">
                  <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                    <span className="text-secondary">Sarra</span>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setReplyReceivedMessage("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        // set scroll to false to close auto scroll for chat footer
                      }}
                    >
                      X
                    </span>
                  </div>
                  {replyReceivedMessage}{" "}
                </div>
              )
            }
            {/* reply a message photo area */}

            {
              // check message photo state
              replyImageMessage !== null && replyImageMessage !== "error" && (
                // message reply section
                <div className="alert alert-dark d-flex flex-row justify-content-between align-items-center border-green">
                  {/* name + message type section */}
                  <div className="d-flex flex-column justify-content-start align-items-start gap-1">
                    <span>You</span>
                    <span>
                      <i className="far fa-image"></i> Photo
                    </span>
                  </div>
                  {/* photo display area */}
                  <img
                    src={replyImageMessage}
                    width={80}
                    alt="preview-message-photo"
                  />
                  <span
                    className="close-reply"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setReplyImageMessage(null);
                    }}
                  >
                    <i className="fas fa-xmark"></i>
                  </span>
                </div>
              )
            }
            {/* message form */}
            <form className="message-form" onSubmit={(e) => handleSendSimpleMessage(e)}>
              {/* Epmty input message error handler */}

              <div className="d-flex flex-row justify-content-between align-items-center gap-2 icons">
                <input
                  className="message-input"
                  value={message}
                  ref={chat_btn}
                  type="text"
                  placeholder="Tape message"
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  onFocus={() => {
                    setShowEmojiPicker(false);
                  }}
                />

                {/* emoji picker react */}
                {showEmojiPicker && (
                  <div className="emoji" ref={emojisAria}>
                    <EmojiPicker
                      className="picker"
                      onEmojiClick={handleEmojiSelect}
                    />
                  </div>
                )}

                <i
                  class="far fa-face-grin text-warning"
                  ref={emojisDisplayBtn}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                ></i>
                <label htmlFor="file">
                  <i class="fas fa-image text-dark me-3 "></i>
                </label>
                <input
                  type="file"
                  id="file"
                  className="d-none"
                  onChange={displayPostImage}
                />
              </div>
              <button className="message-btn" type="submit">
                <i class="fas fa-arrow-up"></i>
              </button>
            </form>
          </div>
          {/* onlineUser profile infos area start */}
          <div
            className={
              showProfile
                ? "onlineUser-profile-section show"
                : "onlineUser-profile-section"
            }
          >
            <div className="w-100 text-start">
              <i
                class="fas fa-arrow-left-long"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowProfile(false);
                }}
              ></i>
            </div>
            <div className="user-infos-center">
              {/* user avatar */}
              <div
                data-src={userThree}
                onClick={(e) => {
                  setShowModal(true);
                  setModalImageSrc(e.target.getAttribute("data-src"));
                }}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={participant.profile.length > 0 ? participant.profile[0] : userThree}
                  className="profile-avatar  shadow-4-strong p-1 me-1 mb-4"
                  alt="chat"
                  title="Preview image"
                />
              </div>
              <p className="fw-bold fs-3  mb-0 d-flex flex-row justify-content-center align-items-center">
                <span>{participant.lastName + ' ' + participant.name}</span>
                <img src={verified} width={40} alt="verified" />
              </p>
              <div className="shadow-2 d-flex flex-row justify-content-center align-items-center p-3 rounded-5 gap-2 mb-0">
                <button
                  className="btn btn-light btn-floating text-dark"
                  onClick={() => {
                    setShowCallSection(!showCallSection);
                    setShowProfile(!showProfile);
                  }}
                >
                  <i class="fas fa-phone"></i>
                </button>
                <button className="btn btn-light btn-floating text-dark">
                  <i class="fas fa-video"></i>
                </button>
                <button className="btn btn-light btn-floating text-dark">
                  <i class="fas fa-user-check text-success"></i>
                </button>
                <NavLink to="/profile">
                  <button className="btn btn-light btn-floating text-dark">
                    <i class="fas fa-list text-primary"></i>
                  </button>
                </NavLink>
              </div>
              <hr />
              <div className="d-flex flex-column border-top border-dark p-2 justify-content-start align-items-start w-100">
                <p className="fw-bold text-primary mb-0">Followers :</p>
                <p className="mb-3">
                  You following <span className="fw-bold">{participant.lastName + ' ' + participant.name}</span>
                </p>
                <p className="fw-bold text-primary mb-0">
                  Theme :{" "}
                  <span className="badge bg-info">
                    <i class="fas fa-check"></i> Default
                  </span>
                </p>
              </div>
            </div>
          </div>
          {/* onlineUser profile infos area end */}
          {/* photo modal area start */}
          <div
            className={showModal ? "photo-modal show p-2" : "photo-modal p-2"}
          >
            <div className="d-flex flex-row justify-content-between align-items-center mb-2 w-100">
              <span>Preview</span>
              <i
                class="fas fa-xmark text-danger rounded border p-2 border-danger"
                onClick={() => {
                  setShowModal(false);
                  setIsMessagePhoto(false);
                }}
              ></i>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100">
              {modalImageSrc !== "" ? (
                <img
                  src={modalImageSrc}
                  className="img-fluid message-photo w-100 h-75 mb-4"
                  alt="preview"
                />
              ) : (
                <span>No SRC available for this image</span>
              )}
              {/* image reaction + reply + delete and download area ===> display only in message images*/}
              {isMessagePhoto && (
                <div className="card w-75 reply-section mb-5">
                  {/* reply image message area start */}
                  {/* hide reactions area once reactions container clicked */}
                  <div
                    className="reply"
                    onClick={() => {
                      setIsMessagePhoto(false);
                    }}
                  >
                    <i className="fas fa-heart text-danger"></i>
                    <i
                      className="fas fa-reply text-primary"
                      title="Reply message"
                      onClick={replyPhoto}
                    ></i>
                    {/* download image icon */}
                    <i
                      className="fas fa-arrow-down text-warning"
                      title="Download image"
                      onClick={download}
                    ></i>
                    <i className="fas fa-trash-can text-danger"></i>
                  </div>
                  {/* reply image message area end */}
                </div>
              )}
            </div>
          </div>

          {/* photo modal area end */}
          {/* message photo modal start */}

          <div
            className={
              getMessageModal
                ? "photo-modal show bg-night p-2 "
                : "photo-modal  p-2"
            }
          >
            {/* modal header control */}
            <div className="d-flex flex-row card-header p-2 justify-content-between align-items-center mb-2 w-100">
              <span className="text-info">
                <i class="far fa-image text-info"></i> {participant.lastName + ' ' + participant.name}
              </span>
              <i
                class="fas fa-xmark text-danger rounded border p-2 border-danger"
                onClick={() => {
                  setGetMessageModal(false);
                }}
              ></i>
            </div>
            {/* image area */}
            <div className="card-body w-100">
              {fileUrl && (
                <img src={fileUrl} className="image-message" alt="Preview" />
              )}
            </div>
            {/* message area */}
            <div className=" w-100 p-2">
              <form onSubmit={(e) => handleSendFileMessage(e)}
                className="image-message-form active border">

                <button type="submit" className="image-message-btn">
                  <i class="fas fa-arrow-up text-light"></i>
                </button>
              </form>
            </div>
          </div>

          {/* message photo area end */}
        </div>
        {/*  chat box end */}
        {/* audio , video call section + user image , name and status */}
        <div
          className={
            showCallSection
              ? "call-section-parent p-3 bg-dark  show"
              : "call-section-parent p-3 bg-dark"
          }
        >
          <div className="call-section-container w-100 bg-dark p-3 d-flex flex-column justify-content-center align-items-center">
            <h4 className="w-100 text-center">
              <i class="fas fa-square-phone text-primary"></i> {participant.lastName + ' ' + participant.name}
            </h4>
            <img
              src={userThree}
              className="profile-avatar text-center shadow-4-strong ms-3 p-1 mb-4"
              alt="chat"
              style={{
                width: "120px",
              }}
            />
            <span>Ringing</span>
            <div className="d-flex flex-row justify-content-center align-items-center p-3  mt-4 gap-3 call-buttons">
              <button className="btn btn-dark text-light btn-floating">
                <i class="fas fa-volume-high"></i>
              </button>
              <button className="btn btn-dark text-light btn-floating">
                <i class="fas fa-video"></i>
              </button>
              <button className="btn btn-dark btn-floating">
                <i class="fas fa-microphone-slash"></i>
              </button>
              <button
                className="btn btn-danger btn-floating"
                onClick={() => {
                  setShowCallSection(false);
                }}
              >
                <i class="fas fa-phone-slash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* toast container */}
      <ToastContainer style={{ zIndex: "10000000" }} />
    </div>
  );
};

export default Messages;