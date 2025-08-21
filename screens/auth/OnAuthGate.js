import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import TermsModal from "../../components/TermsModal";
import { LEGAL_CONFIG } from "../../config/legal";
import * as Localization from "expo-localization";
import Constants from "expo-constants";

const OnAuthGate = ({ children }) => {
  const [user, setUser] = useState(null);
  const [consent, setConsent] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const locale = Localization.getLocales()[0]?.languageCode || "en";
  const appVersion = Constants.manifest?.version || "1.0.0";

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setConsent(null);
        setShowModal(false);
        setChecking(false);
        return;
      }
      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const userConsent = data.consent || null;
        setConsent(userConsent);

        const needsConsent =
          !userConsent ||
          userConsent.tosVersion !== LEGAL_CONFIG.TOS_VERSION ||
          userConsent.privacyVersion !== LEGAL_CONFIG.PRIVACY_VERSION;

        setShowModal(needsConsent);
      } catch (err) {
        setConsent(null);
        setShowModal(true);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleConsentDone = () => {
    setShowModal(false);
  };

  if (checking) return null;

  if (!user) return children;

  return (
    <>
      {showModal && (
        <TermsModal
          visible={showModal}
          onDone={handleConsentDone}
          locale={locale}
          appVersion={appVersion}
          TOS_VERSION={LEGAL_CONFIG.TOS_VERSION}
          PRIVACY_VERSION={LEGAL_CONFIG.PRIVACY_VERSION}
        />
      )}
      {!showModal && children}
    </>
  );
};

export default OnAuthGate;