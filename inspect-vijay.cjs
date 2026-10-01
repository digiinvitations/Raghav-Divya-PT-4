const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBfG-dTlC3EBkk9p2TJBy3X92-HO4PZOWU",
  authDomain: "english-wedding-template.firebaseapp.com",
  projectId: "english-wedding-template",
  storageBucket: "english-wedding-template.firebasestorage.app",
  messagingSenderId: "467267427353",
  appId: "1:467267427353:web:0c968d348d43d3784b9e88"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  const ids = ["new remix template 055", "new remix template 661", "new remix template 702"];
  for (const id of ids) {
    const snap = await getDoc(doc(db, "weddingConfig", id));
    if (snap.exists()) {
      const data = snap.data();
      console.log(`\n--- ${id} ---`);
      console.log(`Venue: ${data.venue?.name}`);
      console.log(`Timeline: ${data.timeline?.map(t => t.title).join(", ")}`);
      console.log(`Events: ${data.events?.map(e => e.title).join(", ")}`);
    }
  }
  process.exit(0);
}
inspect().catch(console.error);
