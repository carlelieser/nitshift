export const request = (url: string, init: RequestInit = {}, userId = "") => {
	console.log(`${import.meta.env.VITE_HOST}${url}`, init);
	return fetch(`${import.meta.env.VITE_HOST}${url}`, {
		...init,
		headers: {
			...init.headers,
			...(userId ? { "X-Glimmr-Secret-Key": userId } : {})
		}
	});
};
