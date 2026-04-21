import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function CelebrationListener() {
  useEffect(() => {
    const handler = () => {
      // burst confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // second burst for effect
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 120,
          origin: { y: 0.7 },
        });
      }, 200);
    };

    window.addEventListener("lead:appointment-success", handler);

    return () => {
      window.removeEventListener("lead:appointment-success", handler);
    };
  }, []);

  return null;
}