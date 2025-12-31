import { isDev } from "./utils";

export const getUserPosition = async (): Promise<{ latitude: number; longitude: number }> => {
	try {
		const response = await fetch("http://ip-api.com/json/?fields=lat,lon");
		const data = await response.json();
		return {
			latitude: data.lat,
			longitude: data.lon
		};
	} catch (error) {
		return null;
	}
};

export const request = (url: string, init: RequestInit = {}, userId = "") => {
	return fetch(`${import.meta.env.VITE_HOST}${url}`, {
		...init,
		headers: {
			...init.headers,
			...(userId ? { "X-Glimmr-Secret-Key": userId } : {}),
			origin: isDev ? "http://localhost:5173" : "https://glimmr.app"
		}
	});
};
