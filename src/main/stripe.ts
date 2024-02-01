import { isDev } from "@common/utils";
import { stripe_secret_live, stripe_secret_test } from "./keys";

export const stripe = require("stripe")(isDev ? stripe_secret_test : stripe_secret_live);

export const findCustomerByEmail = async (email: string) => {
	const response = await stripe.customers.list({
		email,
		limit: 1
	});
	if (!response || response?.data?.length === 0) throw new Error("A customer with that email doesn't exist.");
	return response.data[0];
};

export const getLatestPaymentIntent = async (customerId: string) => {
	const response = await stripe.paymentIntents.list({
		customer: customerId
	});
	if (!response || response?.data?.length === 0) throw new Error("A payment couldn't be found for this customer.");
	return response.data[0];
};
