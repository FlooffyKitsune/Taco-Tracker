import { c as create_ssr_component, d as subscribe, f as add_attribute, e as escape, b as each, v as validate_component } from "../../chunks/ssr.js";
import { c as currentUser, b as activeTab } from "../../chunks/stores.js";
import { g as getCategoryColor, a as getPointsColor } from "../../chunks/achievements.js";
const TACO_TYPES = [
  { id: "chicken", name: "Chicken", emoji: "🐔", color: "bg-yellow-400" },
  { id: "carne-asada", name: "Carne Asada", emoji: "🥩", color: "bg-amber-600" },
  { id: "chorizo", name: "Chorizo", emoji: "🌶️", color: "bg-orange-500" },
  { id: "carnitas", name: "Carnitas", emoji: "🐷", color: "bg-pink-400" },
  { id: "fish", name: "Fish", emoji: "🐟", color: "bg-blue-400" },
  { id: "lengua", name: "Lengua", emoji: "👅", color: "bg-purple-500" },
  { id: "pastor", name: "Pastor", emoji: "🍖", color: "bg-red-600" },
  { id: "vegetariano", name: "Vegetariano", emoji: "🥬", color: "bg-green-400" },
  { id: "shrimp", name: "Shrimp", emoji: "🍤", color: "bg-pink-500" },
  { id: "capechano", name: "Capechano", emoji: "🔥", color: "bg-amber-600" },
  { id: "beyond", name: "Beyond", emoji: "🌱", color: "bg-emerald-500" },
  { id: "quesabirria", name: "Quesabirria", emoji: "🧀", color: "bg-yellow-600" }
];
const DEFAULT_TACO_DISTRIBUTION = [
  { typeId: "chicken", ratio: 2 },
  { typeId: "carne-asada", ratio: 2 },
  { typeId: "chorizo", ratio: 1 }
];
function calculateTacoOrder(peopleCount, customDistribution, tacoTypes) {
  const distribution = customDistribution || DEFAULT_TACO_DISTRIBUTION;
  const availableTacoTypes = tacoTypes || TACO_TYPES;
  const totalRatio = distribution.reduce((sum, item) => sum + item.ratio, 0);
  const tacosPerPerson = Math.ceil(totalRatio);
  const totalTacos = tacosPerPerson * peopleCount;
  const orders = distribution.map((item) => {
    const tacoType = availableTacoTypes.find((t) => t.id === item.typeId);
    const quantity = item.ratio / totalRatio * totalTacos;
    return {
      type: tacoType,
      quantity: Math.round(quantity)
    };
  });
  const adjustedTotal = Math.ceil(totalTacos / 3) * 3;
  const adjustment = adjustedTotal - totalTacos;
  if (adjustment > 0) {
    const popularType = orders.reduce(
      (prev, current) => prev.quantity > current.quantity ? prev : current
    );
    popularType.quantity += adjustment;
  }
  return {
    totalTacos: adjustedTotal,
    orders
  };
}
const TacoCalculator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentUser, $$unsubscribe_currentUser;
  $$unsubscribe_currentUser = subscribe(currentUser, (value) => $currentUser = value);
  let peopleCount = 3;
  let distribution = [...DEFAULT_TACO_DISTRIBUTION];
  let selectedUsers = [];
  let tacoTypes = [];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    tacoTypes.length > 0 ? calculateTacoOrder(Math.max(peopleCount, selectedUsers.length + ($currentUser ? 1 : 0)), distribution, tacoTypes) : null;
    tacoTypes.filter((type) => !distribution.find((item) => item.typeId === type.id));
    $$rendered = `<div class="card-3d rounded-xl p-6 slide-in"><h2 class="text-2xl font-bold text-gray-800 mb-6 text-center" data-svelte-h="svelte-1sj7gor">🌮 Taco Order Calculator</h2> ${`<div class="text-center py-8" data-svelte-h="svelte-194fwa0"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div> <p class="mt-2 text-gray-600">Loading taco types...</p></div>`}</div>`;
  } while (!$$settled);
  $$unsubscribe_currentUser();
  return $$rendered;
});
const ConsumptionTracker = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalTacos;
  let personName = "";
  let tacoEntries = [];
  let isSubmitting = false;
  totalTacos = tacoEntries.reduce((total, entry) => total + entry.quantity, 0);
  return `<div class="card-3d rounded-xl p-6 slide-in"><h2 class="text-2xl font-bold text-white mb-6 text-center" data-svelte-h="svelte-15cekeo">📊 Track Your Taco Feast</h2> <form class="space-y-6"><div><label for="person-name" class="block text-sm font-medium text-white/90 mb-2" data-svelte-h="svelte-2pqbin">Your Name</label> <input id="person-name" type="text" class="w-full px-4 py-3 rounded-lg transition-all duration-300" placeholder="Enter your name..." required${add_attribute("value", personName, 0)}></div> <div><div class="text-sm font-medium text-white/90 mb-3" data-svelte-h="svelte-16dk3gn">Select Tacos You&#39;ve Eaten</div> <div class="grid grid-cols-2 gap-3 mb-4">${`<div class="col-span-2 text-center py-4" data-svelte-h="svelte-qgiv1f"><div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> <p class="mt-2 text-white/70">Loading taco types...</p></div>`}</div></div> ${tacoEntries.length > 0 ? `<div class="bg-white/5 rounded-lg p-4 border border-white/10"><h3 class="text-lg font-semibold text-white mb-3 flex items-center">🌮 Your Taco Selections
					<span class="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">${escape(totalTacos)} total</span></h3> <div class="space-y-3">${each(tacoEntries, (entry, index) => {
    return `<div class="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"><div class="flex items-center space-x-3"><span class="text-2xl">${escape(entry.tacoType.emoji)}</span> <span class="font-medium text-white">${escape(entry.tacoType.name)}</span></div> <div class="flex items-center space-x-3"><button type="button" class="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all duration-200" data-svelte-h="svelte-1jlbl3k">-</button> <span class="text-xl font-bold text-white min-w-[2rem] text-center">${escape(entry.quantity)}</span> <button type="button" class="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all duration-200" data-svelte-h="svelte-i724f4">+</button> <button type="button" class="w-8 h-8 rounded-full bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 transition-all duration-200 ml-2" data-svelte-h="svelte-ahhf86">×
								</button></div> </div>`;
  })}</div></div>` : ``} <button type="submit" ${!personName.trim() || tacoEntries.length === 0 || isSubmitting ? "disabled" : ""} class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth shadow-lg">${escape(`🎯 RECORD ${totalTacos} TACO${totalTacos !== 1 ? "S" : ""} 🏆`)}</button></form></div>`;
});
function getAchievementBadge(totalTacos) {
  if (totalTacos >= 100) return "🏆 Taco Legend";
  if (totalTacos >= 50) return "🥇 Taco Master";
  if (totalTacos >= 25) return "🥈 Taco Expert";
  if (totalTacos >= 10) return "🥉 Taco Enthusiast";
  if (totalTacos >= 5) return "🌮 Taco Lover";
  return "🌱 Taco Newbie";
}
const TacoStats = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let favoriteTaco;
  let $$unsubscribe_currentUser;
  $$unsubscribe_currentUser = subscribe(currentUser, (value) => value);
  let stats = {
    totalTacosConsumed: 0,
    favoriteTacoType: "",
    recentConsumptions: [],
    recentSessions: [],
    recentMultiConsumptions: []
  };
  let leaderboard = [];
  let unlockedAchievements = [];
  let tacoTypes = [];
  favoriteTaco = tacoTypes.find((t) => t.id === stats.favoriteTacoType);
  $$unsubscribe_currentUser();
  return `<div class="space-y-6 slide-in"> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="bg-gradient-to-br from-taco-orange to-taco-red text-white rounded-xl p-6 card-3d"><h3 class="text-lg font-bold mb-2 text-white" data-svelte-h="svelte-dojxzq">🏆 Total Tacos Consumed</h3> <p class="text-4xl font-bold">${escape(stats.totalTacosConsumed)}</p></div> <div class="bg-gradient-to-br from-taco-yellow to-taco-orange text-white rounded-xl p-6 card-3d"><h3 class="text-lg font-bold mb-2 text-white" data-svelte-h="svelte-d944tw">❤️ Favorite Taco</h3> <div class="flex items-center space-x-2">${favoriteTaco ? `<span class="text-3xl">${escape(favoriteTaco.emoji)}</span> <span class="text-xl font-bold">${escape(favoriteTaco.name)}</span>` : `<span class="text-xl" data-svelte-h="svelte-if6zm5">No data yet!</span>`}</div></div></div>  <div class="achievement-panel card-3d rounded-xl p-6"><h3 class="text-xl font-bold achievement-title mb-4" data-svelte-h="svelte-1ydz4dr">🏆 Achievements Unlocked</h3> ${unlockedAchievements.length > 0 ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">${each(unlockedAchievements, (userAchievement, index) => {
    return `<div class="${"achievement-item p-4 rounded-lg border-2 " + escape(getCategoryColor(userAchievement.achievement.category), true) + " stagger-item"}" style="${"animation-delay: " + escape(index * 0.1, true) + "s"}"><div class="flex items-center space-x-3"><span class="text-2xl">${escape(userAchievement.achievement.icon)}</span> <div><h4 class="font-bold text-white">${escape(userAchievement.achievement.name)}</h4> <p class="text-sm text-white/90">${escape(userAchievement.achievement.description)}</p> <span class="${"text-xs uppercase font-bold " + escape(getPointsColor(userAchievement.achievement.requirement), true) + " px-2 py-1 rounded mt-1 inline-block"}">${escape(userAchievement.achievement.requirement)} pts</span> </div></div> </div>`;
  })}</div>` : `<p class="text-white/70 text-center py-4" data-svelte-h="svelte-m405qa">Start tracking tacos to unlock achievements! 🌮</p>`}</div>  <div class="card-3d rounded-xl p-6"><h3 class="text-xl font-bold text-white mb-4 flex items-center">🏆 Taco Leaderboard
			<span class="ml-2 text-sm bg-blue-500/20 px-2 py-1 rounded-full">${escape(leaderboard.length)} players</span></h3> ${leaderboard.length > 0 ? `<div class="space-y-3">${each(leaderboard, (player, index) => {
    return `<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"><div class="flex items-center space-x-4"><div class="${"flex items-center justify-center w-8 h-8 rounded-full " + escape(
      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500/20",
      true
    ) + " text-white font-bold text-sm"}">${escape(index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1)}</div> <div><p class="font-bold text-white">${escape(player.name)}</p> <p class="text-sm text-white/70">${escape(getAchievementBadge(player.totalTacos))}</p> </div></div> <div class="text-right"><p class="text-xl font-bold text-white">${escape(player.totalTacos)}</p> <p class="text-xs text-white/60">${escape(player.sessions)} session${escape(player.sessions !== 1 ? "s" : "")}</p></div> </div>`;
  })}</div>` : `<p class="text-white/70 text-center py-4" data-svelte-h="svelte-5rl1ro">No leaderboard data yet! Start tracking tacos to compete! 🌮</p>`}</div>  <div class="card-3d rounded-xl p-6"><h3 class="text-xl font-bold text-white mb-4" data-svelte-h="svelte-14h48n8">🍽️ Recent Taco Sessions</h3> ${stats.recentMultiConsumptions.length > 0 ? `<div class="space-y-3">${each(stats.recentMultiConsumptions, (session) => {
    return `<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"><div class="flex items-center space-x-3"><div class="text-2xl" data-svelte-h="svelte-11fn659">🌮</div> <div><p class="font-medium text-white">${escape(session.personName)}</p> <p class="text-sm text-white/70">${escape(session.totalTacos)} taco${escape(session.totalTacos !== 1 ? "s" : "")} • ${escape(session.date)}</p> <div class="flex space-x-1 mt-1">${each(session.entries, (entry) => {
      return `<span class="text-sm bg-white/10 px-2 py-1 rounded">${escape(entry.tacoType.emoji)} ${escape(entry.quantity)} </span>`;
    })}</div> </div></div> <button class="text-red-400 hover:text-red-300 font-bold" data-svelte-h="svelte-1yasdtq">×</button> </div>`;
  })}</div>` : `<p class="text-white/70 text-center py-4" data-svelte-h="svelte-ubk5u9">No taco sessions yet! Start tracking your taco feasts! 🌮</p>`}</div>  <div class="card-3d rounded-xl p-6"><h3 class="text-xl font-bold text-white mb-4" data-svelte-h="svelte-166bthy">🕰️ Recent Individual Consumption</h3> ${stats.recentConsumptions.length > 0 ? `<div class="space-y-3">${each(stats.recentConsumptions, (consumption) => {
    return `<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"><div class="flex items-center space-x-3"><span class="text-2xl">${escape(consumption.tacoType.emoji)}</span> <div><p class="font-medium text-white">${escape(consumption.personName)}</p> <p class="text-sm text-white/70">${escape(consumption.quantity)} × ${escape(consumption.tacoType.name)} • ${escape(consumption.date)}</p> </div></div> <button class="text-red-400 hover:text-red-300 font-bold" data-svelte-h="svelte-10dosnw">×</button> </div>`;
  })}</div>` : `<p class="text-white/70 text-center py-8" data-svelte-h="svelte-elkga3">No taco consumption recorded yet! 🌮</p>`}</div>  <div class="card-3d rounded-xl p-6"><h3 class="text-xl font-bold text-white mb-4" data-svelte-h="svelte-1q3823i">📦 Recent Orders</h3> ${stats.recentSessions.length > 0 ? `<div class="space-y-4">${each(stats.recentSessions, (session) => {
    return `<div class="p-4 bg-white/5 rounded-lg border border-white/10"><div class="flex justify-between items-start mb-2"><div><p class="font-bold text-white">Order for ${escape(session.peopleCount)} people</p> <p class="text-sm text-white/70">${escape(session.date)}</p></div> <button class="text-red-400 hover:text-red-300 font-bold" data-svelte-h="svelte-1cb6yrp">×
							</button></div> <div class="grid grid-cols-2 md:grid-cols-3 gap-2">${each(session.orders, (order) => {
      return `<div class="flex items-center space-x-2 text-sm text-white/80"><span>${escape(order.type.emoji)}</span> <span>${escape(order.quantity)} ${escape(order.type.name)}</span> </div>`;
    })}</div> </div>`;
  })}</div>` : `<p class="text-white/70 text-center py-8" data-svelte-h="svelte-vp2mti">No orders placed yet! 📦</p>`}</div></div>`;
});
function AchievementsView() {
  return '<div class="text-center py-20"><h2 class="text-3xl font-bold mb-4">🏆 Achievements</h2><p class="text-gray-600">Coming soon! Track your taco milestones.</p></div>';
}
function LeaderboardView() {
  return `<div class="text-center py-20"><h2 class="text-3xl font-bold mb-4">👑 Leaderboard</h2><p class="text-gray-600">Coming soon! See who's the ultimate taco champion.</p></div>`;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $activeTab, $$unsubscribe_activeTab;
  $$unsubscribe_activeTab = subscribe(activeTab, (value) => $activeTab = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$unsubscribe_activeTab();
  return `${$$result.head += `<!-- HEAD_svelte-1vi7dhy_START -->${$$result.title = `<title>🌮 Taco Tracker - Your Ultimate Taco Tuesday Companion</title>`, ""}<!-- HEAD_svelte-1vi7dhy_END -->`, ""} ${!data.session?.user ? ` <div class="max-w-2xl mx-auto text-center py-20"><div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"><h2 class="text-3xl font-bold mb-6 text-white" data-svelte-h="svelte-1evqp3z">🌮 Welcome to Taco Tracker!</h2> <p class="text-white/80 mb-8 text-lg" data-svelte-h="svelte-nzqxrv">Join the ultimate taco tracking experience! Sign in with Discord to:</p> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" data-svelte-h="svelte-1iu5fvd"><div class="bg-white/5 rounded-lg p-4"><div class="text-2xl mb-2">📊</div> <h3 class="font-semibold text-white mb-2">Track Your Tacos</h3> <p class="text-white/70 text-sm">Log every delicious bite and see your taco journey</p></div> <div class="bg-white/5 rounded-lg p-4"><div class="text-2xl mb-2">🏆</div> <h3 class="font-semibold text-white mb-2">Unlock Achievements</h3> <p class="text-white/70 text-sm">Earn badges for your taco conquests</p></div> <div class="bg-white/5 rounded-lg p-4"><div class="text-2xl mb-2">👥</div> <h3 class="font-semibold text-white mb-2">Social Tracking</h3> <p class="text-white/70 text-sm">Track tacos with friends and compete</p></div> <div class="bg-white/5 rounded-lg p-4"><div class="text-2xl mb-2">👑</div> <h3 class="font-semibold text-white mb-2">Leaderboards</h3> <p class="text-white/70 text-sm">See who&#39;s the ultimate taco champion</p></div></div> <button class="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-3 mx-auto text-lg" data-svelte-h="svelte-huzgvh"><svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"></path></svg> <span>Get Started with Discord</span></button></div></div>` : ` ${$activeTab === "calculator" ? `<div class="max-w-2xl mx-auto">${validate_component(TacoCalculator, "TacoCalculator").$$render($$result, {}, {}, {})}</div>` : `${$activeTab === "tracker" ? `<div class="max-w-2xl mx-auto">${validate_component(ConsumptionTracker, "ConsumptionTracker").$$render($$result, {}, {}, {})}</div>` : `${$activeTab === "stats" ? `<div class="max-w-4xl mx-auto">${validate_component(TacoStats, "TacoStats").$$render($$result, {}, {}, {})}</div>` : `${$activeTab === "achievements" ? `<div class="max-w-4xl mx-auto"><!-- HTML_TAG_START -->${AchievementsView()}<!-- HTML_TAG_END --></div>` : `${$activeTab === "leaderboard" ? `<div class="max-w-4xl mx-auto"><!-- HTML_TAG_START -->${LeaderboardView()}<!-- HTML_TAG_END --></div>` : ``}`}`}`}`}`}`;
});
export {
  Page as default
};
