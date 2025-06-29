export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BhSL_aDu.js",app:"_app/immutable/entry/app.6I-itUXF.js",imports:["_app/immutable/entry/start.BhSL_aDu.js","_app/immutable/chunks/CsSGacOl.js","_app/immutable/chunks/XUcN7xOl.js","_app/immutable/chunks/u0wiUUlS.js","_app/immutable/entry/app.6I-itUXF.js","_app/immutable/chunks/XUcN7xOl.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/cleanup",
				pattern: /^\/api\/cleanup\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/cleanup/_server.ts.js'))
			},
			{
				id: "/api/consume",
				pattern: /^\/api\/consume\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/consume/_server.ts.js'))
			},
			{
				id: "/api/fix-email",
				pattern: /^\/api\/fix-email\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/fix-email/_server.ts.js'))
			},
			{
				id: "/api/seed",
				pattern: /^\/api\/seed\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/seed/_server.ts.js'))
			},
			{
				id: "/api/sessions",
				pattern: /^\/api\/sessions\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/sessions/_server.ts.js'))
			},
			{
				id: "/api/taco-types",
				pattern: /^\/api\/taco-types\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/taco-types/_server.ts.js'))
			},
			{
				id: "/api/test",
				pattern: /^\/api\/test\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/test/_server.ts.js'))
			},
			{
				id: "/api/users",
				pattern: /^\/api\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/users/_server.ts.js'))
			},
			{
				id: "/api/users/delete",
				pattern: /^\/api\/users\/delete\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/users/delete/_server.ts.js'))
			},
			{
				id: "/setup",
				pattern: /^\/setup\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
