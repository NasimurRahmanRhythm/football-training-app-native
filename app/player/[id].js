import PlayerProfile from "@/components/player-profile";
import { useLocalSearchParams } from "expo-router";

export default function PlayerDetailsScreen() {
  const { id } = useLocalSearchParams();

  return <PlayerProfile id={id} />;
}
