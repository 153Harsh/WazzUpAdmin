import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate, useParams } from "react-router-dom";

const Dashboard = () => {
  const pageName = "Dashboard";
  const { id: userId } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 absolute max-h-[80vh] ">
        <Sidebar />

        <div
          className="sm:w-[95vw] w-[92vw]  z-1 bg-[#ece5dd]   absolute  sm:left-[60px] left-[10px] h-[100vh] sm:overflow-hidden"
          // style={{ borderRadius: "80px" }}
        >
          <div className="mb-[-30px] bg-[#dcf8c6]">
            <Header pageName={pageName} />
          </div>

          {/* <nav className="block w-full max-w-full px-0 py-1 text-white transition-all bg-transparent shadow-none rounded-xl">
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
              <div className="capitalize relative top-[-10px] sm:left-[45px] left-[49px] w-[70vw] sm:w-[80vw]">
                bg-[url('../../assets/bg.jpg')] bg-contain bg-center
              </div>
            </div>
          </nav> */}
          <div className="sm:mt-[0px] mt-[40px]  w-full h-auto ">
            <div className="mb-0 sm:grid-cols-2 w-[30vw] sm:w-[80vw] grid gap-y-10 gap-0 grid-cols-1 relative sm:left-[45px] left-[45px]">
              <div className="mb-0 sm:grid-cols-3 w-[30vw] sm:w-[80vw] grid gap-y-10 gap-0 grid-cols-1 relative sm:left-[45px] left-[45px]"></div>
            </div>

            <div
              className="bg-cover bg-no-repeat  mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px] "
            >
            </div>
          </div>

          {/* // new Ui ends  */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
