import { w as writable } from "./index2.js";
const activeTab = writable("calculator");
const showTacoRain = writable(false);
const currentUser = writable(null);
const newAchievements = writable([]);
const showAchievementModal = writable(false);
export {
  showAchievementModal as a,
  activeTab as b,
  currentUser as c,
  newAchievements as n,
  showTacoRain as s
};
