import React, { createContext, useState } from "react";
import Dialog, { DialogComponentProps } from "@components/dialog";
import PriceSelectAndCheckout from "@components/promotional/price-select-and-checkout";
import FeatureList from "@components/promotional/feature-list";
import { Stack } from "@mui/material";
import { RocketLaunchRoundedFilled } from "mui-symbols";

export const FeaturesDialogScrollContext = createContext(0);

const FeaturesDialog: React.FC<DialogComponentProps> = (props) => {
	const [scrollTop, setScrollTop] = useState<number>(0);

	const updateScrollTop: React.UIEventHandler<HTMLDivElement> = (e) => {
		setScrollTop(e.currentTarget.scrollTop);
	};

	return (
		<FeaturesDialogScrollContext.Provider value={scrollTop}>
			<Dialog title={"Upgrade to Pro"} icon={<RocketLaunchRoundedFilled />} {...props}>
				<Stack height={"100%"}>
					<FeatureList onScroll={updateScrollTop} />
					<PriceSelectAndCheckout />
				</Stack>
			</Dialog>
		</FeaturesDialogScrollContext.Provider>
	);
};

export default FeaturesDialog;
