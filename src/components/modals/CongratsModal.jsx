import Modal from "../common/Modal";

export default function CongratsModal({ open, onClose }) {
  return (
    <Modal isOpen={open} onClose={onClose} title="🎉 Great Job!">
      <div className="text-center py-6">
        <h2 className="text-xl font-bold text-emerald-500">
          Appointment Booked!
        </h2>
        <p className="text-slate-500 mt-2">
          Keep it going — you're crushing your targets 🚀
        </p>

        <button
          onClick={onClose}
          className="mt-5 px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer"
        >
          Continue
        </button>
      </div>
    </Modal>
  );
}