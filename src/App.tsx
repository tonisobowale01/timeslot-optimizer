import NavigationBar from "./components/navigation";
import DisplayDock from "./components/display-dock";
import EventField from "./components/event-field";
import { showNotification } from "@mantine/notifications";
import type { EventItem } from "./types";
import { Container, Flex } from "@mantine/core";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
	const [events, setEvents] = useState<EventItem[]>([]);
	const [lastEvents, setLastEvents] = useState<number[]>([]);

	// LocalStorage events retrieval function
	useEffect(() => {
		const hasLoaded = sessionStorage.getItem("hasLoaded");

		if (!hasLoaded) {
			localStorage.removeItem("events");
			localStorage.removeItem("lastEvents");
			sessionStorage.setItem("hasLoaded", "true");
		}

		const saved = localStorage.getItem("events");
		const savedStack = localStorage.getItem("lastEvents");

		if (saved) {
			try {
				setEvents(JSON.parse(saved));
			} catch {
				showNotification({ message: "Corrupted data in storage" });
				localStorage.removeItem("events");
			}
		}

		if (savedStack) {
			try {
				setLastEvents(JSON.parse(savedStack));
			} catch {
				showNotification({ message: "Corrupted undo history" });
				localStorage.removeItem("lastEvents");
			}
		}
	}, []);

	// LocalStorage events creation
	useEffect(() => {
		try {
			localStorage.setItem("events", JSON.stringify(events));
			localStorage.setItem("lastEvents", JSON.stringify(lastEvents));
		} catch {
			showNotification({ message: "Error saving to localStorage" });
		}
	}, [events, lastEvents]);

	// Undo and delete events from localStorage
	const undoLastEvent = () => {
		if (lastEvents.length === 0) {
			showNotification({ message: "No events to undo" });
			return;
		}

		setLastEvents((prev) => {
			const newStack = [...prev];
			const lastId = newStack.pop();
			if (lastId !== undefined) {
				setEvents((prevEvents) => prevEvents.filter((e) => e.id !== lastId));
			}
			return newStack;
		});
	};

	const clearEvents = () => {
		if (events.length === 0) {
			showNotification({ message: "No events to clear" });
			return;
		}
		setEvents([]);
		setLastEvents([]);
		localStorage.removeItem("events");
		localStorage.removeItem("lastEvents");
		showNotification({ message: "All events cleared" });
	};
	return (
		<Container size="sm" py="md">
			<>
				<Flex
					className="main"
					direction="column"
					h="90vh"
					p={{ base: "xs", sm: "lg" }}
				>
					<NavigationBar />
					<DisplayDock events={events} onUndo={undoLastEvent} onClear={clearEvents} visibleFrom={lastEvents.length > 0}/>

					<EventField setEvents={setEvents} setLastEvents={setLastEvents} />
				</Flex>
			</>
		</Container>
	);
}

export default App;
