import dayjs from "dayjs";
import type { EventItem } from "../types";
import { Popover, Paper, Text, Title, Group } from "@mantine/core";
import { useState } from "react";

const FreeSlot: React.FC<{
	events: EventItem[];
	day: dayjs.Dayjs;
	hourHeight: number;
}> = ({ events, hourHeight }) => {
	const [openedSlot, setOpenedSlot] = useState<number | null>(null);

	const startOfDay = dayjs("2000-01-01T00:00");
	const endOfDay = dayjs("2000-01-01T23:59");

	const sortedEvents = events
		.map((event) => ({
			startTime: dayjs(`2000-01-01T${event.start}`),
			endTime: dayjs(`2000-01-01T${event.end}`),
		}))
		.sort((a, b) => a.startTime.diff(b.startTime));

	const freeSlots = [];
	let current = startOfDay;

	for (const event of sortedEvents) {
		if (event.startTime.isAfter(current)) {
			freeSlots.push({
				startTime: current,
				endTime: event.startTime,
			});
		}

		if (event.endTime.isAfter(current)) {
			current = event.endTime;
		}
	}

	if (current.isBefore(endOfDay)) {
		freeSlots.push({
			startTime: current,
			endTime: endOfDay,
		});
	}

	return (
		<>
			{freeSlots.map((slot, slotIdx) => {
				const top = slot.startTime.diff(startOfDay, "minute");
				const height = slot.endTime.diff(slot.startTime, "minute");

				return (
					<Popover
						key={slotIdx}
						opened={openedSlot === slotIdx}
						onChange={(open) => setOpenedSlot(open ? slotIdx : null)}
						withinPortal={false}
						position="right-start"
						offset={5}
						shadow="md"
						width={220}
					>
						<Popover.Target>
							<Text
								onClick={() =>
									setOpenedSlot(openedSlot === slotIdx ? null : slotIdx)
								}
								className="free-slot text-white rounded px-2 py-1 small"
								style={{
									position: "absolute",
									top: `${(top / 60) * hourHeight}px`,
									height: `${(height / 60) * hourHeight}px`,
									width: "100%",
									border: "2px solid #f1f1f1",
									borderRadius: "6px",
									cursor: "pointer",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								Free Time
							</Text>
						</Popover.Target>

						<Popover.Dropdown>
							<Paper>
								<Title order={6}>Free Slot</Title>
								<Group gap="xs">
									<Text>{slot.startTime.format("HH:mm")}</Text>
									<Text>–</Text>
									<Text>{slot.endTime.format("HH:mm")}</Text>
								</Group>
							</Paper>
						</Popover.Dropdown>
					</Popover>
				);
			})}
		</>
	);
};

export default FreeSlot;
