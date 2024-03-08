import React, {  useState } from "react";

import { useForm } from "react-hook-form";

import { toast } from "react-toastify";

import axios from 'axios'

const DataForm = ({user}) => {

    const token = localStorage.getItem('user-login')
    // set a state for changing update and validate button display
  const [updateName, setUpdateName] = useState(false);
  const [updateLastName, setUpdateLastName] = useState(false);
  const [updatePhone, setUpdatePhone] = useState(false);
  const [updateEmail, setUpdateEmail] = useState(false);
  
  // update infos btn add/remove disabled className to avoid submit form without editing informations
  const [isDisabled, setIsDisabled] = useState(true);
  // update password btn add/remove disabled className
  const [isDisabledPasswordBtn, setIsDisabledPasswordBtn] = useState(true);

  


  // firstname , lastname , phone and email  validation
  const {
    register: registerUpdatedInfos,
    handleSubmit: handleUpdatedInfos,
    reset: updateInfosReset,
    formState: { errors: UpdateInfosErrors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
    },
  });

  // password update form validation
  const {
    register: registerUpdatePassword,
    handleSubmit: handleUpdatePassword,
    reset: updatePasswordReset,
    formState: { errors: updatePasswordErrors },
  } = useForm({
    mode: "onBlur",
  });
  // update user infos func
  const handleUpdate = async(data, event) => {
    event.preventDefault();
    console.log("Updated infos : ", data);
    try {
        const res = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URI}/users/updateData`,data=data, {
          headers: { Authorization: token },
        });

      toast.success(res.data.message);

    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };
  // inputs value spaces control
  const isNotEmptyOrSpaces = (value) => {
    return value.trim().length !== 0; // Check if the value is not empty or contains only spaces
  };
  // update user password func
  const updatePassword = async(data, event) => {
    event.preventDefault();
    try {
        const res = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URI}/users/updatePassword`,data=data, {
          headers: { Authorization: token },
        });

      toast.success(res.data.message);

    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
    updatePasswordReset();
  };

  // close edit states for read only after update user infos
  const cloeseEditStates = () => {
    setUpdateName(false);
    setUpdateLastName(false);
    setUpdatePhone(false);
    setUpdateEmail(false);
  };


  return (
    <>
    
          {/* name and email address update form */}

          {/* handle update infos form errors */}

          {/* firstname error handler aria */}
          {UpdateInfosErrors.name && (
            <div className="alert alert-danger p-2 w-100">
              Name required and must be between 3 and 10 character
            </div>
          )}
          {/* lastname error handler aria */}
          {UpdateInfosErrors.lastName && (
            <div className="alert alert-danger p-2 w-100">
              Lastname required and must be between 3 and 10 character
            </div>
          )}

          {/* lastname error handler aria */}
          {UpdateInfosErrors.phone && (
            <div className="alert alert-danger p-2 w-100">
              Phone required and must be between 8 and 13 digits
            </div>
          )}

          {/* email error handler aria */}
          {UpdateInfosErrors.email && (
            <div className="alert alert-danger p-2 w-100">
              Please enter a valid email
            </div>
          )}
          <form
            className="d-flex flex-column mb-4"
            onSubmit={handleUpdatedInfos(handleUpdate)}
          >
            <label className="label">Name :</label>
            <div className="d-flex flex-row gap-2 justify-content-center align-items-center update-area mb-4">
              <input
                type="text"
                className={
                  updateName
                    ? "name-input inputs update"
                    : "name-input inputs"
                }
                id="name"
                placeholder="Enter name"
                {...registerUpdatedInfos("name", {
                  required: true,
                  minLength: 3,
                  maxLength: 10,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
              />
              <i
                className="far fa-pen-to-square"
                onClick={(e) => {
                  setIsDisabled(!isDisabled);
                  setUpdateName(!updateName);
                  !updateName &&
                    e.target.parentNode.querySelector("#name").focus();
                }}
              ></i>
            </div>
            <label className="label">LastName :</label>
            <div className="d-flex flex-row gap-2 justify-content-center align-items-center update-area mb-4">
              <input
                type="text"
                className={
                  updateLastName
                    ? "name-input inputs update"
                    : "name-input inputs"
                }
                id="lastName"
                placeholder="Enter lastname"
                {...registerUpdatedInfos("lastName", {
                  required: true,
                  minLength: 3,
                  maxLength: 10,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
              />
              <i
                className="far fa-pen-to-square"
                onClick={(e) => {
                  setIsDisabled(!isDisabled);
                  setUpdateLastName(!updateLastName);
                  !updateLastName &&
                    e.target.parentNode.querySelector("#lastName").focus();
                }}
              ></i>
            </div>

            <label className="label">Phone :</label>
            <div className="d-flex flex-row gap-2 justify-content-center align-items-center update-area mb-4">
              <input
                type="text"
                className={
                  updatePhone
                    ? "name-input inputs update"
                    : "name-input inputs"
                }
                id="phone"
                placeholder="Enter phone number"
                {...registerUpdatedInfos("phone", {
                  required: true,
                  pattern: /^[0-9]{8,13}$/,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
              />
              <i
                className="far fa-pen-to-square"
                onClick={(e) => {
                  setIsDisabled(!isDisabled);
                  setUpdateLastName(!updatePhone);
                  !updatePhone &&
                    e.target.parentNode.querySelector("#phone").focus();
                }}
              ></i>
            </div>

            <label className="label">Email :</label>
            <div className="d-flex flex-row gap-2 mb-4 justify-content-center align-items-center update-area">
              <input
                type="email"
                id="email"
                className={
                  updateEmail
                    ? "email-input inputs update"
                    : "email-input inputs"
                }
                placeholder="Enter email"
                {...registerUpdatedInfos("email", {
                  required: true,
                  pattern: /^\S+@\S+$/i,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
              />
              <i
                className="far fa-pen-to-square"
                onClick={(e) => {
                  setIsDisabled(!isDisabled);
                  setUpdateEmail(!updateEmail);
                  !updateEmail &&
                    e.target.parentNode.querySelector("#email").focus();
                }}
              ></i>
            </div>
            <button
              className={
                isDisabled ? "btn btn-primary disabled" : "btn btn-primary"
              }
              style={{ width: "max-content" }}
              type="submit"
              onClick={cloeseEditStates}
            >
              save
            </button>
          </form>
          {/* update password form errors  handler */}
          {/* old password error handler aria */}
          {updatePasswordErrors.oldPassword && (
            <div className="alert alert-danger p-2 w-100">
              Old password required and must be between 6 and 16 character
            </div>
          )}
          {/* new password error handler aria */}
          {updatePasswordErrors.newPassword && (
            <div className="alert alert-danger p-2 w-100">
              New password required and must be between 6 and 16 character
            </div>
          )}
          {/* update password form */}
          <hr />
          <div className="password-update-area">
            <h5>Update password :</h5>
            <p>
              ensure your account is using a long rondom password to stay secure
            </p>
            <form
              className="d-flex flex-column flex-lg-row flex-md-row justify-content-start gap-3 align-items-start"
              onSubmit={handleUpdatePassword(updatePassword)}
            >
              <input
                type="text"
                className="password-input"
                placeholder="Old password"
                {...registerUpdatePassword("oldPassword", {
                  required: true,
                  minLength: 6,
                  maxLength: 16,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
                // disable/enable submit btn depending in input value
                onChange={(e) => {
                  e.target.value.trim().length !== 0
                    ? setIsDisabledPasswordBtn(false)
                    : setIsDisabledPasswordBtn(true);
                }}
              />
              <input
                type="text"
                className="password-input"
                placeholder="New password"
                {...registerUpdatePassword("newPassword", {
                  required: true,
                  minLength: 6,
                  maxLength: 16,
                  validate: {
                    notEmptyOrSpaces: (value) => isNotEmptyOrSpaces(value),
                  },
                })}
                // disable/enable submit btn depending in input value
                onChange={(e) => {
                  e.target.value.trim().length !== 0
                    ? setIsDisabledPasswordBtn(false)
                    : setIsDisabledPasswordBtn(true);
                }}
              />
              <button
                type="submit"
                className={
                  isDisabledPasswordBtn
                    ? "btn btn-primary disabled"
                    : "btn btn-primary"
                }
              >
                save
              </button>
            </form>
          </div>
         </>
  )
            }

export default DataForm;