    function sbDrawSparkline(body) {
      const index=body?Math.min(body.tempHist.length-1,Math.max(0,sb.telemetryIndex??body.tempHist.length-1)):0;
      for(const [id,values,color] of [['sb-sparkline',body?.tempHist||[],'#d95926'],['sb-speed-sparkline',body?.velHist||[],'#3987e5']]) {
        const canvas=sb$(id);if(!canvas)return;
        const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,left=38,right=w-10,top=7,bottom=h-8;
        ctx.clearRect(0,0,w,h);if(!values.length)continue;
        let low=Math.min(...values),high=Math.max(...values);if(high-low<.001){low-=1;high+=1;}
        ctx.font='9px system-ui';ctx.fillStyle='#a1b5ca';ctx.fillText(sbNumberText(high),1,10);ctx.fillText(sbNumberText(low),1,h-3);
        ctx.strokeStyle='#21354b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,bottom);ctx.lineTo(right,bottom);ctx.stroke();
        const x=i=>left+i/Math.max(1,values.length-1)*(right-left),y=v=>bottom-(v-low)/(high-low)*(bottom-top);
        ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
        values.forEach((v,i)=>{if(i)ctx.lineTo(x(i),y(v));else ctx.moveTo(x(i),y(v));});ctx.stroke();
        ctx.fillStyle=color;ctx.beginPath();ctx.arc(x(index),y(values[index]),4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#030812';ctx.lineWidth=2;ctx.stroke();
        if(sb.telemetryIndex!=null){ctx.strokeStyle='#a1b5ca';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(index),top);ctx.lineTo(x(index),bottom);ctx.stroke();}
      }
      const readout=sb$('sb-telemetry-readout');
      if(readout)readout.textContent=body?.tempHist.length?`样本 ${index+1}：${sbNumberText(body.tempHist[index])} °C / ${sbNumberText(body.velHist[index])} 单位/s`:'选中天体后记录遥测。';
      if(body&&sb$('sb-telemetry-details')?.open) {
        const rows=sb$('sb-telemetry-data');rows.replaceChildren();
        body.tempHist.forEach((temperature,i)=>{const row=document.createElement('tr');for(const value of [i+1,sbNumberText(temperature),sbNumberText(body.velHist[i])]) {const cell=document.createElement('td');cell.textContent=String(value);row.appendChild(cell);}rows.appendChild(row);});
      }
    }
    function sbBindTelemetry() {
      for(const id of ['sb-sparkline','sb-speed-sparkline']) {
        const canvas=sb$(id);
        canvas.onpointermove=e=>{const count=sb.selected?.tempHist.length||0,rect=canvas.getBoundingClientRect();sb.telemetryIndex=Math.max(0,Math.min(count-1,Math.round((e.clientX-rect.left)/rect.width*(count-1))));sbDrawSparkline(sb.selected);};
        canvas.onpointerleave=()=>{sb.telemetryIndex=null;sbDrawSparkline(sb.selected);};
        canvas.onfocus=()=>{sb.telemetryIndex=Math.max(0,(sb.selected?.tempHist.length||1)-1);sbDrawSparkline(sb.selected);};
        canvas.onblur=()=>{sb.telemetryIndex=null;};
        canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();const last=Math.max(0,(sb.selected?.tempHist.length||1)-1);sb.telemetryIndex=e.key==='Home'?0:e.key==='End'?last:Math.max(0,Math.min(last,(sb.telemetryIndex??last)+(e.key==='ArrowRight'?1:-1)));sbDrawSparkline(sb.selected);}};
      }
      sb$('sb-telemetry-details').ontoggle=()=>sbDrawSparkline(sb.selected);
    }
