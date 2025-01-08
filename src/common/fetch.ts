import { isDev } from "./utils";

export const getUserPosition = async (): Promise<{ latitude: number; longitude: number }> => {
	try {
		const response = await fetch(
			`https://www.googleapis.com/geolocation/v1/geolocate?key=${import.meta.env.VITE_GOOGLE_API_KEY}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
		const data = await response.json();
		return {
			latitude: data.location.lat,
			longitude: data.location.lng
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
