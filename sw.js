const CACHE = 'dd1-party-finder-v1-3-roster-controls';
const PORTRAITS = [
	'abomination', 'antiquarian', 'arbalest', 'bounty_hunter', 'crusader',
	'flagellant', 'grave_robber', 'hellion', 'highwayman', 'houndmaster',
	'jester', 'leper', 'man_at_arms', 'musketeer', 'occultist',
	'plague_doctor', 'shieldbreaker', 'vestal'
];
const ASSETS = [
	'./', './index.html', './manifest.json', './data.json',
	...PORTRAITS.map(name => `./portraits/${name}.png`)
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE)
			.then(cache => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys()
			.then(keys => Promise.all(keys
				.filter(key => key.startsWith('dd1-party-finder-') && key !== CACHE)
				.map(key => caches.delete(key))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET') return;

	event.respondWith((async () => {
		const cache = await caches.open(CACHE);
		const cached = await cache.match(event.request);
		if (cached) return cached;

		try {
			const response = await fetch(event.request);
			if (response.ok && response.type === 'basic') {
				await cache.put(event.request, response.clone());
			}
			return response;
		} catch (error) {
			if (event.request.mode === 'navigate') {
				const fallback = await cache.match('./index.html');
				if (fallback) return fallback;
			}
			throw error;
		}
	})());
});