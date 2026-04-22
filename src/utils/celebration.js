export const triggerCelebration = () => {
  console.log("Celebration triggerred here...");
  window.dispatchEvent(new Event("lead:appointment-success"));
};
