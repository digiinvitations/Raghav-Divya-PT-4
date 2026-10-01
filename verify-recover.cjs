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

async function verify() {
  const snap = await getDoc(doc(db, "weddingConfig", "ais-dev-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app"));
  const data = snap.data();
  console.log(`Verified Venue: ${data.venue?.name}`);
  console.log(`Verified Hero Video: ${data.heroVideoUrl}`);
  process.exit(0);
}
verify().catch(console.error);
