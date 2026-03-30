export interface RoomServer {
	id: number;
	name: string;
	capacityMax: number;
	players: Set<string>;
	solo: boolean;
	pvp: boolean;
}
