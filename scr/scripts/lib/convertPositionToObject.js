define([],()=>function(strPosition){
    strPosition=(strPosition.slice(1,strPosition.length-1)).split(',');
    let positions={collum:1,row:2}
    
    for(let i in positions) 
       positions[i]=Number(strPosition[positions[i]-1])

    return positions;
    
});