const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, setDoc } = require("firebase/firestore");

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

async function recover() {
  const snap = await getDoc(doc(db, "weddingConfig", "ganpati_main"));
  if (snap.exists()) {
    const data = snap.data();
    
    // Also save to "main 222" and the hostname just to be safe
    const hostnames = [
      "main 222",
      "ais-dev-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app",
      "ais-pre-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app"
    ];
    
    for (const host of hostnames) {
      await setDoc(doc(db, "weddingConfig", host), data);
      console.log(`Recovered Vijay/Vashnavi data into: ${host}`);
    }
  } else {
    console.log("Could not find 'ganpati_main'");
  }
  process.exit(0);
}
recover().catch(console.error);
