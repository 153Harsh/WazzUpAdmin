import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

const WhatsAppOnboarding = () => {
  const pageName = "Whatsapp";
  const appId = "742752941669784"; // Replace with your real App ID
  const scopes = "business_management,whatsapp_business_management,whatsapp_business_messaging";

  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
    };

    // Inject FB SDK script
    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  const handleFBLogin = () => {
    window.FB.login(
      function (response) {
        if (response.authResponse) {
          console.log("User logged in:", response);

          // Now redirect to the embedded onboarding URL
          const onboardingUrl = `https://www.facebook.com/business/wa/onboarding?app_id=${appId}&platform=cloud`;
          window.location.href = onboardingUrl;
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      { scope: scopes }
    );
  };

  return (
     <div className="grid grid-cols-2 absolute max-h-[120vh]">
      <Sidebar />
      <div className="sm:w-[85vw] w-[92vw] z-1 bg-white absolute sm:left-[60px] left-[10px] h-[100vh] sm:overflow-hidden">
        <div className="h-[100px] mb-[-20px]">
          <Header pageName={pageName} />
        </div>
        <div className="w-full h-auto">
           <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Connect WhatsApp Business</h2>
      <button
        onClick={handleFBLogin}
        className="px-6 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-500"
      >
        Connect WhatsApp
      </button>
    </div>
        </div>
   </div>
   </div>
  );
};

export default WhatsAppOnboarding;
