const handler = {
  get(t, p){ if(p in t) return t[p]; if(p===Symbol.toPrimitive) return ()=>0; if(p==='then') return undefined; return t[p]=mk(); },
  set(t,p,v){ t[p]=v; return true; }
};
function mk(){ const f=function(){ return mk(); }; return new Proxy(f, {get:handler.get,set:handler.set, apply(){return mk();}, construct(){return mk();}}); }
class Base { constructor(){ return new Proxy(this, handler); } }
export const REVISION='mock';
export const SRGBColorSpace=1, RepeatWrapping=1, PCFSoftShadowMap=1, ACESFilmicToneMapping=1, DoubleSide=2;
const names=['WebGLRenderer','Scene','Color','PMREMGenerator','PerspectiveCamera','CanvasTexture','MeshStandardMaterial','MeshPhysicalMaterial','Group','Mesh','BoxGeometry','CylinderGeometry','IcosahedronGeometry','PlaneGeometry','HemisphereLight','DirectionalLight'];
export class Vector3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;} clone(){return new Vector3(this.x,this.y,this.z);} lerpVectors(a,b,t){this.x=a.x+(b.x-a.x)*t;this.y=a.y+(b.y-a.y)*t;this.z=a.z+(b.z-a.z)*t;return this;} project(){ this.x=0.1;this.y=0.1;this.z=0.5; return this;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} }
export const WebGLRenderer=class extends Base{}, Scene=class extends Base{}, Color=class extends Base{}, PMREMGenerator=class extends Base{}, PerspectiveCamera=class extends Base{ constructor(){super(); this.position=new Vector3();} }, CanvasTexture=class extends Base{}, MeshStandardMaterial=class extends Base{ constructor(o){super(); Object.assign(this,o);} }, MeshPhysicalMaterial=class extends Base{ constructor(o){super(); Object.assign(this,o);} }, Group=class extends Base{}, Mesh=class extends Base{ constructor(g,m){super(); this.material=m; this.userData={}; this.position=new Vector3(); this.scale=new Vector3(1,1,1);} }, BoxGeometry=class extends Base{}, CylinderGeometry=class extends Base{}, IcosahedronGeometry=class extends Base{}, PlaneGeometry=class extends Base{}, HemisphereLight=class extends Base{}, DirectionalLight=class extends Base{};
