import {
	Group,
	Title,
	Container,
	Text,
	Box,
	Badge,
	Divider,
	Drawer,
} from "@mantine/core";
import "../App.css";
import { IconMenu2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const Navbar = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container py="xs" px="md" className="navigation" fluid>
			<Group
				justify="space-between"
				className="navMini"
				style={{ maxWidth: "55%", margin: "0 auto" }}
			>
				<Box style={{ position: "absolute", left: "2rem" }}>
					<Drawer opened={opened} onClose={close} size={200}>
						<Text>Timeslot Optimizer</Text>
						<Text style={{ fontSize: "0.52rem" }} my={5}>
							No account created = No data collected
						</Text>
						<Divider />
						<Text td="line-through" style={{ fontSize: "0.9rem" }} my={5}>
							Theme change
						</Text>
						<Text style={{ fontSize: "0.9rem" }}>coming soon</Text>
						<Divider />
						<Group my={5}>
							<Text style={{ color: "grey", fontSize: "0.8rem" }}>v1.5</Text>
							<Badge color="red" size="xs">
								Active
							</Badge>
						</Group>
					</Drawer>
					<IconMenu2 stroke={2} onClick={open} />
				</Box>

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
