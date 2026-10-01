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

async function dump() {
  const ids = ["mainmain", "NEW TEMPLATE FOR 7ganpati_", "new remix template 055", "new remix template 661", "new remix template 702", "wedding_data_rl2cohqvo2tuixw5mclqfx-14313311583"];
  for(let id of ids) {
    const docSnap = await getDoc(doc(db, "weddingConfig", id));
    if(docSnap.exists()) {
      const data = docSnap.data();
      console.log(`\n--- DOC: ${id} ---`);
      console.log(`Groom: ${data.groom?.name}, Bride: ${data.bride?.name}`);
      console.log(`Venue: ${data.venue?.name}`);
    }
  }
  process.exit(0);
}
dump().catch(console.error);
