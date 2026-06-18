import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import ProfileImg from "../../assets/profile.png";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
const Profile = () => {
  const pageName = "Profile";
  const { id: userId } = useParams();
  const [profileData, setProfileData] = useState(null);

const userId_stored = localStorage.getItem("UserId"); // ObjectId for API
const empID = localStorage.getItem("AdminId");
  const userType = localStorage.getItem("UserType");
  const HQ = localStorage.getItem("HQ");
  const ZONE = localStorage.getItem("ZONE");
  const TeamName = localStorage.getItem("TeamName");
  const UserName = localStorage.getItem("UserName");

  // useEffect(() => {
  //   const fetchMrData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://dev.admin.rxpl.digilateral.comapi/admin/ProfileData/${userId}`
  //       );
  //       console.log(response);
  //       setProfileData(response.data);
  //     } catch (error) {
  //       console.error("Error fetching FLM data:", error);
  //     }
  //   };

  //   fetchMrData();
  // }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
// Add this after your other useEffects
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in Profile:', userId);
  }
}, [userId]);
  return (
    <>
      <div className="grid grid-cols-2 absolute max-h-[120vh]">
        <Sidebar />

        <div
          className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[60px] left-[10px] h-[110vh] sm:overflow-hidden"
          style={{
            borderTopLeftRadius: "80px",
            borderBottomLeftRadius: "80px",
          }}
        >
          <div className="h-[100px]">
            <Header pageName={pageName} />
          </div>

          <div className="mt-[5px] w-full h-auto">
            <div className="pt-4 flex m-14 mt-0 flex-col sm:flex-col items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <img src={ProfileImg} alt="profile" />
              {UserName ? <h3>{UserName}</h3> : <p>Loading...</p>}
            </div>
            <div className="mb-4 w-full grid px-4 sm:px-20 md:px-20 lg:px-20 xl:px-20 2xl:px-40 gap-y-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-32 sm:w-[80vw] sm:mx-auto">
              <div className="flex flex-col">
                <label className="leading-loose text-black">
                  SAP Code<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={empID}
                  disabled
                  className="px-4 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="leading-loose text-black">
                  HQ Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  disabled
                  value={HQ}
                  className=" px-4 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="leading-loose text-black">
                  Team Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={TeamName}
                  disabled
                  className="px-4 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="leading-loose text-black">
                  Zone<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={ZONE}
                  disabled
                  className="px-4 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                />
              </div>
            </div>
            <div className="pt-4 flex m-14 mt-0 flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              {/* <button class="bg-orange-400 mb-4 flex justify-center items-center w-full sm:w-40 text-white px-4 py-2.5 shadow-md rounded-full focus:outline-none">
                Save
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
