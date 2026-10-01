const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function dumpAll() {
  const snapshot = await getDocs(collection(db, "weddingConfig"));
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\n--- DOC: ${doc.id} ---`);
    console.log(`Groom: ${data.groom?.name}, Bride: ${data.bride?.name}`);
    console.log(`Venue: ${data.venue?.name}`);
    console.log(`Updated (approx string length): ${JSON.stringify(data).length}`);
  });
  process.exit(0);
}
dumpAll().catch(console.error);
