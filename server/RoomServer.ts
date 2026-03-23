export interface RoomServer {
	id: number;
	name: string;
	capacityMax: number;
	players: Set<string>; //mieux qu'Array car sans duplis
}
