export const triggerCelebration = () => {
  window.dispatchEvent(new Event("lead:appointment-success"));
};