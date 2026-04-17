import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Phone, PhoneOff, Keyboard, Delete } from "lucide-react";

const formatDisplayNumber = (value) =>
  String(value || "").replace(/[^\d+]/g, "");

export default function DirectDialerPage() {
  const { showNotification, twilioDialer } = useOutletContext();
  const [phoneNumber, setPhoneNumber] = useState("");
  // const [isDialing, setIsDialing] = useState(false);
  const [callMethod, setCallMethod] = useState("twilio"); // "twilio" or "zoom"
  const [inCallDigits, setInCallDigits] = useState("");
  const isDialing =
    twilioDialer?.callStatus === "ringing" ||
    twilioDialer?.callStatus === "connected";
  const isInCall =
    callMethod === "twilio" &&
    (twilioDialer?.callStatus === "ringing" ||
      twilioDialer?.callStatus === "connected");

  // const statusText = useMemo(() => {
  //   return isDialing ? "Calling..." : "Ready to dial";
  // }, [isDialing]);

  const statusText = useMemo(() => {
    if (callMethod === "zoom") return "Zoom handles call externally";

    switch (twilioDialer?.callStatus) {
      case "ringing":
        return "Ringing...";
      case "connected":
        return "In Call";
      default:
        return "Ready to dial";
    }
  }, [twilioDialer?.callStatus, callMethod]);

  const appendDigit = (digit) => {
    setPhoneNumber((prev) => `${prev}${digit}`.slice(0, 20));
  };

  const clearNumber = () => setPhoneNumber("");

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  // const handleDial = async () => {
  //   if (!phoneNumber) return;
  //   setIsDialing(true);
  //   try {
  //     if (callMethod === "zoom") {
  //       window.open(`zoomphonecall://${phoneNumber}`, "_self");
  //       showNotification(`Calling ${phoneNumber} via Zoom`, "success");
  //     } else {
  //       if (typeof twilioDialer?.placeOutgoingCall === "function") {
  //         const result = await twilioDialer.placeOutgoingCall(phoneNumber);
  //         if (result?.success) {
  //           showNotification(`Calling ${phoneNumber} via Twilio`, "success");
  //         } else {
  //           showNotification(result?.error || "Twilio call failed", "error");
  //         }
  //       } else {
  //         showNotification("Twilio dialer not available", "error");
  //       }
  //     }
  //   } catch (error) {
  //     showNotification(`Failed to launch ${callMethod === "zoom" ? "Zoom" : "Twilio"} call`, "error");
  //   } finally {
  //     setIsDialing(false);
  //   }
  // };

  const handleDial = async () => {
    if (!phoneNumber) return;

    try {
      if (callMethod === "zoom") {
        window.open(`zoomphonecall://${phoneNumber}`, "_self");
        showNotification(`Calling ${phoneNumber} via Zoom`, "success");
        return; // 🚀 IMPORTANT
      }

      if (typeof twilioDialer?.placeOutgoingCall === "function") {
        const result = await twilioDialer.placeOutgoingCall(phoneNumber);

        if (result?.success) {
          showNotification(`Calling ${result.number} via Twilio`, "success");
          setInCallDigits("");
        } else {
          showNotification(result?.error || "Twilio call failed", "error");
        }
      } else {
        showNotification("Twilio dialer not available", "error");
      }
    } catch (error) {
      showNotification("Failed to start call", "error");
    }
  };

  const handleHangup = () => {
    if (callMethod === "twilio") {
      twilioDialer?.hangupActiveCall?.();
      showNotification("Call ended", "info");
    } else {
      showNotification("End call from Zoom app", "info");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Direct Dialer
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Call any number directly from your browser
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-4">
          <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
            Call Method
          </label>
          <select
            value={callMethod}
            onChange={(e) => setCallMethod(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
          >
            <option value="twilio">Twilio</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>
        <div className="mb-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/40 px-4 py-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Status
          </p>
          <p className="text-sm font-semibold text-cyan-300">{statusText}</p>
        </div>

        <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
          Phone Number
        </label>
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatDisplayNumber(e.target.value))}
          placeholder="+1 405 555 1212"
          className="w-full mb-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
        />

        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
            (digit) => (
              <button
                key={digit}
                // onClick={() => appendDigit(digit)}
                onClick={() => {
                  if (isInCall && twilioDialer?.activeCall) {
                    twilioDialer.activeCall.sendDigits(digit);
                    setInCallDigits((prev) => `${prev}${digit}`.slice(0, 20));
                    console.log("Sent DTMF:", digit);
                  } else {
                    appendDigit(digit);
                  }
                }}
                className="rounded-lg border border-slate-300/80 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/80 py-3 text-slate-800 dark:text-slate-100 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 dark:hover:bg-slate-600 hover:text-cyan-700 dark:hover:text-cyan-200 hover:border-cyan-300 dark:hover:border-cyan-500"
                type="button"
              >
                {digit}
              </button>
            ),
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={clearNumber}
            type="button"
            className="rounded-lg bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-500/25 dark:hover:bg-amber-500/30 hover:border-amber-400"
          >
            Clear All
          </button>
          <button
            onClick={handleDial}
            // disabled={!phoneNumber || isDialing}
            disabled={
              !phoneNumber ||
              isDialing ||
              (callMethod === "twilio" && !twilioDialer?.isReady)
            }
            type="button"
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:shadow-none"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {isDialing ? "Calling..." : "Call"}
            </span>
          </button>
          <button
            onClick={handleBackspace}
            disabled={!phoneNumber}
            type="button"
            className="rounded-lg bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 py-2 text-sm font-semibold text-rose-800 dark:text-rose-200 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-500/25 dark:hover:bg-rose-500/30 hover:border-rose-400 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:border-slate-300 dark:disabled:border-slate-600 disabled:shadow-none"
          >
            <span className="inline-flex items-center gap-2">
              <Delete className="w-4 h-4" />
              Backspace
            </span>
          </button>
        </div>

        <button
          onClick={handleHangup}
          // disabled={true}
          disabled={!twilioDialer?.activeCall}
          type="button"
          className="mt-3 w-full rounded-lg bg-slate-400/20 dark:bg-slate-600/40 border border-slate-300 dark:border-slate-600 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="inline-flex items-center gap-2">
            <PhoneOff className="w-4 h-4" />
            Hang Up
          </span>
        </button>

        {/* <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          Browser mic permission is required for audio.
        </div> */}
      </div>
    </div>
  );
}
