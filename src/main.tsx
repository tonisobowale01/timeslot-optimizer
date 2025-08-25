import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.tsx";
import "./index.css";

const theme = createTheme({
	headings: {
		fontFamily: "Poppins, sans-serif",
		sizes: {
			h1: { fontSize: "clamp(2rem, 6vw, 4.75rem)", lineHeight: "1.2" },
			h2: { fontSize: "clamp(1.75rem, 5vw, 3.5rem)", lineHeight: "1.3" },
			h3: { fontSize: "clamp(1.5rem, 4vw, 2.65rem)", lineHeight: "1.3" },
			h4: { fontSize: "clamp(1.25rem, 3vw, 2rem)", lineHeight: "1.4" },
			h5: { fontSize: "clamp(1rem, 2vw, 1.25rem)", lineHeight: "1.5" },
			h6: { fontSize: "clamp(0.875rem, 1.5vw, 1rem)", lineHeight: "1.4" },
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<MantineProvider theme={theme}>
			<Notifications />
			<App />
		</MantineProvider>
	</StrictMode>
);
