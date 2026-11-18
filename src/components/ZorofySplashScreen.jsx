import Image from "next/image";
import React from "react";
import ZorofyAudioLoader from "./ZorofyAudioLoader";

const particles = Array.from({ length: 8 }, (_, index) => index);

export default function ZorofySplashScreen() {
  return (
    <div className="zorofy-splash" role="status" aria-label="Tuning your Zorofy experience">
      <div className="zorofy-splash__ambient" aria-hidden="true" />
      <div className="zorofy-splash__moon" aria-hidden="true" />
      <div className="zorofy-splash__particles" aria-hidden="true">
        {particles.map((particle) => <i key={particle} style={{ "--particle-index": particle }} />)}
      </div>
      <div className="zorofy-splash__slash" aria-hidden="true" />

      <div className="zorofy-splash__brand">
        <Image
          className="zorofy-splash__mascot"
          src="/zorofy-splash-mascot.webp"
          width={720}
          height={658}
          priority
          alt=""
        />
        <Image
          className="zorofy-splash__wordmark"
          src="/zorofy-wordmark.webp"
          width={900}
          height={300}
          priority
          alt="Zorofy"
        />
        <ZorofyAudioLoader size="medium" mode="loading" className="zorofy-splash__waveform" />
        <p className="zorofy-splash__tagline">Tuning your experience</p>
      </div>
      <div className="zorofy-splash__sweep" aria-hidden="true" />
    </div>
  );
}
