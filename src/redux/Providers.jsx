"use client";

import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import ZorofySplashScreen from "@/components/ZorofySplashScreen";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<ZorofySplashScreen />}
        persistor={persistor}
        onBeforeLift={() => new Promise((resolve) => {
          const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
          window.setTimeout(resolve, reducedMotion ? 300 : 2250);
        })}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
