import { FaWhatsapp } from 'react-icons/fa';


const BusinessWhatsAppPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="text-center max-w-lg mx-auto px-6">
        {/* Floating WhatsApp Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-[#25d366] to-[#128C7E] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <FaWhatsapp className="text-white text-3xl" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No Conversations Yet
        </h2>
        <p className="text-gray-500 mb-8 text-sm">
          Select a contact from the
          sidebar or start a new conversation to begin engaging with customers.
        </p>
      </div>
    </div>
  );
};

export { BusinessWhatsAppPlaceholder };