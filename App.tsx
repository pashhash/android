import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { FC, useState } from "react";
import {
	Alert,
	Clipboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { argon2 } from "react-native-argon2";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMERIC = "0123456789";
const SPECIAL = "!@#$%^&*";

const App: FC = () => {
	const [loaded] = useFonts({
		Rubik: require("./assets/fonts/Rubik-Regular.ttf")
	});

	const [seed, onChangeSeed] = useState("");
	const [key, onChangeKey] = useState("");
	const [calculating, setCalculating] = useState(false);

	if (!loaded) return null;

	const onSubmit = async () => {
		if (seed.length < 8)
			return Alert.alert(
				"Invalid master password",
				"Master password must be at least 8 characters long"
			);
		if (!key.length)
			return Alert.alert("Invalid site name", "Please provide a site name!");

		setCalculating(true);

		const hex = (
			await argon2(key, seed, {
				memory: 65536,
				iterations: 4,
				parallelism: 8,
				hashLength: 46
			})
		).rawHash
			.split("")
			.map(c => c.charCodeAt(0));

		let res = "";
		const characters = LOWERCASE + UPPERCASE + NUMERIC + SPECIAL;

		for (let i = 0; i < 16; i++) res += characters[hex[i] % characters.length];

		let pos = 0;
		for (let i = 16; i < 46; i++) {
			if (i % 2 === 0) {
				pos = hex[i] % res.length;
				continue;
			}

			let charset = "";
			const x = i - 16;
			if (x < 16) charset = LOWERCASE;
			else if (x < 24) charset = UPPERCASE;
			else if (x < 28) charset = NUMERIC;
			else charset = SPECIAL;

			const arr = res.split("");
			arr[pos] = charset[hex[i] % charset.length];
			res = arr.join("");
		}

		Clipboard.setString(res);

		setCalculating(false);
	};

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<Text style={styles.title}>PashHash</Text>
			<View style={styles.spacer} />
			<TextInput
				style={styles.input}
				placeholder="Master password"
				placeholderTextColor="#a6adc8"
				onChangeText={onChangeSeed}
				value={seed}
			/>
			<View style={styles.spacer} />
			<TextInput
				style={styles.input}
				placeholder="Site name"
				placeholderTextColor="#a6adc8"
				onChangeText={onChangeKey}
				value={key}
			/>
			<View style={styles.spacer} />
			<TouchableOpacity
				style={styles.button}
				onPress={onSubmit}
				disabled={calculating}
			>
				<Text style={styles.buttonText}>
					{calculating ? "Calculating..." : "Generate!"}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1e1e2e",
		alignItems: "center",
		justifyContent: "center"
	},
	title: {
		fontSize: 48,
		fontFamily: "Rubik",
		color: "#cdd6f4"
	},
	spacer: {
		height: 16
	},
	input: {
		width: "80%",
		height: 48,
		fontFamily: "Rubik",
		paddingHorizontal: 16,
		color: "#cdd6f4",
		backgroundColor: "#313244",
		borderRadius: 8
	},
	button: {
		alignItems: "center",
		justifyContent: "center",
		width: "80%",
		height: 48,
		backgroundColor: "#89b4fa",
		borderRadius: 8
	},
	buttonText: {
		fontFamily: "Rubik",
		color: "#313244"
	}
});

export default App;
