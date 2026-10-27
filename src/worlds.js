export const TILE=48, WIDTH=20, HEIGHT=13;
function makeWorld(name,walls,points){
 const map=Array.from({length:HEIGHT},(_,y)=>Array.from({length:WIDTH},(_,x)=>x===0||y===0||x===WIDTH-1||y===HEIGHT-1?"#":"."));
 for(const [x,y,w,h] of walls)for(let r=y;r<y+h;r++)for(let c=x;c<x+w;c++)map[r][c]="#";
 for(const [symbol,x,y] of points)map[y][x]=symbol;
 return {name,map};
}
export const worlds={
 village:makeWorld("Selo pod Brijegom",[[3,2,1,2],[14,5,3,1],[14,7,3,1]],[["N",4,4],["C",15,6]]),
 cave:makeWorld("Mjesečeva špilja",[[3,2,4,1],[13,2,3,1],[6,3,1,4],[13,3,1,3],[9,5,2,1],[6,7,1,2],[7,8,5,1],[13,8,1,2]],[["C",2,2],["E",15,6],["X",16,9]])
};
export const spawns={village:{x:4,y:9},cave:{x:2,y:2},npc:{x:4,y:4},entrance:{x:15,y:6},enemy:{x:15,y:6},shard:{x:16,y:9},echoStone:{x:10,y:10}};
