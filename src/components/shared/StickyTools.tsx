import { useState } from "react";
import { Button } from "../ui/button";
import { Edit, Gem, Ticket, X } from "lucide-react";
import { IconDiscountFilled, IconGiftFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Contact from "@/_root/pages/Contact";

const StickyTools = () => {
    const navigate = useNavigate();
    const [isContactModalOpen, setContactModalOpen] = useState(false); // State for modal
    const [showTools, setShowTools] = useState(false); // State to toggle visibility
  return (
    <div className="space-y-1">
      {/* Sticky Side Tools */}
      <div className="fixed top-1/3 right-2 z-50 flex flex-col items-center space-y-2">
      {!showTools ? (
          // Single button to show tools
          <Button
            variant="ghost"
            className="p-2 rounded shadow text-white bg-[#F4623A] hover:bg-[#e4572e]"
            onClick={() => setShowTools(true)}
          >
            <Gem />
          </Button>        
      ):(
          // Tools container
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              className="p-2 rounded shadow text-red-500 hover:bg-orange-200 hover:text-red-600 bg-orange-100"
              onClick={() => setShowTools(false)} // Close button
            >
              <X />
            </Button>
            <button className="p-2 rounded shadow hover:bg-orange-200 hover:text-gray-700 bg-orange-100 text-black">
              <Ticket />
            </button>
            <button
              className="p-2 rounded shadow hover:bg-orange-200 hover:text-gray-700 bg-orange-100 text-black"
              onClick={() => navigate('/choice')}
            >
              <IconDiscountFilled />
            </button>
            <button
              className="p-2 rounded shadow hover:bg-orange-200 hover:text-gray-700 bg-orange-100 text-black"
              onClick={() => navigate('/bundle')}
            >
              <IconGiftFilled />
            </button>
            <button
              className="p-2 rounded shadow hover:bg-orange-200 hover:text-gray-700 bg-orange-100 text-black"
              onClick={() => setContactModalOpen(true)} // Open modal
            >
              <Edit />
            </button>
          </div>        
      )}
      </div>
      {/* Contact Modal */}
      <Modal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)}>
        <Contact />
      </Modal>              
    </div>
  )
}

export default StickyTools