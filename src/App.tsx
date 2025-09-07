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

	// LocalStorage events retrieval function
	useEffect(() => {
    const hasLoaded = sessionStorage.getItem("hasLoaded");

    if(!hasLoaded){
      localStorage.removeItem("events");
      sessionStorage.setItem("hasLoaded", "true");
    }

		const saved = localStorage.getItem("events");
		if (saved) {
			try {
				setEvents(JSON.parse(saved));
			} catch {
				showNotification({ message: "Corrupted data in storage" });
				localStorage.removeItem("events");
			}
		}
	}, []);

	// LocalStorage events creation
	useEffect(() => {
		try {
			localStorage.setItem("events", JSON.stringify(events));
		} catch {
			showNotification({ message: "Error saving events" });
		}
	}, [events]);
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
						<DisplayDock events={events} />

						<EventField events={events} setEvents={setEvents} />
					</Flex>
				</>
		</Container>
	);
}

export default App;
