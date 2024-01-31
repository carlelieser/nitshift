import { findCustomerByEmail, getLatestPaymentIntent, stripe } from "@main/stripe";
import { ipcMain } from "electron";
import { isDev } from "@common/utils";
import { loadUserId } from "@main/storage";
import { stripe_product_live, stripe_product_test } from "../keys";

ipcMain.handle("stripe/create-price", async (_event, price) =>
	stripe.prices.create({
		unit_amount: price,
		currency: "usd",
		product: isDev ? stripe_product_test : stripe_product_live,
	})
);

ipcMain.handle("stripe/create-payment-link", async (_event, priceId) =>
	stripe.paymentLinks.create({
		metadata: {
			id: loadUserId(),
		},
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		customer_creation: "always",
	})
);

ipcMain.handle("stripe/find-customer-by-email", (_event, email) => findCustomerByEmail(email));
ipcMain.handle("stripe/get-latest-payment-intent", (_event, customerId) => getLatestPaymentIntent(customerId));
