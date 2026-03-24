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
        if(this.bossSpawn) return; 

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
                this.spawnBoss('Ruche Hour');
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
                this.spawnBoss('Le Tyrus');
            }
        }
    }

    /* spawn du boss + notif console et boolean */
    spawnBoss(name:string){
        if(this.bossSpawn) return; // si déjà boss on annule 
        this.clearMobs();

        let boss;
        if(name==='Mygalomane') boss = this.state.mygaloPool.acquire();
        if(name==='Ruche Hour') boss = this.state.ruchePool.acquire();
        if(name==='Brainstorming') boss = this.state.brainPool.acquire();
        if(name==='Le Tyrus') boss = this.state.tyrusPool.acquire();

        if(boss){
            boss.reset();
            this.bossSpawn=true;
            console.log(`Boss en cours : ${boss.name}`);
        }
    }

    /* màj des variables quand boss tué */
    bossDead() {
        this.bossSpawn=false;
        this.state.level++;
        console.log("Boss tué ! Gain de niveau");
    }

    /* pour faire dispawn les mobs pdt un boss */
    clearMobs(){
        this.state.spiderPool.getActive().forEach(m => m.active = false);
        this.state.galinettePool.getActive().forEach(m => m.active = false);
        this.state.piePool.getActive().forEach(m => m.active = false);
    }
}