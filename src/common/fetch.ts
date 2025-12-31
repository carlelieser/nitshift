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
