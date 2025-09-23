import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");

  // Additional fields are now automatically populated

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {updateUser} = useContext(UserContext)
  const navigate = useNavigate();

  // Handle success - redirect to login
  const handleGoToLogin = () => {
    navigate("/login");
  };

  // Handle SignUp Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = null

    if (!fullName) {
      setError("Please enter full name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    //SignUp API Call
    try {

      // Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes?.imageUrl || null;
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken: adminInviteToken || undefined,
        
        // Automatically populate additional fields with defaults
        employeeId: undefined, // Will be set by backend if needed
        department: undefined, // Will be set by backend if needed
        phone: undefined, // Will be set by backend if needed
        genre: undefined, // Will be set by backend if needed
        joiningDate: new Date().toISOString().split('T')[0], // Current date
        qualification: undefined, // Will be set by backend if needed
        date_of_joining: new Date().toISOString().split('T')[0], // Current date
        candidate_name: fullName, // Use the provided name
        phone_number: undefined, // Will be set by backend if needed
        candidate_personal_mail_id: email, // Use the provided email
        top_department_name_as_per_darwinbox: undefined, // Will be set by backend if needed
        department_name_as_per_darwinbox: undefined, // Will be set by backend if needed
        joining_status: 'active', // Set to active for new registrations
        role_type: undefined, // Will be set by backend if needed
        role_assign: undefined // Will be set by backend if needed
      });

      const { role } = response.data;

      // Show success message instead of redirecting
      setSuccess(true);
      setSuccessMessage(`You have successfully registered as a ${role.replace('_', ' ').toUpperCase()}! You can now login with your credentials.`);
      
      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setAdminInviteToken("");
      setProfilePic(null);
      setError(null);
    } catch (error){
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        {success ? (
          // Success Message
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-green-800 mb-2">Registration Successful!</h3>
              <p className="text-sm text-gray-600 mb-6">{successMessage}</p>
            </div>
            
            <button 
              onClick={handleGoToLogin}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
            
            <p className="text-[13px] text-slate-800 mt-4">
              Want to register another account?{" "}
              <button 
                onClick={() => {
                  setSuccess(false);
                  setSuccessMessage("");
                }}
                className="font-medium text-primary underline"
              >
                Register Again
              </button>
            </p>
          </div>
        ) : (
          // Registration Form
          <>
            <h3 className="text-xl font-semibold text-black">Create an Account</h3>
            <p className="text-xs text-slate-700 mt-[5px] mb-6">
              Join us today by entering your details below.
            </p>

            <form onSubmit={handleSignUp}>
              <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={fullName}
                  onChange={({ target }) => setFullName(target.value)}
                  label="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                />

                <Input
                  value={email}
                  onChange={({ target }) => setEmail(target.value)}
                  label="Email Address"
                  placeholder="enter@example.com"
                  type="text"
                />

                <Input
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  label="Password"
                  placeholder="Min 8 Characters"
                  type="password"
                />

                <Input
                  value={adminInviteToken}
                  onChange={({ target }) => setAdminInviteToken(target.value)}
                  label="Invite Code (Master/Trainer/Trainee)"
                  placeholder="Enter invite code if provided"
                  type="text"
                />
              </div>

              {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

              <button type="submit" className="btn-primary">
                SIGN UP
              </button>

              <p className="text-[13px] text-slate-800 mt-3">
                Already an account?{" "}
                <Link className="font-medium text-primary underline" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignUp;
