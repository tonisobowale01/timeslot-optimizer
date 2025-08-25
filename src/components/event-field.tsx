import {
	Stack,
	Group,
	Button,
	Autocomplete,
	Select,
	MultiSelect,
} from "@mantine/core";
import { useState } from "react";
import { TimePicker } from "@mantine/dates";
import type { EventItem, Weekday } from "../types";
import { showNotification } from "@mantine/notifications";

const weekdays: Weekday[] = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const EventField = ({
	events,
	setEvents,
}: {
	events: EventItem[];
	setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
}) => {
	const [label, setLabel] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState<string | undefined>("");
	const [selectedWeekday, setSelectedWeekday] = useState<Weekday | null>(null);
	const [repeatType, setRepeatType] = useState<"none" | "daily" | "custom">(
		"none"
	);
	const [customDays, setCustomDays] = useState<Weekday[]>([]);

	const handleAddEvent = () => {
		const daysToAdd: Weekday[] =
			repeatType === "custom"
				? customDays
				: repeatType === "daily"
				? weekdays
				: selectedWeekday
				? [selectedWeekday]
				: [];

		if (!label || !startTime || !endTime || daysToAdd.length === 0) {
			showNotification({
				title: "Missing Information",
				message: "Please fill in all fields before submitting.",
				color: "red",
				position: "top-right",
			});
			return;
		}

		if (startTime >= endTime) {
			showNotification({
				title: "Invalid Time Range",
				message: "Start time must be earlier than end time.",
				color: "red",
				position: "top-right",
			});
			return;
		}

		// New Event Creation
		const newEvent: EventItem = {
			label,
			start: startTime,
			end: endTime,
			days: daysToAdd,
		};

		setEvents([...events, newEvent]);

		// Reset Event Field
		setLabel("");
		setStartTime("");
		setEndTime("");
		setSelectedWeekday(null);
		setRepeatType("none");
		setCustomDays([]);
	};

	return (
		<Stack>
			{/* Label Section */}
			<Autocomplete
				label="Label"
				placeholder="Pick a label or enter yours"
				data={["Work", "Meeting", "Gym", "Class", "Gaming"]}
				value={label}
				onChange={setLabel}
			/>

			{/* Time Section */}
			<Group grow>
				<TimePicker
					value={startTime}
					onChange={setStartTime}
					label="Start Time"
					withDropdown
					clearable
				/>

				<TimePicker
					value={endTime}
					onChange={setEndTime}
					label="End Time"
					withDropdown
					clearable
				/>
			</Group>

			{/* Weekdays section */}
			<Group grow>
				<Select
					label="Weekdays"
					data={weekdays}
					value={selectedWeekday}
					disabled={repeatType !== "none"}
					onChange={(value) => setSelectedWeekday(value as Weekday)}
					placeholder="Selected a day"
				/>

				<Select
					label="Repeat"
					data={[
						{ value: "none", label: "Does not repeat" },
						{ value: "daily", label: "Every day" },
						{ value: "custom", label: "Custom days" },
					]}
					value={repeatType}
					onChange={(value) => {
						setRepeatType(value as "none" | "daily" | "custom");
						if (value !== "custom") setCustomDays([]);
					}}
				/>
			</Group>
			{repeatType == "custom" && (
				<MultiSelect
					data={weekdays}
					value={customDays}
					onChange={(value) => setCustomDays(value as Weekday[])}
				/>
			)}

			{/* Submit section */}
			<Button
				className="btns fw-normal fs-6"
				fullWidth
				onClick={handleAddEvent}
			>
				Add Event
			</Button>
		</Stack>
	);
};

export default EventField;
