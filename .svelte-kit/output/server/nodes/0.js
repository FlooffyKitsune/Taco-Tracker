import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.DMNQ1ME0.js","_app/immutable/chunks/XUcN7xOl.js","_app/immutable/chunks/CIRLXjAi.js","_app/immutable/chunks/u0wiUUlS.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = ["_app/immutable/assets/0.BarTvM0r.css"];
export const fonts = [];
