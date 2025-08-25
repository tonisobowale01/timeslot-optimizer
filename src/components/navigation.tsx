import { Group, Title, Container, Text } from "@mantine/core";
import "../App.css";

const Navbar = () => {
	return (
		<Container py="xs" px="md" className="navigation" fluid>
			<Group
				justify="space-between"
				className="navMini"
				style={{ maxWidth: "55%", margin: "0 auto" }}
			>
				<Title order={4} className="miniTitle">
					Timeslot Optimizer
				</Title>
				<Text
					component="a"
					className="miniName"
					style={{ position: "absolute", right: "4rem" }}
					ml="sm"
					size="xs"
					href="https://tonisobowale.vercel.app"
					rel="noopener noreferrer"
					target="_blank"
					title="Visit Toluwanimi's portfolio"
				>
					DEV
				</Text>
			</Group>
		</Container>
	);
};

export default Navbar;
