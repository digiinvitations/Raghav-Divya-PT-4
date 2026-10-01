import React, { useState } from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { Mail } from "lucide-react";
import { submitRSVP, getRSVPs, getDefaultTemplateId } from "../services/db";

interface RSVPProps {
  templateId?: string;
}

export function RSVP({ templateId }: RSVPProps) {
  const effectiveTemplateId = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleViewerAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2580") {
      setIsAuthenticated(true);
      setErrorMsg("");
      setLoadingRsvps(true);
      const data = await getRSVPs(effectiveTemplateId);
      setRsvps(data);
      setLoadingRsvps(false);
    } else {
      setErrorMsg("Incorrect password");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const rsvpData = {
      name: formData.get("name"),
      email: formData.get("email"),
      attending: formData.get("attending"),
      message: formData.get("message")
    };

    try {
      await submitRSVP(rsvpData, effectiveTemplateId);
      setStatus("success");
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setStatus("idle");
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <section className="py-16 px-6 bg-blush-light flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <Mail className="w-6 h-6 text-wine-dark mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="font-serif text-4xl md:text-5xl uppercase tracking-widest text-wine-dark font-bold text-center drop-shadow-sm">
          RSVP
        </h2>
        
        <HeartDivider />

        {status === "success" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-8 text-center bg-blush-main rounded-xl border border-pink-border shadow-sm mt-6"
          >
            <h3 className="font-script text-3xl text-pink-accent mb-2">Thank You</h3>
            <p className="text-text-body text-sm opacity-80">We have received your response!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-5 text-left">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-semibold text-text-body pl-1">Your Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                required 
                placeholder="Your full name"
                className="w-full bg-transparent border border-pink-border/80 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors"
                disabled={status === "submitting"}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-text-body pl-1">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                required 
                placeholder="you@example.com"
                className="w-full bg-transparent border border-pink-border/80 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors"
                disabled={status === "submitting"}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="attending" className="text-xs font-semibold text-text-body pl-1">Will you be attending? *</label>
              <div className="relative">
                <select 
                  id="attending" 
                  name="attending"
                  required 
                  defaultValue=""
                  className="w-full bg-transparent border border-pink-border/80 rounded-md px-4 py-3 text-sm appearance-none focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors cursor-pointer"
                  disabled={status === "submitting"}
                >
                  <option value="" disabled hidden>Select...</option>
                  <option value="yes">Yes, gladly attending</option>
                  <option value="no">Regretfully decline</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-pink-accent">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-xs font-semibold text-text-body pl-1">Your Message</label>
              <textarea 
                id="message" 
                name="message"
                rows={3}
                placeholder="Write your wishes..."
                className="w-full bg-transparent border border-pink-border/80 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors resize-none"
                disabled={status === "submitting"}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="mt-2 w-full bg-burgundy text-white py-4 rounded-md font-serif text-sm tracking-widest shadow-md hover:bg-wine-dark transition-colors active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              {status === "submitting" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* RSVP Viewer Section */}
      <div className="w-full max-w-md mt-12 flex flex-col items-center border-t border-pink-border/50 pt-8">
        <button 
          onClick={() => setIsViewerOpen(!isViewerOpen)}
          className="text-xs uppercase tracking-widest text-wine-dark/70 hover:text-wine-dark flex items-center gap-2 transition-colors"
        >
          {isViewerOpen ? "Close RSVP Viewer" : "See RSVPs"}
        </button>

        {isViewerOpen && (
          <div className="w-full mt-6 bg-white p-6 rounded-xl border border-pink-border shadow-sm">
            {!isAuthenticated ? (
              <form onSubmit={handleViewerAccess} className="flex flex-col gap-3">
                <p className="text-sm text-wine-dark mb-2 text-center">Enter password to view RSVPs</p>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent border border-pink-border/80 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
                />
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button type="submit" className="w-full bg-burgundy text-white py-2 rounded-md font-serif text-sm hover:bg-wine-dark transition-colors">
                  Access
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-serif font-bold text-wine-dark">Guest Responses</h3>
                    <p className="text-[10px] text-wine-dark/60 font-sans">Section: {effectiveTemplateId}</p>
                  </div>
                  <span className="text-xs font-semibold bg-blush-light text-wine-dark px-2 py-1 rounded-full">
                    Total: {rsvps.length}
                  </span>
                </div>
                
                {loadingRsvps ? (
                  <p className="text-center text-sm text-wine-dark/60 py-4">Loading...</p>
                ) : rsvps.length === 0 ? (
                  <p className="text-center text-sm text-wine-dark/60 py-4">No RSVPs yet.</p>
                ) : (
                  rsvps.map((rsvp, idx) => (
                    <div key={idx} className="bg-blush-light p-3 rounded-md border border-pink-border/50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-wine-dark text-sm">{rsvp.name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {rsvp.attending === 'yes' ? 'Attending' : 'Declined'}
                        </span>
                      </div>
                      <p className="text-xs text-wine-dark/70 mb-2">{rsvp.email}</p>
                      {rsvp.message && (
                        <p className="text-sm text-wine-dark italic border-l-2 border-pink-border pl-2 mt-2">
                          "{rsvp.message}"
                        </p>
                      )}
                      {rsvp.submittedAt && (
                        <p className="text-[10px] text-wine-dark/40 mt-2 text-right">
                          {new Date(rsvp.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
