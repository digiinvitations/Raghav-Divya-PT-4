import React, { useState } from "react";
import { Heart, Instagram, Settings, X, KeyRound, Phone, MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WeddingData } from "../types";
import { getDefaultTemplateId } from "../services/db";

interface FooterProps {
  data: WeddingData;
}

export function Footer({ data }: FooterProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || getDefaultTemplateId();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminClick = () => {
    setShowPrompt(true);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "6396") {
      setShowPrompt(false);
      navigate(`/admin?template=${encodeURIComponent(templateId)}`);
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <footer className="py-12 bg-blush-light border-t border-pink-border flex flex-col items-center text-center px-4 relative">
      <div className="flex flex-col items-center gap-3 text-wine-dark/80 font-serif">
        <p className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
          Created with <Heart className="w-3 h-3 text-pink-accent fill-pink-accent" /> by digiinvitations_
          <a 
            href="https://www.instagram.com/digiinvitations_?igsi=MWh1ZnZhMm1xNnNkdw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-pink-accent transition-colors"
            title="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
        </p>

        <p className="text-xs tracking-wider font-semibold opacity-90 mt-1">
          To Create Your Custom Invitation Website:
        </p>

        {/* Contact Creator Buttons */}
        <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
          <a 
            href="tel:+919456411569" 
            className="flex items-center gap-2 px-4 py-2 bg-wine-dark text-white rounded-full shadow-sm hover:bg-burgundy transition-all text-xs font-sans font-semibold tracking-wide active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            Call Now
          </a>
          <a 
            href="https://wa.me/919456411569?text=Hello%20digiinvitations_%2C%20I%20would%20like%20to%20create%20a%20wedding%20invitation%20website!" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full shadow-sm hover:bg-[#20ba5a] transition-all text-xs font-sans font-semibold tracking-wide active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>

        <p className="text-[11px] tracking-widest font-semibold opacity-75 mt-0.5">
          Phone: +91 9456411569
        </p>
      </div>

      <div className="mt-12 flex justify-center w-full">
        <button 
          onClick={handleAdminClick}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-full shadow-md hover:bg-wine-dark transition-colors text-[10px] font-serif uppercase tracking-widest"
          title="Admin Panel"
        >
          <Settings className="w-3.5 h-3.5" />
          Admin Access
        </button>
      </div>

      {/* Custom Password Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-wine-dark/40 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-wine-dark/60 hover:text-wine-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-blush-light rounded-full flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 text-burgundy" />
              </div>
              <h3 className="font-serif text-xl text-wine-dark font-bold">Admin Access</h3>
              <p className="text-sm text-wine-dark/70 font-serif mt-1">Please enter the password</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full px-4 py-3 bg-blush-main/50 border border-pink-border rounded-lg text-center font-serif text-wine-dark focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                />
                {error && <p className="text-red-500 text-xs text-center mt-2 font-serif">{error}</p>}
              </div>
              
              <button 
                type="submit"
                className="w-full bg-burgundy text-white font-serif tracking-widest uppercase text-sm py-3 rounded-lg shadow-md hover:bg-wine-dark transition-colors"
              >
                Access Panel
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
