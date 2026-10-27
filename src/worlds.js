export const TILE=48, WIDTH=20, HEIGHT=13;
function makeWorld(name,walls,points,openTiles=[]){
 const map=Array.from({length:HEIGHT},(_,y)=>Array.from({length:WIDTH},(_,x)=>x===0||y===0||x===WIDTH-1||y===HEIGHT-1?"#":"."));
 for(const [x,y,w,h] of walls)for(let r=y;r<y+h;r++)for(let c=x;c<x+w;c++)map[r][c]="#";
 for(const [x,y] of openTiles)map[y][x]=".";
 for(const [symbol,x,y] of points)map[y][x]=symbol;
 return {name,map};
}
export const worlds={
 // Keep the three visible front doors passable and align each with its facade.
 village:makeWorld("Village Beneath the Hill",[[2,4,3,2],[8,4,3,2],[14,4,3,2],[3,10,1,1],[16,10,2,1]],[["C",14,7]],[[3,5],[9,5],[15,5]]),
 cave:makeWorld("Moonlit Cave",[[3,2,4,1],[13,2,3,1],[6,3,1,4],[13,3,1,3],[9,5,2,1],[6,7,1,2],[7,8,5,1],[13,8,1,2]],[["C",2,2],["E",15,6],["X",16,9],["R",10,6]])
};
export const spawns={village:{x:4,y:9},cave:{x:2,y:2},entrance:{x:14,y:8},enemy:{x:15,y:6},shard:{x:16,y:9},echoStone:{x:10,y:10},crack:{x:10,y:6}};
