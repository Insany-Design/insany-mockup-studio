// One compositing pipeline for responsive previews and native-resolution exports.
export function homography(quad) {
 const uv=[[0,0],[1,0],[1,1],[0,1]],a=[],b=[];
 for(let i=0;i<4;i++){const [x,y]=quad[i],[u,v]=uv[i];a.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);a.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}
 for(let c=0;c<8;c++){let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(a[r][c])>Math.abs(a[pivot][c]))pivot=r;[a[c],a[pivot]]=[a[pivot],a[c]];[b[c],b[pivot]]=[b[pivot],b[c]];const d=a[c][c];if(Math.abs(d)<1e-12)throw Error('Perspectiva inválida.');for(let j=c;j<8;j++)a[c][j]/=d;b[c]/=d;for(let r=0;r<8;r++){if(r===c)continue;const f=a[r][c];for(let j=c;j<8;j++)a[r][j]-=f*a[c][j];b[r]-=f*b[c]}}
 return new Float32Array([b[0],b[3],b[6],b[1],b[4],b[7],b[2],b[5],1]);
}
const vertex=`attribute vec2 position; varying vec2 uv; void main(){uv=vec2(position.x*.5+.5,.5-position.y*.5);gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;
uniform sampler2D baseTex,artTex,maskTex,glassTex,frontTex,bodyTex;
uniform mat3 projection;
uniform float srcAspect,dstAspect,fitMode,zoom,panX,panY,reflection,bodyAmount;
uniform vec3 bodyColor;
uniform vec4 screenGrade,sceneGrade;
vec3 grade(vec3 c,vec4 p){
 c*=p.x;
 c=(c-.5)*p.y+.5;
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,p.z);
 c*=vec3(1.+p.w*.13,1.+p.w*.015,1.-p.w*.13);
 return clamp(c,0.,1.);
}
vec3 over(vec3 bottom,vec4 top,float amount){return mix(bottom,top.rgb,clamp(top.a*amount,0.,1.));}
void main(){
 vec3 base=texture2D(baseTex,uv).rgb;
 float mask=texture2D(maskTex,uv).a;
 float body=texture2D(bodyTex,uv).r*(1.-mask);
 // Normalize tint luminance to retain the original studio shading.
 vec3 tint=bodyColor/max(dot(bodyColor,vec3(.2126,.7152,.0722)),.08);
 base=mix(base,clamp(base*tint,0.,1.),body*bodyAmount);
 vec3 p=projection*vec3(uv,1.);vec2 q=p.xy/p.z;
 vec2 scale=vec2(1.);
 if(fitMode<.5){if(srcAspect>dstAspect)scale.x=dstAspect/srcAspect;else scale.y=srcAspect/dstAspect;}
 else{if(srcAspect>dstAspect)scale.y=srcAspect/dstAspect;else scale.x=dstAspect/srcAspect;}
 q=(q-.5)*scale/zoom+.5-vec2(panX,panY)*.5;
 vec3 art=vec3(.025);
 if(q.x>=0.&&q.x<=1.&&q.y>=0.&&q.y<=1.)art=texture2D(artTex,q).rgb;
 art=grade(art,screenGrade);
 vec3 result=mix(base,art,mask);
 result=over(result,texture2D(glassTex,uv),reflection);
 result=over(result,texture2D(frontTex,uv),1.);
 gl_FragColor=vec4(grade(result,sceneGrade),1.);
}`;
export class MockupRenderer {
 constructor(canvas){this.canvas=canvas;const gl=this.gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:true,antialias:false,premultipliedAlpha:false});if(!gl)throw Error('Seu navegador precisa de WebGL para abrir o estúdio.');
 const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 this.program=gl.createProgram();gl.attachShader(this.program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(this.program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);this.textures=[];this.locations={};this.maxSize=gl.getParameter(gl.MAX_TEXTURE_SIZE);this.maxViewport=gl.getParameter(gl.MAX_VIEWPORT_DIMS);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('render-error',{detail:'O navegador perdeu o contexto gráfico. Recarregue o estúdio.'}))});
 }
 loc(n){return this.locations[n]??(this.locations[n]=this.gl.getUniformLocation(this.program,n))}
 setTexture(index,source){const gl=this.gl;if(source.width>this.maxSize||source.height>this.maxSize)throw Error(`A imagem excede o limite gráfico de ${this.maxSize} px deste navegador.`);gl.activeTexture(gl.TEXTURE0+index);if(!this.textures[index])this.textures[index]=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.textures[index]);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(this.loc(['baseTex','artTex','maskTex','glassTex','frontTex','bodyTex'][index]),index)}
 setModel(model,images){this.model=model;for(let i=0;i<images.length;i++)this.setTexture(i,images[i]);this.gl.uniformMatrix3fv(this.loc('projection'),false,homography(model.quad))}
 draw(state,width,height){const gl=this.gl;if(width>this.maxViewport[0]||height>this.maxViewport[1])throw Error('Este dispositivo não suporta a resolução nativa. Abra em um computador para exportar.');if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height}if(gl.drawingBufferWidth!==width||gl.drawingBufferHeight!==height)throw Error("Este dispositivo não conseguiu alocar a resolução nativa. Use um computador com mais memória gráfica.");gl.viewport(0,0,width,height);gl.useProgram(this.program);
 const one=(name,v)=>gl.uniform1f(this.loc(name),v);one('srcAspect',state.artAspect||this.model.aspect);one('dstAspect',this.model.aspect);one('fitMode',state.fit==='contain'?1:0);one('zoom',state.zoom);one('panX',state.panX);one('panY',state.panY);one('reflection',state.reflection);one('bodyAmount',state.bodyAmount/100);
 const rgb=state.bodyColor.match(/\w\w/g).map(x=>parseInt(x,16)/255);gl.uniform3fv(this.loc('bodyColor'),rgb);
 gl.uniform4f(this.loc('screenGrade'),state.screenBrightness/100,state.screenContrast/100,state.screenSaturation/100,state.screenTemperature/100);
 gl.uniform4f(this.loc('sceneGrade'),state.sceneBrightness/100,state.sceneContrast/100,state.sceneSaturation/100,state.sceneTemperature/100);gl.drawArrays(gl.TRIANGLES,0,6);if(gl.getError()!==gl.NO_ERROR)throw Error('Não foi possível compor a imagem nesta placa gráfica.');
 }
}
