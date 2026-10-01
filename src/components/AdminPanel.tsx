import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  getWeddingData, 
  saveWeddingData, 
  getDefaultTemplateId, 
  getAllTemplateIds, 
  createNewRemixSection, 
  PARENT_TEMPLATE_ID 
} from "../services/db";
import { WeddingData, TimelineItem } from "../types";
import { 
  Save, 
  Image as ImageIcon, 
  ArrowLeft, 
  Download, 
  Upload, 
  Plus, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Copy,
  Trash2
} from "lucide-react";

export function AdminPanel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTemplateId = searchParams.get("template") || getDefaultTemplateId();
  
  const [data, setData] = useState<WeddingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState(currentTemplateId);
  const [templateList, setTemplateList] = useState<string[]>([]);
  const [isCreatingRemix, setIsCreatingRemix] = useState(false);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData(currentTemplateId);
      setData(dbData);
      setTemplateId(currentTemplateId);
      
      const allTemplates = await getAllTemplateIds();
      setTemplateList(allTemplates);
    }
    loadData();
  }, [currentTemplateId]);

  if (!data) return <div className="p-8 font-serif">Loading Admin Panel...</div>;

  const isOfficialParent = currentTemplateId === PARENT_TEMPLATE_ID;

  const handleChange = (path: string, value: any) => {
    setData((prev: any) => {
      // Use structuredClone/JSON to safely deep copy the state so we don't mutate prev
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setData((prev: any) => {
        const newGallery = [...(prev.gallery || [])];
        newGallery[index] = base64String;
        return { ...prev, gallery: newGallery };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      handleChange(field, base64String);
    };
    reader.readAsDataURL(file);
  };

  const addGalleryImage = () => {
    setData((prev: any) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ""]
    }));
  };

  const removeGalleryImage = (index: number) => {
    setData((prev: any) => {
      const newGallery = [...(prev.gallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleCreateNewRemix = async () => {
    const defaultNewName = `new remix template ${Math.floor(100 + Math.random() * 900)}`;
    const userChoice = window.prompt(
      "Enter a unique name for this new isolated remix section and fields:",
      defaultNewName
    );
    if (!userChoice || !userChoice.trim()) return;

    setIsCreatingRemix(true);
    try {
      const newRemixId = await createNewRemixSection(userChoice.trim(), currentTemplateId);
      const allTemplates = await getAllTemplateIds();
      setTemplateList(allTemplates);
      alert(`New isolated remix section "${newRemixId}" created successfully! Switching to it now.`);
      navigate(`/admin?template=${encodeURIComponent(newRemixId)}`);
    } catch (err: any) {
      alert("Failed to create new remix section: " + (err.message || "Unknown error"));
    } finally {
      setIsCreatingRemix(false);
    }
  };

  const handleSwitchTemplate = (newSelectedId: string) => {
    if (newSelectedId && newSelectedId !== currentTemplateId) {
      navigate(`/admin?template=${encodeURIComponent(newSelectedId)}`);
    }
  };

  const handleSave = async () => {
    if (!templateId.trim()) {
      alert("Please provide a valid template name");
      return;
    }

    const trimmed = templateId.trim();

    // Safety guard: prevent accidental overwriting of the parent official site from a remix
    if (trimmed === PARENT_TEMPLATE_ID && currentTemplateId !== PARENT_TEMPLATE_ID) {
      const confirmed = window.confirm(
        `WARNING: You are editing remix "${currentTemplateId}", but the target name is set to "${PARENT_TEMPLATE_ID}" (Official Parent Website).\n\nDo you explicitly want to overwrite the official parent website with this remix data?`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      await saveWeddingData(trimmed, data);
      const allTemplates = await getAllTemplateIds();
      setTemplateList(allTemplates);
      alert(`Settings saved successfully into section "${trimmed}"!`);
      if (trimmed !== currentTemplateId) {
        navigate(`/admin?template=${encodeURIComponent(trimmed)}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${templateId || "wedding"}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setData(parsed);
        alert("Data imported successfully! Make sure to click Save Changes to persist it.");
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-blush-main p-4 md:p-8 font-serif text-text-body">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 border border-pink-border">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-pink-border pb-4 gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to={`/?template=${encodeURIComponent(currentTemplateId)}`} 
              className="flex items-center gap-2 text-wine-dark hover:text-burgundy bg-blush-light px-3 py-1.5 rounded-full border border-pink-border/50 transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
            <h1 className="text-3xl font-script text-wine-dark">Admin Panel</h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blush-light text-wine-dark border border-pink-border px-3.5 py-2 h-[38px] rounded-md hover:bg-pink-border/50 transition-colors text-sm"
              title="Export Data"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label 
              className="flex items-center gap-2 bg-blush-light text-wine-dark border border-pink-border px-3.5 py-2 h-[38px] rounded-md hover:bg-pink-border/50 transition-colors cursor-pointer text-sm"
              title="Import Data"
            >
              <Upload className="w-4 h-4" />
              Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 h-[38px] rounded-md hover:bg-wine-dark transition-colors disabled:opacity-50 text-sm font-semibold shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Remix & Data Partition Isolation Manager */}
        <div className="mb-8 p-5 rounded-xl border border-pink-border/80 bg-gradient-to-r from-pink-50/50 via-blush-light to-amber-50/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-pink-border/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-5 h-5 text-burgundy" />
                <h2 className="text-base font-bold text-wine-dark uppercase tracking-wider">
                  Remix &amp; Data Partition Manager
                </h2>
                {isOfficialParent ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-sans font-semibold flex items-center gap-1 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Parent ({PARENT_TEMPLATE_ID})
                  </span>
                ) : (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-sans font-semibold flex items-center gap-1 border border-purple-300">
                    <Sparkles className="w-3.5 h-3.5" /> Isolated Remix Section
                  </span>
                )}
              </div>
              <p className="text-xs text-wine-dark/70 font-sans">
                Every remix creates its own separate database section and fields. Changes made here will <strong className="font-semibold text-wine-dark">never overlap or overwrite</strong> the official website or any other remix.
              </p>
            </div>

            <button
              onClick={handleCreateNewRemix}
              disabled={isCreatingRemix}
              className="flex items-center gap-1.5 bg-burgundy text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-wine-dark transition-colors shadow-sm disabled:opacity-50 shrink-0 font-sans"
            >
              <Plus className="w-4 h-4" />
              {isCreatingRemix ? "Creating..." : "Create New Remix Section"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-sans text-sm">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-wine-dark/80 block mb-1">
                Switch Between Existing Sections / Remixes:
              </label>
              <select
                value={currentTemplateId}
                onChange={(e) => handleSwitchTemplate(e.target.value)}
                className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent"
              >
                {templateList.map((id) => (
                  <option key={id} value={id}>
                    {id === PARENT_TEMPLATE_ID ? `⭐ ${id} (Official Parent Website)` : `📂 ${id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-wine-dark/80 block mb-1">
                Save Target Template / Section Name:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  placeholder="e.g., new remix template 001"
                  className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Couple Details */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Couple Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Groom</h3>
                <Input label="Name" value={data.groom.name} onChange={(v) => handleChange("groom.name", v)} />
                <Input label="Father's Name" value={data.groom.fatherName || ""} onChange={(v) => handleChange("groom.fatherName", v)} />
                <Input label="Mother's Name" value={data.groom.motherName || ""} onChange={(v) => handleChange("groom.motherName", v)} />
                <Input label="Parents (Lineage display)" value={data.groom.parents} onChange={(v) => handleChange("groom.parents", v)} />
                <Input label="Education" value={data.groom.education} onChange={(v) => handleChange("groom.education", v)} />
                <Input label="Profession" value={data.groom.profession} onChange={(v) => handleChange("groom.profession", v)} />
              </div>
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Bride</h3>
                <Input label="Name" value={data.bride.name} onChange={(v) => handleChange("bride.name", v)} />
                <Input label="Father's Name" value={data.bride.fatherName || ""} onChange={(v) => handleChange("bride.fatherName", v)} />
                <Input label="Mother's Name" value={data.bride.motherName || ""} onChange={(v) => handleChange("bride.motherName", v)} />
                <Input label="Parents (Lineage display)" value={data.bride.parents} onChange={(v) => handleChange("bride.parents", v)} />
                <Input label="Education" value={data.bride.education} onChange={(v) => handleChange("bride.education", v)} />
                <Input label="Profession" value={data.bride.profession} onChange={(v) => handleChange("bride.profession", v)} />
              </div>
            </div>
          </section>

          {/* Event Date & Time */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Event Date &amp; Time</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Target Date (Countdown ISO)" value={data.weddingDate} onChange={(v) => handleChange("weddingDate", v)} type="datetime-local" />
                <Input label="Formatted Date" value={data.weddingDateFormatted} onChange={(v) => handleChange("weddingDateFormatted", v)} />
                <Input label="Formatted Time" value={data.weddingTimeFormatted} onChange={(v) => handleChange("weddingTimeFormatted", v)} />
                <Input label="Day of Week" value={data.weddingDayFormatted} onChange={(v) => handleChange("weddingDayFormatted", v)} />
             </div>
          </section>

          {/* Messages */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Messages &amp; Text</h2>
             <div className="space-y-4">
               <TextArea label="Hero Message" value={data.heroMessage} onChange={(v) => handleChange("heroMessage", v)} />
               <TextArea label="Invitation Message" value={data.invitationMessage} onChange={(v) => handleChange("invitationMessage", v)} />
               <TextArea label="Transportation Details" value={data.transportation} onChange={(v) => handleChange("transportation", v)} />
               <Input label="Dress Code" value={data.dressCode} onChange={(v) => handleChange("dressCode", v)} />
               <TextArea label="Closing Message" value={data.closingMessage} onChange={(v) => handleChange("closingMessage", v)} />
             </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Events</h2>
            <div className="space-y-4">
              {data.events.map((event, idx) => (
                <div key={event.id || idx} className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-wine-dark">Event {idx + 1}</h3>
                    <button onClick={() => {
                      const newEvents = [...data.events];
                      newEvents.splice(idx, 1);
                      handleChange("events", newEvents);
                    }} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Event Title" value={event.title} onChange={(v) => handleChange(`events.${idx}.title`, v)} />
                    <Input label="Subtitle" value={event.subtitle || ""} onChange={(v) => handleChange(`events.${idx}.subtitle`, v)} placeholder="e.g. PLEASE JOIN US FOR..." />
                    <Input label="Hashtag" value={event.hashtag || ""} onChange={(v) => handleChange(`events.${idx}.hashtag`, v)} placeholder="e.g. #SunMeetsSky" />
                    <Input label="Date" value={event.date} type="date" onChange={(v) => handleChange(`events.${idx}.date`, v)} />
                    <Input label="Time (e.g., 7:00 PM)" value={event.time} onChange={(v) => handleChange(`events.${idx}.time`, v)} />
                    <Input label="Location Name" value={event.location} onChange={(v) => handleChange(`events.${idx}.location`, v)} />
                    <TextArea label="Description" value={event.description || ""} onChange={(v) => handleChange(`events.${idx}.description`, v)} />
                    <Input label="Map Link (URL)" value={event.mapUrl || ""} onChange={(v) => handleChange(`events.${idx}.mapUrl`, v)} />
                    
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-pink-border/50 pt-4 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Background Image URL</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.backgroundUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.backgroundUrl || ""} onChange={(e) => handleChange(`events.${idx}.backgroundUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.backgroundUrl && <img src={event.backgroundUrl} className="w-16 h-24 object-cover rounded-md mt-1" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Logo URL</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.logoUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.logoUrl || ""} onChange={(e) => handleChange(`events.${idx}.logoUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.logoUrl && <img src={event.logoUrl} className="w-12 h-12 object-contain rounded-md mt-1" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Caricature URL</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.caricatureUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.caricatureUrl || ""} onChange={(e) => handleChange(`events.${idx}.caricatureUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.caricatureUrl && <img src={event.caricatureUrl} className="w-16 h-16 object-contain rounded-md mt-1" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Timeline Circular Image</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.circularImageUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.circularImageUrl || ""} onChange={(e) => handleChange(`events.${idx}.circularImageUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.circularImageUrl && <img src={event.circularImageUrl} className="w-16 h-16 object-cover rounded-full mt-1 border border-pink-border" />}
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-pink-border/50 pt-4 mt-2">
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showTitle !== false} onChange={(e) => handleChange(`events.${idx}.showTitle`, e.target.checked)} /> Show Title</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showSubtitle !== false} onChange={(e) => handleChange(`events.${idx}.showSubtitle`, e.target.checked)} /> Show Subtitle</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showHashtag !== false} onChange={(e) => handleChange(`events.${idx}.showHashtag`, e.target.checked)} /> Show Hashtag</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showDate !== false} onChange={(e) => handleChange(`events.${idx}.showDate`, e.target.checked)} /> Show Date</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showTime !== false} onChange={(e) => handleChange(`events.${idx}.showTime`, e.target.checked)} /> Show Time</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showLocation !== false} onChange={(e) => handleChange(`events.${idx}.showLocation`, e.target.checked)} /> Show Location</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showDescription !== false} onChange={(e) => handleChange(`events.${idx}.showDescription`, e.target.checked)} /> Show Description</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showLogo !== false} onChange={(e) => handleChange(`events.${idx}.showLogo`, e.target.checked)} /> Show Logo</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showCaricature !== false} onChange={(e) => handleChange(`events.${idx}.showCaricature`, e.target.checked)} /> Show Caricature</label>
                    </div>

                    <div className="md:col-span-2">
                       <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Decorative Style (Particles/Colors)</label>
                       <select value={event.decorativeStyle || "none"} onChange={(e) => handleChange(`events.${idx}.decorativeStyle`, e.target.value)} className="w-full mt-1 bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent">
                         <option value="none">None (Clean overlay)</option>
                         <option value="haldi">Haldi (Yellow / Gold / Floral)</option>
                         <option value="mehndi">Mehndi (Green / Emerald)</option>
                         <option value="sangeet">Sangeet (Purple / Indigo)</option>
                         <option value="wedding">Wedding (Burgundy / Royal)</option>
                       </select>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const newEvent = {
                  id: Date.now().toString(),
                  title: "New Event",
                  date: "",
                  time: "",
                  location: "",
                  videoUrl: "",
                  mapUrl: ""
                };
                handleChange("events", [...data.events, newEvent]);
              }} className="text-wine-dark hover:bg-blush-light px-4 py-2 rounded-md border border-pink-border w-full text-center">
                + Add Event
              </button>
            </div>
          </section>

          {/* Timeline Schedule Section */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Timeline / Schedule Section</h2>
            <div className="space-y-4">
              {(data.timeline || []).map((item, idx) => (
                <div key={item.id || idx} className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-wine-dark">Schedule Item {idx + 1}</h3>
                    <button 
                      onClick={() => {
                        const newTimeline = [...(data.timeline || [])];
                        newTimeline.splice(idx, 1);
                        handleChange("timeline", newTimeline);
                      }} 
                      className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Title" value={item.title || ""} onChange={(v) => handleChange(`timeline.${idx}.title`, v)} />
                    <Input label="Date" value={item.date || ""} onChange={(v) => handleChange(`timeline.${idx}.date`, v)} placeholder="e.g. Nov 24, 2026" />
                    <Input label="Time" value={item.time || ""} onChange={(v) => handleChange(`timeline.${idx}.time`, v)} placeholder="e.g. 10:00 AM" />
                    <div className="md:col-span-3">
                      <Input label="Description" value={item.description || ""} onChange={(v) => handleChange(`timeline.${idx}.description`, v)} />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newItem: TimelineItem = {
                    id: Date.now().toString(),
                    title: "New Ceremony",
                    date: "Nov 25, 2026",
                    time: "11:00 AM",
                    description: "Ceremony details"
                  };
                  handleChange("timeline", [...(data.timeline || []), newItem]);
                }} 
                className="text-wine-dark hover:bg-blush-light px-4 py-2 rounded-md border border-pink-border w-full text-center"
              >
                + Add Timeline Item
              </button>
            </div>
          </section>

          {/* Photo Gallery Section */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Photo Gallery Section</h2>
            <div className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(data.gallery || []).map((imgUrl, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-pink-border/60 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-wine-dark">Photo {idx + 1}</span>
                      <button 
                        onClick={() => removeGalleryImage(idx)} 
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {imgUrl ? (
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-32 object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                        No image uploaded
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, idx)}
                      className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={imgUrl || ""} 
                      onChange={(e) => {
                        const newGallery = [...(data.gallery || [])];
                        newGallery[idx] = e.target.value;
                        handleChange("gallery", newGallery);
                      }} 
                      placeholder="Or paste image URL" 
                      className="w-full bg-white border border-pink-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-pink-accent" 
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={addGalleryImage}
                className="text-wine-dark hover:bg-white px-4 py-2 rounded-md border border-pink-border w-full text-center text-sm font-semibold transition-colors"
              >
                + Add Photo to Gallery
              </button>
            </div>
          </section>

          {/* Media Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Media Settings</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              
              <div className="flex flex-col gap-2">
                <h3 className="font-bold">Opening Thumbnail (Click to Enter)</h3>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'openingThumbnailUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input label="Or Thumbnail URL" value={data.openingThumbnailUrl || ""} onChange={(v) => handleChange("openingThumbnailUrl", v)} />
                {data.openingThumbnailUrl && <img src={data.openingThumbnailUrl} className="w-24 h-24 object-cover rounded-md mt-2" />}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Video</h3>
                <p className="text-xs opacity-70">Plays immediately after clicking the thumbnail. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Video URL" value={data.openingVideoUrl || ""} onChange={(v) => handleChange("openingVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">OG Image URL (Social Sharing Preview)</h3>
                <p className="text-xs opacity-70">Image shown when sharing the link on WhatsApp, Facebook, etc. Direct URL.</p>
                <Input label="OG Image URL" value={data.ogImageUrl || ""} onChange={(v) => handleChange("ogImageUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Hero Section Video</h3>
                <p className="text-xs opacity-70">Background video for the first section. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Hero Video URL" value={data.heroVideoUrl || ""} onChange={(v) => handleChange("heroVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Background Music</h3>
                <p className="text-xs opacity-70">Direct link to an audio file (e.g., .mp3) to play in the background.</p>
                <Input label="Music URL" value={data.musicUrl || ""} onChange={(v) => handleChange("musicUrl", v)} />
              </div>
            </div>
          </section>

          {/* Venue Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Venue Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input label="Venue Name" value={data.venue.name} onChange={(v) => handleChange("venue.name", v)} />
              <Input label="Address Line 1" value={data.venue.addressLine1} onChange={(v) => handleChange("venue.addressLine1", v)} />
              <Input label="Address Line 2" value={data.venue.addressLine2} onChange={(v) => handleChange("venue.addressLine2", v)} />
              <Input label="Google Maps URL" value={data.venue.mapUrl} onChange={(v) => handleChange("venue.mapUrl", v)} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <textarea 
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent resize-y"
      />
    </div>
  );
}
