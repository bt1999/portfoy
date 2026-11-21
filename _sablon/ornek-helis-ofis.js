// ÖRNEK PROJE: Helis Beyaz Ofis (14.11.2026). Yeni planda bu dosyayı kopyalayıp yeniden yaz.
// Plan koordinatları cm: x → doğu (sağ), y → güney (aşağı), z → yukarı. Kamera noktaları metre: [x, yükseklik, y].
const PROJE = {
  baslik: 'Ofis Katı — Mimari Çalışma',
  altBaslik: '4 kişilik çalışma alanı · Müdür odası · Dinlenme salonu',
  tavan: 290,
  boyut: [1565, 1042],
  zonlar: [
    {ad:'Müdür odası', renk:'#c9a77c', alan:'≈ 21 m²', gorunum:'mudur'},
    {ad:'Çalışma alanı · 4 kişi', renk:'#7f8f83', alan:'≈ 30 m²', gorunum:'calisma'},
    {ad:'Dinlenme salonu + mutfak', renk:'#c46a3b', alan:'≈ 25 m²', gorunum:'dinlenme'},
    {ad:'Müşteri görüşme masası', renk:'#9aa6b2', alan:'≈ 20 m²', gorunum:'gorusme'},
    {ad:'Giriş / bekleme', renk:'#d8cdb8', alan:'≈ 10 m²', gorunum:'giris'},
  ],
  not: 'Ölçüler mimari plandan alınmıştır (toplam ≈ 116 m² açık alan + WC 4,06 m² + depo/acil çıkış 3,86 m²). Tavan yüksekliği 2,90 m, güney ve doğu cepheler boy camı olarak varsayıldı.',
  gorunumler: {
    genel:    {ad:'Genel',    p:[16.5,13.5,17.5], t:[7.4,0,5.4]},
    plan:     {ad:'Plan',     p:[7.8,23,5.35],    t:[7.8,0,5.2]},
    mudur:    {ad:'Müdür',    p:[6.9,2.1,6.2],    t:[2.6,0.7,8.6], ic:true},
    calisma:  {ad:'Çalışma',  p:[12.9,2.4,6.1],   t:[9.4,0.6,8.6], ic:true},
    dinlenme: {ad:'Dinlenme', p:[7.6,2.3,6.9],    t:[12.2,0.6,3.6], ic:true},
    gorusme:  {ad:'Görüşme',  p:[6.1,2.2,2.6],    t:[2.4,0.6,4.6], ic:true},
    giris:    {ad:'Giriş',    p:[2.45,1.65,1.3],  t:[7.5,0.9,5.0], ic:true},
  },
};

function buildOffice(A){
  const H = PROJE.tavan;

  /* ---------- helpers ---------- */
  const officeChair = (x,y,a,exec)=>{ A.push(x,y,a);
    A.cyl(0,0,30,1,4,'black',30);
    A.cyl(0,0,3,4,42,'metal');
    A.box(-24,-22,24,24,42,50,exec?'leather':'fabric');
    A.box(-23,-31,23,-23,52,exec?118:98,exec?'leather':'fabric');
    A.box(-27,-6,-23,16,58,61,'black'); A.box(23,-6,27,16,58,61,'black');
    A.pop(); };
  const dChair = (x,y,a,seat)=>{ A.push(x,y,a);
    for(const [lx,ly] of [[-19,-19],[19,-19],[-19,19],[19,19]]) A.cyl(lx,ly,1.5,0,45,'black');
    A.box(-22,-22,22,22,44,49,seat||'fabric2');
    A.box(-21,-24,21,-19,49,86,seat||'fabric2');
    A.pop(); };
  const sofa = (x,y,a,w,m,armL=true,armR=true)=>{ A.push(x,y,a); const hw=w/2;
    A.box(-hw,-45,hw,45,8,40,m);
    A.box(-hw,-45,hw,-24,40,82,m);
    if(armL) A.box(-hw,-24,-hw+18,45,40,62,m);
    if(armR) A.box(hw-18,-24,hw,45,40,62,m);
    const l=-hw+(armL?18:0), r=hw-(armR?18:0);
    const n=Math.max(1,Math.round((r-l)/75)), cw=(r-l)/n;
    for(let i=0;i<n;i++){ A.box(l+i*cw+1,-24,l+(i+1)*cw-1,44,40,50,m+'L'); A.box(l+i*cw+3,-28,l+(i+1)*cw-3,-17,50,78,m+'L'); }
    for(const [lx,ly] of [[-hw+5,-40],[hw-5,-40],[-hw+5,40],[hw-5,40]]) A.cyl(lx,ly,2.5,0,8,'black');
    A.pop(); };
  const plant = (x,y,s=1)=>{
    A.cyl(x,y,16*s,0,40*s,'pot',13*s);
    A.sphere(x,y,62*s,26*s,'leaf'); A.sphere(x+12*s,y-6*s,82*s,20*s,'leaf2'); A.sphere(x-10*s,y+8*s,92*s,17*s,'leaf');
    A.sphere(x+2*s,y+2*s,108*s,13*s,'leaf2'); };
  const pendant = (x,y,z=200)=>{ A.cyl(x,y,.5,z+12,H,'black'); A.cyl(x,y,6,z+8,z+12,'black'); A.cyl(x,y,6,z,z+8,'black',20); A.cyl(x,y,8,z-1,z+1,'lamp'); };
  const linear = (x0,y0,x1,y1,z)=>{ A.box(x0,y0,x1,y1,z,z+5,'black'); A.box(x0+1,y0+1,x1-1,y1-1,z-1,z,'lamp');
    const cx=(x0+x1)/2, cy=(y0+y1)/2, lx=(x1-x0)>(y1-y0);
    A.cyl(lx?x0+10:cx, lx?cy:y0+10,.4,z+5,H,'black'); A.cyl(lx?x1-10:cx, lx?cy:y1-10,.4,z+5,H,'black'); };
  const windowX = (x0,y0,x1,y1,z0,z1)=>{ // glazing running along x (thin in y)
    const ym=(y0+y1)/2;
    if(z0>0) A.wall(x0,y0,x1,y1,0,z0);
    if(z1<H) A.wall(x0,y0,x1,y1,z1,H);
    A.box(x0,ym-1,x1,ym+1,z0,z1,'glass',{cut:true,cast:false});
    A.box(x0,ym-3,x1,ym+3,z0,z0+5,'frame',{cut:true}); A.box(x0,ym-3,x1,ym+3,z1-5,z1,'frame',{cut:true});
    const n=Math.max(1,Math.round((x1-x0)/130));
    for(let i=0;i<=n;i++){ const xx=x0+(x1-x0)*i/n; A.box(Math.max(x0,xx-2.5),ym-3,Math.min(x1,xx+2.5),ym+3,z0,z1,'frame',{cut:true}); } };
  const windowY = (x0,y0,x1,y1,z0,z1)=>{ // glazing running along y
    const xm=(x0+x1)/2;
    if(z0>0) A.wall(x0,y0,x1,y1,0,z0);
    if(z1<H) A.wall(x0,y0,x1,y1,z1,H);
    A.box(xm-1,y0,xm+1,y1,z0,z1,'glass',{cut:true,cast:false});
    A.box(xm-3,y0,xm+3,y1,z0,z0+5,'frame',{cut:true}); A.box(xm-3,y0,xm+3,y1,z1-5,z1,'frame',{cut:true});
    const n=Math.max(1,Math.round((y1-y0)/130));
    for(let i=0;i<=n;i++){ const yy=y0+(y1-y0)*i/n; A.box(xm-3,Math.max(y0,yy-2.5),xm+3,Math.min(y1,yy+2.5),z0,z1,'frame',{cut:true}); } };
  const door = (x0,y0,x1,y1,m)=>{ A.wall(x0,y0,x1,y1,210,H); A.box(x0+((x1-x0)<20?3:0),y0+((y1-y0)<20?3:0),x1-((x1-x0)<20?3:0),y1-((y1-y0)<20?3:0),0,208,m||'door',{cut:true}); };

  /* ---------- floors ---------- */
  A.floor(37,237,1415,1005,'screed');
  A.floor(220,37,982,237,'screed');
  A.floor(982,177,1284,237,'screed');
  A.floor(1284,369,1415,784,'screed');
  A.floor(995,37,1284,177,'tile',.2);
  A.floor(1297,189,1526,356,'screed',.1);
  A.floor(778,37,982,180,'tile',.4);              // kitchenette
  A.floor(37,604,597,1005,'oak',.5);              // manager room
  A.floor(790,189,1284,595,'oak',.5);             // lounge
  A.floor(1284,369,1415,595,'oak',.5);

  /* ---------- envelope walls (from plan dimensions) ---------- */
  A.wall(183,0,1321,37);                            // north wall
  A.wall(183,37,220,85); A.wall(183,171,220,237);   // west wall of entrance alcove
  door(183,85,220,171,'doorMain');                  // main entrance
  A.wall(0,200,220,237);
  A.wall(0,237,37,881);                             // west wall
  A.wall(37,841,263,881); A.wall(147,787,263,841);  // SW shaft block
  windowY(0,881,37,1005,0,260);
  A.wall(0,1005,37,1042);
  windowX(37,1005,778,1042,0,260);                  // south glazing
  A.wall(778,1005,790,1042);
  windowX(790,1005,1384,1042,0,260);
  A.wall(1384,1005,1415,1042);
  windowY(1384,881,1415,1005,0,260);
  A.wall(1284,784,1452,824); A.wall(1284,824,1323,846); A.wall(1284,846,1420,883); // SE pier block
  windowY(1415,397,1452,784,0,260);                 // east glazing
  A.wall(710,37,778,84);                            // pilaster
  A.wall(724,834,791,882);                          // free column
  // WC block
  A.wall(982,37,995,189); A.wall(1132,37,1145,177);
  A.wall(982,177,1041,189); door(1041,177,1095,189,'doorW'); A.wall(1095,177,1195,189); door(1195,177,1248,189,'doorW'); A.wall(1248,177,1284,189);
  A.wall(1284,0,1321,189);
  // storage / emergency exit
  A.wall(1321,153,1565,189); A.wall(1526,189,1565,397);
  A.wall(1284,356,1526,369); A.wall(1415,369,1565,397);
  A.wall(1284,189,1297,241); door(1284,241,1297,311,'doorW'); A.wall(1284,311,1297,356);
  A.box(1520,250,1526,290,200,225,'exit');

  /* ---------- WC fixtures ---------- */
  for(const tx of [1063,1216]){ A.box(tx-18,40,tx+18,58,0,80,'white'); A.cyl(tx,85,18,0,42,'white',15); A.box(tx-18,68,tx+18,104,40,43,'white'); }
  A.box(1100,82,1132,138,78,88,'white'); A.box(1145,82,1180,138,78,88,'white');
  A.box(1128,90,1132,130,110,170,'mirror'); A.box(1145,90,1149,130,110,170,'mirror');

  /* ---------- kitchenette ---------- */
  A.box(778,37,982,97,0,88,'cabinet');
  A.box(778,37,982,99,88,92,'stone');
  A.box(850,48,900,88,86,92.2,'steel');
  A.cyl(875,44,1.5,92,120,'steel'); A.box(873,44,877,60,118,121,'steel');
  A.box(778,37,982,72,150,226,'cabinet');
  A.box(925,55,960,85,92,122,'black');               // coffee machine
  // bar table + stools
  A.box(800,205,960,262,102,106,'oakSolid');
  A.box(805,228,812,240,0,102,'black'); A.box(948,228,955,240,0,102,'black');
  for(const sx of [835,880,925]){ A.cyl(sx,292,17,68,73,'leather'); A.cyl(sx,292,2,0,68,'black'); A.cyl(sx,292,16,0,2,'black'); A.cyl(sx,292,13,30,31.5,'black'); }
  pendant(840,233,165); pendant(920,233,165);

  /* ---------- entrance / waiting ---------- */
  A.box(240,37,440,97,0,225,'cabinet');                // coat & archive cabinet
  A.box(240,97,440,98,0,225,'line');
  sofa(565,82,0,170,'sofa2');
  A.cyl(682,92,20,0,48,'oakSolid'); A.cyl(682,92,22,48,50,'oakSolid');
  plant(676,185,.9);
  A.box(225,105,330,205,0,1,'doormat');

  /* ---------- client meeting table ---------- */
  A.box(190,365,410,465,72,76,'oakSolid');
  A.box(215,395,225,435,0,72,'black'); A.box(375,395,385,435,0,72,'black'); A.box(220,410,380,420,20,26,'black');
  for(const cx of [230,300,370]){ dChair(cx,335,0); dChair(cx,495,180); }
  dChair(445,415,-90);
  A.box(37,345,41,485,95,175,'screen');
  linear(220,412,380,418,195);
  A.box(60,520,200,560,0,75,'cabinet'); A.box(60,520,200,560,75,77,'oakSolid');
  plant(70,275,1.05);
  plant(560,560,.8);

  /* ---------- manager room (glass partitions) ---------- */
  const glassRun = (x0,y0,x1,y1)=>{ const along=(x1-x0)>(y1-y0);
    A.box(x0,y0,x1,y1,0,H,'glass',{cut:true,cast:false});
    A.box(x0,y0,x1,y1,100,150,'frost',{cut:true,cast:false});
    A.box(x0-(along?0:1),y0-(along?1:0),x1+(along?0:1),y1+(along?1:0),0,6,'frame',{cut:true});
    A.box(x0-(along?0:1),y0-(along?1:0),x1+(along?0:1),y1+(along?1:0),H-6,H,'frame',{cut:true});
    const len=along?x1-x0:y1-y0, n=Math.max(1,Math.round(len/120));
    for(let i=0;i<=n;i++){ const t=(along?x0:y0)+len*i/n;
      if(along) A.box(Math.max(x0,t-2),y0-1,Math.min(x1,t+2),y1+1,0,H,'frame',{cut:true});
      else A.box(x0-1,Math.max(y0,t-2),x1+1,Math.min(y1,t+2),0,H,'frame',{cut:true}); } };
  glassRun(37,598,600,604);
  glassRun(597,604,603,640);
  glassRun(597,735,603,1005);
  // glass door
  A.box(597,640,603,735,212,H,'frame',{cut:true});
  A.box(599,641,601,734,0,210,'glass',{cut:true,cast:false});
  A.box(598,641,602,645,0,210,'frame',{cut:true}); A.box(598,730,602,734,0,210,'frame',{cut:true});
  A.box(603,722,606,724,85,135,'steel'); A.box(594,722,597,724,85,135,'steel');
  // desk
  A.box(300,770,490,855,72,76,'oakSolid');
  A.box(302,772,306,853,0,72,'black'); A.box(484,772,488,853,0,72,'black'); A.box(306,770,484,773,28,72,'black');
  A.box(372,812,422,815,84,114,'screen'); A.box(395,812,399,822,76,84,'black');
  A.box(320,820,350,840,76,77.5,'black');                         // notebook
  A.cyl(465,790,6,76,78,'black'); A.cyl(465,790,1,78,115,'black'); A.cyl(465,790,8,110,122,'black',12);
  officeChair(395,905,180,true);
  dChair(355,720,0,'leather'); dChair(440,720,0,'leather');
  A.rug(265,690,525,975,'rugM');
  // lounge corner in manager room
  sofa(82,700,90,165,'sofa3');
  A.box(150,665,215,735,0,38,'oakSolid');
  A.box(160,745,263,787,0,78,'cabinet'); A.box(160,745,263,787,78,80,'oakSolid');   // credenza on shaft block
  A.box(37,610,47,650,95,175,'art');
  plant(90,950,.95);
  plant(560,965,.85);
  A.cyl(220,935,12,0,2,'black'); A.cyl(220,935,1,2,150,'black'); A.cyl(220,935,14,150,170,'lampShade',18);
  pendant(395,812,190);

  /* ---------- work area · 4 people ---------- */
  A.box(900,660,1050,980,72,75,'deskTop');
  for(const fy of [660,817,976]) A.box(902,fy,1048,fy+4,0,72,'black');
  A.box(973,662,977,978,75,118,'felt');
  for(const my of [740,900]){
    A.box(948,my-28,951,my+28,86,118,'screen'); A.box(951,my-4,958,my+4,75,86,'black');
    A.box(999,my-28,1002,my+28,86,118,'screen'); A.box(992,my-4,999,my+4,75,86,'black');
    A.box(915,my-20,930,my+20,75,76,'keyboard'); A.box(1020,my-20,1035,my+20,75,76,'keyboard');
    A.box(905,my+40,945,my+75,0,60,'white'); A.box(1005,my+40,1045,my+75,0,60,'white'); // pedestals
  }
  officeChair(850,740,90); officeChair(850,900,90);
  officeChair(1100,740,-90); officeChair(1100,900,-90);
  linear(932,680,938,960,215); linear(1012,680,1018,960,215);
  // storage + printer under east glazing
  A.box(1355,630,1410,780,0,75,'cabinet'); A.box(1355,630,1410,780,75,77,'oakSolid');
  A.box(1362,650,1404,700,77,105,'printer');
  A.box(1280,795,1284,875,95,190,'board');
  plant(1340,950,1);
  plant(760,960,.9);
  A.rug(830,640,1170,1000,'rugW');

  /* ---------- lounge ---------- */
  A.box(990,595,1300,632,0,110,'oakSolid');                    // low shelving divider
  for(const px of [1030,1145,1260]) A.box(px-18,600,px+18,628,30,62,'cabinet');
  for(const px of [1060,1200]){ A.cyl(px,613,10,110,128,'pot',8); A.sphere(px,613,140,16,'leaf'); }
  A.rug(1040,330,1360,575,'rugL');
  sofa(1180,525,180,240,'sofa',true,false);
  sofa(1345,450,-90,150,'sofa',false,true);
  A.cyl(1190,405,45,36,40,'oakSolid'); A.cyl(1190,405,6,0,36,'black');
  sofa(995,415,90,85,'sofa2');
  A.cyl(1010,520,18,0,48,'oakSolid');
  A.box(1100,189,1190,193,115,170,'screen');
  pendant(1160,400,175); pendant(1220,410,190);
  plant(1335,612,.85); plant(820,560,1);
  A.cyl(1392,548,12,0,2,'black'); A.cyl(1392,548,1,2,155,'black'); A.cyl(1392,548,14,155,175,'lampShade',18);

  /* ---------- labels ---------- */
  A.label('Müdür Odası','≈ 21 m² · cam bölme',320,800,250,'mudur');
  A.label('Çalışma Alanı','4 kişilik masa grubu · ≈ 30 m²',975,820,250,'calisma');
  A.label('Dinlenme Salonu','≈ 23 m² + mutfak',1170,430,250,'dinlenme');
  A.label('Müşteri Görüşme','6+1 kişilik masa',300,415,250,'gorusme');
  A.label('Giriş / Bekleme','',470,140,250,'giris');
  A.label('Mutfak','',880,70,250,null,true);
  A.label('WC','4,06 m²',1135,110,250,null,true);
  A.label('Depo / Acil çıkış','3,86 m²',1410,270,250,null,true);
}
