import React, { useMemo, useState } from "react";
import {
	alpha,
	Avatar,
	Box,
	IconButton,
	InputAdornment,
	Menu,
	MenuProps,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import path from "node:path";
import { Close, QuestionMark, Search } from "mui-symbols";
import Icon from "./icon";
import Grid from "react-virtualized/dist/commonjs/Grid";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import { omit } from "lodash";
import * as icons from "mui-symbols/dist/index";

interface IconMenuProps extends Omit<MenuProps, "onChange"> {
	value: string;
	onChange: (icon: string) => void;
}

const IconMenu: React.FC<IconMenuProps> = (props) => {
	const [query, setQuery] = useState<string>("");
	const filtered = useMemo(
		() =>
			Object.keys(icons)
				.filter((path) => path.includes("RoundedFilled"))
				.filter((path) =>
					query ? path.toLowerCase().includes(query.replaceAll(/\s+/g, "").toLowerCase()) : path
				),
		[icons, query]
	);

	const handleQueryChange = (e) => setQuery(e.target.value);

	const clearQuery = () => setQuery("");

	return (
		<Menu
			keepMounted={false}
			{...omit(props, "onChange")}
			slotProps={{
				paper: {
					style: {
						width: 400,
						height: 300
					}
				}
			}}
			MenuListProps={{
				sx: {
					height: 300
				},
				disablePadding: true
			}}
		>
			<Stack height={"100%"}>
				<Stack component={Paper} variant={"elevation"} elevation={2} py={2} px={1}>
					<TextField
						value={query}
						variant={"standard"}
						onChange={handleQueryChange}
						fullWidth={true}
						autoFocus={true}
						placeholder={"Search icons"}
						inputProps={{
							style: {
								paddingBottom: 12,
								paddingTop: 12
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position={"start"}>
									<Search />
								</InputAdornment>
							),
							endAdornment: query.length ? (
								<InputAdornment position={"end"}>
									<IconButton size={"small"} onClick={clearQuery}>
										<Close fontSize={"small"} />
									</IconButton>
								</InputAdornment>
							) : null
						}}
					/>
				</Stack>
				<Box flex={1}>
					{filtered.length ? (
						<AutoSizer>
							{({ width, height }) => (
								<Grid
									width={width}
									height={height}
									style={{ overflowX: "hidden" }}
									columnCount={5}
									columnWidth={width / 5 - 2}
									rowCount={Math.ceil(filtered.length / 6)}
									rowHeight={64}
									cellRenderer={({ columnIndex, key, rowIndex, style }) => {
										const index = rowIndex * 4 + columnIndex;
										const data = index < filtered.length ? filtered[index] : null;
										if (!data) return null;
										const icon = path.basename(data, ".js");
										const active = props.value === icon;
										return (
											<Stack
												key={key}
												style={{
													...style,
													display: "flex",
													alignItems: "center",
													justifyContent: "center"
												}}
											>
												<Tooltip title={icon.replace("RoundedFilled", "")}>
													<IconButton
														sx={{
															bgcolor: (theme) =>
																active
																	? theme.palette.primary.main
																	: alpha(theme.palette.common.white, 0.1),
															width: 48,
															height: 48
														}}
														onClick={() => {
															props.onChange(icon);
															props.onClose({}, "backdropClick");
														}}
													>
														<Icon name={icon} fontSize={"medium"} />
													</IconButton>
												</Tooltip>
											</Stack>
										);
									}}
								/>
							)}
						</AutoSizer>
					) : (
						<Stack alignItems={"center"} justifyContent={"center"} p={2} pt={4} spacing={1}>
							<Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, width: 48, height: 48 }}>
								<QuestionMark />
							</Avatar>
							<Stack spacing={0.5} textAlign={"center"}>
								<Typography variant={"h4"}>No results</Typography>
								<Typography variant={"body2"} color={"text.secondary"}>
									We don't have any icons by that name. Try another search term.
								</Typography>
							</Stack>
						</Stack>
					)}
				</Box>
			</Stack>
		</Menu>
	);
};

export default IconMenu;
