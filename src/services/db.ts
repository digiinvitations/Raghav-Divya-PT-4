import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

// The parent official website document key for this project
export const PARENT_TEMPLATE_ID = "remix_icbi4ygegjsukvhzbcijit-14313311583";
export const PARENT_DEPLOYMENT_HASH = "icbi4ygegjsukvhzbcijit-14313311583";

/**
 * Computes an isolated template ID based on the current URL and deployment environment.
 * - If ?template=... is provided in the query string, it uses that explicitly.
 * - On the parent website deployment, it uses the official template ID.
 * - On Vercel or any other host, it uses a sanitized template ID.
 */
export function getDefaultTemplateId(): string {
  if (typeof window === "undefined") return PARENT_TEMPLATE_ID;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get("template");
    if (param && param.trim()) {
      return param.trim();
    }
  } catch {
    // Ignore URL parsing errors
  }

  const hostname = window.location.hostname || "";

  // Parent website deployment identifier:
  if (hostname.includes(PARENT_DEPLOYMENT_HASH)) {
    return PARENT_TEMPLATE_ID;
  }

  // Google AI Studio Remixes (Cloud Run run.app domains)
  if (hostname.includes(".run.app")) {
    // Both dev and preview links (ais-dev-XXX and ais-pre-XXX) share the same deployment core
    const deploymentId = hostname
      .replace(/^ais-(dev|pre)-/, "")
      .replace(/\.asia-southeast1\.run\.app.*$/, "")
      .replace(/\.run\.app.*$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    if (deploymentId) {
      try {
        const savedRemixName = localStorage.getItem(`remix_name_${deploymentId}`);
        if (savedRemixName && savedRemixName.trim()) {
          return savedRemixName.trim();
        }
      } catch {
        // Ignore localStorage error
      }
      return `remix_${deploymentId}`;
    }
  }

  // Local development fallback
  if (hostname === "localhost" || hostname === "127.0.0.1" || !hostname) {
    try {
      let localId = localStorage.getItem("remix_template_id");
      if (!localId || localId === "main 333") {
        localId = PARENT_TEMPLATE_ID;
        localStorage.setItem("remix_template_id", localId);
      }
      return localId;
    } catch {
      return PARENT_TEMPLATE_ID;
    }
  }

  // Custom domain / Vercel host fallback
  const sanitized = hostname.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `remix_${sanitized}`;
}

/**
 * Retrieves wedding data for a template/remix partition.
 * If this remix partition document does not exist yet in Firestore,
 * it immediately creates a new separate document and fields, populated with
 * the complete copy of the project data (Raghav & Divya).
 */
export async function getWeddingData(templateId?: string): Promise<WeddingData> {
  const currentTemplate = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const safeTemplateId = currentTemplate.replace(/\//g, "-");

  try {
    const docRef = doc(db, "weddingConfig", safeTemplateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as WeddingData;
      
      // Patch out expired Pixabay hotlinks that cause "no supported sources" errors
      if (data.heroVideoUrl && data.heroVideoUrl.includes("pixabay")) {
        data.heroVideoUrl = "";
      }
      if (data.musicUrl && data.musicUrl.includes("pixabay")) {
        data.musicUrl = "";
      }

      // AUTO-HEAL: If this document has old placeholder names Vijay or Vashnavi (e.g. from an old template copy on Vercel):
      // Automatically patch it immediately with Raghav & Divya details and update Firestore!
      if (
        data.groom?.name?.includes("Vijay") || 
        data.bride?.name?.includes("Vashnavi") ||
        data.invitationMessage?.includes("Vijay") ||
        data.invitationMessage?.includes("Vashnavi")
      ) {
        data.groom = {
          ...data.groom,
          name: defaultData.groom.name,
          fatherName: defaultData.groom.fatherName || "Vasant Khatavkar",
          motherName: defaultData.groom.motherName || "Saroja Khatavkar",
          parents: defaultData.groom.parents || "Son of Saroja & Vasant Khatavkar"
        };
        data.bride = {
          ...data.bride,
          name: defaultData.bride.name,
          fatherName: defaultData.bride.fatherName || "Rajesh Ghule",
          motherName: defaultData.bride.motherName || "Leena Ghule",
          parents: defaultData.bride.parents || "Daughter of Leena & Rajesh Ghule"
        };
        if (data.invitationMessage) {
          data.invitationMessage = defaultData.invitationMessage;
        }
        if (data.events && Array.isArray(data.events)) {
          data.events = data.events.map(ev => {
            if (ev.hashtag && (ev.hashtag.includes("Vijay") || ev.hashtag.includes("Vashnavi"))) {
              return { ...ev, hashtag: "#RaghavKiDivya" };
            }
            return ev;
          });
        }
        // Save the healed data back to Firestore so it is permanently updated
        setDoc(docRef, data, { merge: true }).catch(console.error);
      }

      return data;
    } else {
      // Document does NOT exist yet!
      // This is a brand new deployment or newly created section.
      // Automatically use the default project data (Raghav & Divya)
      let sourceData: WeddingData = defaultData;

      try {
        const parentDocSnap = await getDoc(doc(db, "weddingConfig", PARENT_TEMPLATE_ID));
        if (parentDocSnap.exists()) {
          const parentData = parentDocSnap.data() as WeddingData;
          // Ensure we only inherit from parent if parent is not old Vijay/Vashnavi
          if (!parentData.groom?.name?.includes("Vijay")) {
            sourceData = parentData;
          }
        }
      } catch (err) {
        console.warn("Could not read parent template data, using bundled default data:", err);
      }

      // Deep clone to create a totally fresh independent data record
      const cleanData: any = JSON.parse(JSON.stringify(sourceData));
      
      // Metadata identifying this separate section
      cleanData._isRemix = safeTemplateId !== PARENT_TEMPLATE_ID;
      cleanData._templateId = safeTemplateId;
      cleanData._createdAt = new Date().toISOString();
      cleanData._parentTemplate = PARENT_TEMPLATE_ID;

      // Persist the copied data directly into this new remix's isolated document
      try {
        await setDoc(docRef, cleanData);
      } catch (saveErr) {
        console.error("Error creating initial document in Firestore:", saveErr);
      }

      return cleanData as WeddingData;
    }
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData; // Fallback
  }
}

/**
 * Saves wedding data strictly to the specified templateId.
 * If saving to a remix, it NEVER modifies the parent "main 333" data.
 */
export async function saveWeddingData(templateId: string, data: WeddingData): Promise<void> {
  const targetId = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const safeTemplateId = targetId.replace(/\//g, "-");
  const docRef = doc(db, "weddingConfig", safeTemplateId);
  
  // Sanitize data to remove any undefined fields that cause Firestore errors
  const cleanData: any = JSON.parse(JSON.stringify(data));
  cleanData._templateId = safeTemplateId;
  cleanData._updatedAt = new Date().toISOString();
  cleanData._isRemix = safeTemplateId !== PARENT_TEMPLATE_ID;

  await setDoc(docRef, cleanData);

  // If saving on the parent website, also keep the deployment URLs updated
  if (safeTemplateId === PARENT_TEMPLATE_ID) {
    try {
      const backupIds = [
        "ais-dev-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app",
        "ais-pre-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app"
      ];
      for (const backupId of backupIds) {
        setDoc(doc(db, "weddingConfig", backupId), cleanData).catch(() => {});
      }
    } catch {
      // non-blocking
    }
  }
}

/**
 * Fetches all unique template / section document IDs stored in Firestore.
 */
export async function getAllTemplateIds(): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, "weddingConfig"));
    const ids: string[] = [];
    snapshot.forEach(docSnap => {
      const id = docSnap.id;
      // Filter out raw hostname backup records to keep list clean and human-readable
      if (!id.includes(".run.app") && id !== "main 222") {
        ids.push(id);
      }
    });

    // Ensure PARENT_TEMPLATE_ID is prominent at the front
    const uniqueIds = Array.from(new Set([PARENT_TEMPLATE_ID, ...ids]));
    return uniqueIds;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [PARENT_TEMPLATE_ID];
  }
}

/**
 * Creates a brand new separate remix section and document in Firestore,
 * copying full data from parent "main 333" (or another source).
 */
export async function createNewRemixSection(customName?: string, sourceTemplateId: string = PARENT_TEMPLATE_ID): Promise<string> {
  const newName = (customName && customName.trim()) 
    ? customName.trim() 
    : `new remix template ${Math.floor(100 + Math.random() * 900)}`;
  const safeId = newName.replace(/\//g, "-");

  let seedData: WeddingData = defaultData;
  try {
    const sourceSnap = await getDoc(doc(db, "weddingConfig", sourceTemplateId));
    if (sourceSnap.exists()) {
      seedData = sourceSnap.data() as WeddingData;
    }
  } catch (err) {
    console.warn("Could not read source template, using defaults", err);
  }

  const cleanData: any = JSON.parse(JSON.stringify(seedData));
  cleanData._isRemix = true;
  cleanData._templateId = safeId;
  cleanData._createdAt = new Date().toISOString();
  cleanData._parentTemplate = sourceTemplateId;

  await setDoc(doc(db, "weddingConfig", safeId), cleanData);
  return safeId;
}

/**
 * Submits an RSVP strictly tagged to this template/remix section.
 */
export async function submitRSVP(rsvpData: any, templateId?: string): Promise<void> {
  const currentTemplate = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const safeTemplateId = currentTemplate.replace(/\//g, "-");

  // Save to isolated subcollection inside weddingConfig/{templateId}/rsvps
  try {
    const subCol = collection(db, "weddingConfig", safeTemplateId, "rsvps");
    await addDoc(subCol, {
      ...rsvpData,
      templateId: safeTemplateId,
      submittedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Could not write to template subcollection:", err);
  }

  // Also write to global rsvps collection with templateId for backwards compatibility
  try {
    const rsvpCollection = collection(db, "rsvps");
    await addDoc(rsvpCollection, {
      ...rsvpData,
      templateId: safeTemplateId,
      submittedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error submitting RSVP globally:", err);
  }
}

/**
 * Fetches RSVPs specifically for this template/remix so lists don't overlap.
 */
export async function getRSVPs(templateId?: string): Promise<any[]> {
  const currentTemplate = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const safeTemplateId = currentTemplate.replace(/\//g, "-");

  try {
    // Check isolated subcollection first
    const subCol = collection(db, "weddingConfig", safeTemplateId, "rsvps");
    const subSnap = await getDocs(subCol);
    if (!subSnap.empty) {
      return subSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    }

    // Fallback: query global rsvps collection and filter for this templateId
    const rsvpCollection = collection(db, "rsvps");
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((item: any) => {
        if (safeTemplateId === PARENT_TEMPLATE_ID) {
          return !item.templateId || item.templateId === PARENT_TEMPLATE_ID;
        }
        return item.templateId === safeTemplateId;
      });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
