import type RoomState from "./RoomState";

export default class GameManager {
    state:RoomState;
    bossSpawn:boolean = false;

    constructor(state: RoomState){
        this.state=state;
    }

    /* Avoir score total de tous les joueurs du'ne room */
    getTotalScore():number {
        let total=0;
        this.state.players.forEach(p => total+=p.score); 
        return total;
    }

    spawnMob(){
        if(this.state.players.size === 0) return; // si aucun joueur, on ff 

        const score = this.getTotalScore();

        /* NIVEAU 1 : araignées + boss Mygalo */
        if(this.state.level===1){
            if(score < 500){
                this.state.spiderPool.acquire();
            }else{
                this.spawnBoss('Mygalomane');
            }
        }

        /* NIVEAU 2 : Galinette + Ruche Hour */
        if(this.state.level===2){
            if(score<1500) {
                this.state.galinettePool.acquire();
            }else{
                this.spawnBoss('RucheHour');
            }
        }

        /* NIVEAU 3 : pie + Brainstorming */
        if(this.state.level === 3){
            if(score<2500){
                this.state.piePool.acquire();
            }else{
                this.spawnBoss('Brainstorming');
            }
        }

        /* NIVEAU 4 : tous + le tyrus */
        if(this.state.level===4){
            if(score<3500){
                this.state.piePool.acquire();
            }else{
                this.spawnBoss('LeTyrus');
            }
        }
    }

    /* spawn du boss + notif console et boolean */
    spawnBoss(name:string){
        const boss = this.state.bossPool.acquire();
        if(boss){
            this.bossSpawn=true;
            console.log(`Boss en cours : ${name}`);
        }
    }

    /* màj des variables quand boss tué */
    bossDead() {
        this.bossSpawn=false;
        this.state.level++;
        console.log("Boss tué ! Gain de niveau");
    }
}