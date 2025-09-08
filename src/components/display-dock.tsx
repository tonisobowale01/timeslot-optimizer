import { useState } from "react";
import dayjs from "dayjs";
import { Box, Flex, Group, Paper, Popover, Text, Title } from "@mantine/core";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Button, Col, Container, Row } from "react-bootstrap";
import type { EventItem, Weekday } from "../types";
import FreeSlot from "./free-slot";
import "../App.css";
import { IconArrowBackUp, IconTrash } from "@tabler/icons-react";
// import { IconTrash } from "@tabler/icons-react";

dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const weekDays = Array.from({ length: 7 }, (_, i) =>
	dayjs().startOf("week").add(i, "day")
);
const hours = Array.from(
	{ length: 24 },
	(_, i) => `${String(i).padStart(2, "0")}:00`
);
const hourHeight = 60;

type TimedEvent = EventItem & {
	startTime: dayjs.Dayjs;
	endTime: dayjs.Dayjs;
};

type PositionedEvent = TimedEvent & {
	colIndex: number;
	totalCols: number;
};

type ButtonsProps = {
	events: EventItem[];
	onUndo: () => void;
	onClear: () => void;
	visibleFrom: boolean;
};

function getPositionedEvents(dayEvents: EventItem[]): PositionedEvent[] {
	const items: TimedEvent[] = dayEvents
		.map((event) => ({
			...event,
			startTime: dayjs(`2000-01-01T${event.start}`),
			endTime: dayjs(`2000-01-01T${event.end}`),
		}))
		.sort((a, b) => a.startTime.diff(b.startTime));

	const groups: TimedEvent[][] = [];

	for (const item of items) {
		let placedInGroup = false;
		for (const group of groups) {
			if (group.every((g) => !item.startTime.isBefore(g.endTime))) {
				group.push(item);
				placedInGroup = true;
				break;
			}
		}
		if (!placedInGroup) {
			groups.push([item]);
		}
	}

	const positioned: PositionedEvent[] = [];

	for (const group of groups) {
		const columns: TimedEvent[][] = [];

		for (const event of group) {
			let placed = false;
			for (let i = 0; i < columns.length; i++) {
				if (
					columns[i].every(
						(e) =>
							event.startTime.isSameOrAfter(e.endTime) ||
							event.endTime.isSameOrBefore(e.startTime)
					)
				) {
					columns[i].push(event);
					positioned.push({
						...event,
						colIndex: i,
						totalCols: 0,
					});
					placed = true;
					break;
				}
			}

			if (!placed) {
				columns.push([event]);
				positioned.push({
					...event,
					colIndex: columns.length - 1,
					totalCols: 0,
				});
			}
		}

		for (let i = positioned.length - group.length; i < positioned.length; i++) {
			positioned[i].totalCols = columns.length;
		}
	}

	return positioned;
}

const DisplayDock: React.FC<ButtonsProps> = ({ events, onUndo, onClear, visibleFrom }) => {
	const [freeSlots, setFreeSlots] = useState(false);
	const [openedSlot, setOpenedSlot] = useState<string | null>(null);

	return (
		<>
			<Container className="calendar-scroll-wrapper border border-dark" fluid>
				<Row className="table-head flex-nowrap border-bottom border-dark  text-center d-flex">
					<Col className="time-col border-end border-dark p-2">Time</Col>
					{weekDays.map((day, idx) => (
						<Col key={idx} className="time-col p-2 border-end border-dark">
							{day.format("dddd").slice(0, 3)}
						</Col>
					))}
				</Row>
				<Row className="flex-grow-1">
					<Col className="p-0 d-flex calendar-body-outer">
						<Box className="time-labels">
							{hours.map((hour, idx) => (
								<Box
									key={idx}
									className="time-slot border-top border-dark text-end pe-2"
									style={{ height: hourHeight }}
								>
									{hour}
								</Box>
							))}
						</Box>

						<Box className="calendar-scroll-container flex-grow-1">
							<Box className="d-flex calendar-days-wrapper flex-nowrap">
								{weekDays.map((day, dIdx) => {
									const dayName = day.format("dddd") as Weekday;
									const dayEvents = events.filter((e) =>
										e.days.includes(dayName)
									);
									const positioned = getPositionedEvents(dayEvents);

									return (
										<Box
											key={dIdx}
											className="day-column border-start border-dark position-relative flex-grow-1"
										>
											{hours.map((_, hIdx) => (
												<Box
													key={hIdx}
													className="hour-block border-top border-light"
													style={{
														height: hourHeight,
													}}
												>
													{" "}
												</Box>
											))}

											{positioned.map((event, eIdx) => {
												const color = event.color;
												const top = event.startTime.diff(
													dayjs("2000-01-01T00:00"),
													"minute"
												);
												const height = event.endTime.diff(
													event.startTime,
													"minute"
												);
												const widthPercent = 100 / event.totalCols;
												const leftPercent = event.colIndex * widthPercent;
												const keyForEvent = `${dIdx}-${eIdx}`;

												return (
													<Popover
														key={keyForEvent}
														width={220}
														shadow="md"
														opened={openedSlot === keyForEvent}
														onChange={(open) =>
															setOpenedSlot(open ? keyForEvent : null)
														}
														withinPortal={true}
														position="right-start"
														offset={5}
														zIndex={999}
													>
														<Popover.Target>
															<Text
																onClick={() =>
																	setOpenedSlot(
																		openedSlot === keyForEvent
																			? null
																			: keyForEvent
																	)
																}
																className="event-block text-white rounded px-2 py-1 small"
																style={{
																	position: "absolute",
																	top: `${(top / 60) * hourHeight}px`,
																	height: `${(height / 60) * hourHeight}px`,
																	left: `${leftPercent}%`,
																	width: `${widthPercent}%`,
																	background: `${color}`,
																	border: "2px solid #f1f1f1",
																	borderRadius: "6px",
																	zIndex: 2,
																	cursor: "pointer",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																{event.label}
															</Text>
														</Popover.Target>

														<Popover.Dropdown>
															<Paper>
																<Title order={6}>{event.label}</Title>
																<Group gap="xs">
																	<Text>{event.start.slice(0, 5)}</Text>
																	<Text>–</Text>
																	<Text>{event.end.slice(0, 5)}</Text>
																</Group>
															</Paper>
														</Popover.Dropdown>
													</Popover>
												);
											})}

											{freeSlots && (
												<FreeSlot
													events={dayEvents}
													hourHeight={hourHeight}
													day={day}
												/>
											)}
										</Box>
									);
								})}
							</Box>
						</Box>
					</Col>
				</Row>
			</Container>

			<Flex
				justify="center"
				align="center"
				direction="row"
				wrap="nowrap"
				my="xs"
			>
				{visibleFrom && (
					<Button
						variant="danger"
						className="deleteBtns"
						title="Undo"
						onClick={onUndo}
						style={{
							background: "#6BB6FF ",
							border: "1px solid rgba(71, 158, 240, 0.8)",
						}}
					>
						<IconArrowBackUp stroke={2} />
					</Button>
				)}

				<Button
					variant="primary"
					className="btns mx-1 p-2"
					onClick={() => setFreeSlots((prev) => !prev)}
					style={{ width: "100%", flexGrow: "9" }}
				>
					{freeSlots ? "Show events only" : "Show free time"}
				</Button>
				{visibleFrom && (
					<Button
						variant="danger"
						className="deleteBtns"
						title="Delete"
						onClick={onClear}
						style={{
							background: "#e74c3c",
							border: "1px solid rgba(220, 53, 69, 0.8)",
						}}
					>
						<IconTrash stroke={2} />
					</Button>
				)}
			</Flex>
		</>
	);
};

export default DisplayDock;
