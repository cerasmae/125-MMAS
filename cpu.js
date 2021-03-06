var memory_list = [];
var job_list = [];
var canvas;
var ctx;
var globalY;
var elmnt = document.body;
var finished_ff = 0;
var finished_wf = 0;
var finished_bf = 0;
var tp_ff = 0;
var tp_wf = 0;
var tp_bf = 0;
var storage_ff = 0;
var storage_wf = 0;
var storage_bf = 0;
var time = 0;
elmnt.scrollRight += 500;

canvas = document.getElementById("canvas");
ctx = canvas.getContext('2d');
canvas.width = window.innerWidth*2;
canvas.height = window.innerHeight*2;
ctx.font = "20px Tahoma";

function Memory(array){
	this.block = array[0];
	this.size = array[1];
	this.process = null;

	this.allocate = function(proc){
		this.process = proc;
	}

	this.remaining = function(){
		if(this.process != null)
			return this.size+ " : "+ (this.size-this.process.size);
		else
			return "     "+this.size;
	}

	this.internal_frag = function(){
		return this.size - this.process.size;
	}

	this.used_memory = function(){
		return this.process.size;
	}

	this.occupied = function(){ // returns true if process != null
		return this.process != null;
	}

	this.processed = function(type){
		if(this.process != null){
			if(this.process.time > 1){
				this.process.time--;
			} else{
				if(type == 1){
					finished_ff++;
					if(time != 0){
						// tp_ff += (finished_ff/time);
						tp_ff = (finished_ff/time);
						// console.log(tp_ff, finished_ff);
					}
				} else if(type == 2){
					finished_wf++;
					if(time != 0){
						// tp_wf += (finished_wf/time);
						tp_wf = (finished_wf/time);
						// console.log(tp_wf, finished_wf);
					}
					
				} else if(type == 3){
					finished_bf++;
					if(time != 0){
						// tp_bf += (finished_bf/time);
						tp_bf = (finished_bf/time);
						// console.log(tp_bf, finished_bf);
					}
				}
				// finished++;
				this.process = null;
			}
		}
	}

	this.getProcessStream = function(){
		if(this.process != null){
			return "Job #" + this.process.stream;
		} else{
			return "  Free";
		}
	}
}

function Process(array, color){
	this.stream = array[0];
	this.time = array[1];
	this.size = array[2];
	this.color = color;
}



function Memory_Manager(strtY, time){

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.font = "30px Tahoma";
	var height = canvas.height/10;
	var mem_width = canvas.width/10.5;
	var job_width = canvas.width/(job_list.length+1);
	var startX = 15;
	var startY = (strtY+canvas.height/50)+5
	var queueX = startX;
	// var queueY = staryY;
	var queueTotal = 0;
	var sum_cpu = 0;

	ctx.fillText("Time: "+time, startX+canvas.width/2, canvas.height*0.99 );

	// if(time != 0)
	// 	tp_ff += (finished_ff/time);
	var fragmentation = 0;
	var used = 0;
	var unused = 0;
	var waiting_time = 0;

	//FIRST-FIT
	ctx.font = "25px Tahoma";
	ctx.fillText("First-Fit", startX+canvas.width/2, canvas.height/50 );

	//Process
	for( var i = 0; i < ff_memory_list.length; i++ ){
		for( var j = 0; j < ff_job_list.length; j++ ){
			if(!ff_memory_list[i].occupied()){
				if(ff_job_list[j].size <= ff_memory_list[i].size ){
					ff_memory_list[i].allocate(ff_job_list[j]);
					// answer.push(ff_job_list[j].stream);
					// throughput++;
					ff_job_list.splice(j, 1);
					break;
				}
			} else{
				// throughput++;
				break;
			}
		}
	}

	//Draw Resources
	for(var i = 0; i < ff_memory_list.length; i++){
		if(ff_memory_list[i].process == null ){
			ctx.fillStyle = "darkgray";
			unused++;
		} else{
			ctx.fillStyle = ff_memory_list[i].process.color;
			fragmentation+=ff_memory_list[i].internal_frag();
			// used+=ff_memory_list[i].used_memory();
			// unused+=ff_memory_list[i].internal_frag();
			used++;
		}
		
		ctx.fillRect(queueX+5, startY, mem_width-10, height);
		ctx.fillStyle = "black";
		ctx.strokeRect(queueX+5, startY, mem_width-10, height);
		ctx.font = "20px Tahoma";
		ctx.fillText(ff_memory_list[i].block, queueX+(mem_width/2), startY+(height/5) );
		ctx.font = "35px Tahoma";
		ctx.fillText(ff_memory_list[i].getProcessStream(), queueX+(mem_width/4), startY+(height/2) );
		ctx.font = "20px Tahoma";
		ctx.fillText(ff_memory_list[i].remaining(), queueX+(mem_width/3.2), startY+(height*0.75) );
		if(ff_memory_list[i].process != null){
			ctx.fillText("Remaining time: "+ff_memory_list[i].process.time, queueX+(mem_width/6), startY+(height*0.95) );
		}
		queueX+=mem_width;
	}
	startY+=height+15;
	queueX = startX;

	for(var i = 0; i < ff_job_list.length; i++){
		ctx.fillStyle = ff_job_list[i].color;
		ctx.fillRect(queueX+5, startY, job_width-5, height);
		ctx.strokeRect(queueX+5, startY, job_width-5, height);
		ctx.fillStyle = "black";
		ctx.fillText(ff_job_list[i].stream, queueX+(job_width/2.5), startY+(height/6) );
		ctx.font = "35px Tahoma";
		ctx.fillText(ff_job_list[i].size, queueX+(job_width/4), startY+(height/1.75) );
		ctx.font = "20px Tahoma";
		ctx.fillText("Time: "+ff_job_list[i].time, queueX+(job_width/5), startY+(height*0.95) );
		waiting_time+=ff_job_list[i].time;
		queueX+=job_width;
	}

	queueX = startX;

	var tempY = startY;
	var tempX = queueX

	ctx.font = "30px Tahoma";
	ctx.fillText("1. Throughput: "+tp_ff, tempX+job_width, tempY+=height*1.29 );
	if(ff_job_list.length > 1){
		ctx.fillText("2. Storage utilization (used): ", tempX+job_width, tempY+=30 );
		(storage_ff+=(used/10)*100);
	} else{
		ctx.fillText("2. Storage utilization (AVE): "+(storage_ff), tempX+job_width, tempY+=30 );
	}
	// console.log(used, unused);
	// ctx.fillText("2.2 Storage utilization (unused): "+((unused/memory_list.length)*100)+"%", tempX+job_width, tempY+=30 );
	tempY+=30;
	
	tempX+=(mem_width*5);
	tempY = startY;

	ctx.fillText("3. Waiting queue length: "+ff_job_list.length, tempX+job_width, tempY+=height*1.29 );
	ctx.fillText("4. Waiting time in queue (AVE): "+(waiting_time/ff_job_list.length), tempX+job_width, tempY+=30 );
	console.log(waiting_time);
	ctx.fillText("5. Internal Fragmentation: "+fragmentation, tempX+job_width, tempY+=30 );

	//WORST-FIT
	// if(time != 0){
	// 	tp_wf += (finished_wf/time);
	// }
	// console.log(finished_wf, time);
	// console.log(tp_wf);
	used = 0;
	unused = 0;
	waiting_time = 0;
	fragmentation = 0;
	globalY = 115+(startY*2)-canvas.height/50;
	ctx.font = "25px Tahoma";
	ctx.fillText("Worst-Fit", startX+canvas.width/2, globalY );
	queueX = startX;


	globalY+=10;

	var leftover = 0;
	var index = 0;
	var flag = false;

	//Process
	for(var i = 0; i < wf_job_list.length;){
		for(var j = 0; j < wf_memory_list.length; j++){
			if(!wf_memory_list[j].occupied() && wf_job_list[i].size <= wf_memory_list[j].size){
				if(wf_memory_list[j].size-wf_job_list[i].size >= leftover){
					flag = true;
					leftover = wf_memory_list[j].size-wf_job_list[i].size;
					index = j;
				}
			}
		}
		if(flag){
			// console.log(i);
			wf_memory_list[index].allocate(wf_job_list[i]);
			wf_job_list.splice(i, 1);
			index = 0;
			flag = false;
			leftover = 0;
		} else{
			i++;
		}
	}


	//Draw Resources
	for(var i = 0; i < wf_memory_list.length; i++){
		if(wf_memory_list[i].process == null ){
			ctx.fillStyle = "darkgray";
			unused++;
		} else{
			ctx.fillStyle = wf_memory_list[i].process.color;
			fragmentation+=wf_memory_list[i].internal_frag();
			used++;
			// used+=wf_memory_list[i].used_memory();
			// unused+=wf_memory_list[i].internal_frag();
		}
		
		ctx.fillRect(queueX+5, globalY, mem_width-10, height);
		ctx.fillStyle = "black";
		ctx.strokeRect(queueX+5, globalY, mem_width-10, height);
		ctx.font = "20px Tahoma";
		ctx.fillText(wf_memory_list[i].block, queueX+(mem_width/2), globalY+(height/5) );
		ctx.font = "35px Tahoma";
		ctx.fillText(wf_memory_list[i].getProcessStream(), queueX+(mem_width/4), globalY+(height/2) );
		ctx.font = "20px Tahoma";
		ctx.fillText(wf_memory_list[i].remaining(), queueX+(mem_width/3.2), globalY+(height*0.75) );
		if(wf_memory_list[i].process != null){
			ctx.fillText("Remaining time: "+wf_memory_list[i].process.time, queueX+(mem_width/6), globalY+(height*0.95) );
		}
		queueX+=mem_width;
	}
	globalY+=height+15;
	queueX = startX;

	for(var i = 0; i < wf_job_list.length; i++){
		ctx.fillStyle = wf_job_list[i].color;
		ctx.fillRect(queueX+5, globalY, job_width-5, height);
		ctx.strokeRect(queueX+5, globalY, job_width-5, height);
		ctx.fillStyle = "black";
		ctx.fillText(wf_job_list[i].stream, queueX+(job_width/2.5), globalY+(height/6) );
		ctx.font = "35px Tahoma";
		ctx.fillText(wf_job_list[i].size, queueX+(job_width/4), globalY+(height/1.75) );
		ctx.font = "20px Tahoma";
		ctx.fillText("Time: "+wf_job_list[i].time, queueX+(job_width/5), globalY+(height*0.95) );
		waiting_time+=wf_job_list[i].time;
		queueX+=job_width;
	}

	tempX = startX;
	tempY = globalY;

	ctx.font = "30px Tahoma";
	ctx.fillText("1. Throughput: "+tp_wf, tempX+job_width, tempY+=height*1.29 );
	if(wf_job_list.length > 1){
		ctx.fillText("2. Storage utilization (used): ", tempX+job_width, tempY+=30 );
		storage_wf+=(used/10)*100;
	} else{
		ctx.fillText("2. Storage utilization (AVE): "+((storage_wf)), tempX+job_width, tempY+=30 );
	}
	
	// ctx.fillText("2.2 Storage utilization (unused): "+((unused/wf_memory_list.length)*100)+"%", tempX+job_width, tempY+=30 );
	tempY+=30;
	tempX+=(mem_width*5);
	tempY = globalY;

	ctx.fillText("3. Waiting queue length: "+wf_job_list.length, tempX+job_width, tempY+=height*1.29 );
	ctx.fillText("4. Waiting time in queue (AVE): "+(waiting_time/wf_job_list.length), tempX+job_width, tempY+=30 );
	ctx.fillText("5. Internal Fragmentation: "+fragmentation, tempX+job_width, tempY+=30 );


	// BEST-FIT
	// if(time != 0)
	// 	tp_bf += (finished_bf/time);
	used = 0;
	unused = 0;
	waiting_time = 0;
	fragmentation = 0;
	globalY+=height+15+140;
	queueX = startX;

	ctx.font = "25px Tahoma";
	ctx.fillText("Best-Fit", startX+canvas.width/2, globalY );

	globalY+=15;


	// PROCESS 
	for( var i = 0; i < bf_memory_list.length; i++ ){
		for( var j = 0; j < bf_job_list.length; j++ ){
			if(!bf_memory_list[i].occupied()){
				if(bf_job_list[j].size <= bf_memory_list[i].size ){
					bf_memory_list[i].allocate(bf_job_list[j]);
					bf_job_list.splice(j, 1);
					break;
				}
			} else{
				break;
			}
		}
	}

	//Draw Resources
	for(var i = 0; i < bf_memory_list.length; i++){
		if(bf_memory_list[i].process == null ){
			ctx.fillStyle = "darkgray";
			unused++;
		} else{
			ctx.fillStyle = bf_memory_list[i].process.color;
			fragmentation+=bf_memory_list[i].internal_frag();
			used++;
			// used+=bf_memory_list[i].used_memory();
			// unused+=bf_memory_list[i].internal_frag();
		}
		
		ctx.fillRect(queueX+5, globalY, mem_width-10, height);
		ctx.fillStyle = "black";
		ctx.strokeRect(queueX+5, globalY, mem_width-10, height);
		ctx.font = "20px Tahoma";
		ctx.fillText(bf_memory_list[i].block, queueX+(mem_width/2), globalY+(height/5) );
		ctx.font = "35px Tahoma";
		ctx.fillText(bf_memory_list[i].getProcessStream(), queueX+(mem_width/4), globalY+(height/2) );
		ctx.font = "20px Tahoma";
		ctx.fillText(bf_memory_list[i].remaining(), queueX+(mem_width/3.2), globalY+(height*0.75) );
		if(bf_memory_list[i].process != null){
			ctx.fillText("Remaining time: "+bf_memory_list[i].process.time, queueX+(mem_width/6), globalY+(height*0.95) );
		}
		queueX+=mem_width;
	}
	globalY+=height+15;
	queueX = startX;

	for(var i = 0; i < bf_job_list.length; i++){
		ctx.fillStyle = bf_job_list[i].color;
		ctx.fillRect(queueX+5, globalY, job_width-5, height);
		ctx.strokeRect(queueX+5, globalY, job_width-5, height);
		ctx.fillStyle = "black";
		ctx.fillText(bf_job_list[i].stream, queueX+(job_width/2.5), globalY+(height/6) );
		ctx.font = "35px Tahoma";
		ctx.fillText(bf_job_list[i].size, queueX+(job_width/4), globalY+(height/1.75) );
		ctx.font = "20px Tahoma";
		ctx.fillText("Time: "+bf_job_list[i].time, queueX+(job_width/5), globalY+(height*0.95) );
		waiting_time+=bf_job_list[i].time;
		queueX+=job_width;
	}

	tempX = startX;
	tempY = globalY;

	ctx.font = "30px Tahoma";
	ctx.fillText("1. Throughput: "+tp_bf, tempX+job_width, tempY+=height*1.29 );

	if(bf_job_list.length > 1){
		ctx.fillText("2. Storage utilization (used): ", tempX+job_width, tempY+=30 );
		storage_bf+=(used/10)*100
	} else{
		ctx.fillText("2. Storage utilization (AVE): "+((storage_bf)), tempX+job_width, tempY+=30 );
	}
	// ctx.fillText("2.2 Storage utilization (unused): "+((unused/wf_memory_list.length)*100)+"%", tempX+job_width, tempY+=30 );
	tempY+=30;
	tempX+=(mem_width*5);
	tempY = globalY;

	ctx.fillText("3. Waiting queue length: "+bf_job_list.length, tempX+job_width, tempY+=height*1.29 );
	ctx.fillText("4. Waiting time in queue (AVE): "+(waiting_time/bf_job_list.length), tempX+job_width, tempY+=30 );
	ctx.fillText("5. Internal Fragmentation: "+fragmentation, tempX+job_width, tempY+=30 );
}

function processJobs(memory_list, type){
	for(var i = 0; i < memory_list.length; i++){
		memory_list[i].processed(type);
	}
}

/////////////////////////////////////////////
var jobs = JSON.parse(jobs);
var memories = JSON.parse(memories);
var newItem;
var newColor;
var ff_memory_list = [];
var ff_job_list = [];
var wf_memory_list = [];
var wf_job_list = [];
var bf_memory_list = [];
var bf_job_list = [];

var answer = [];

for(var i = 0; i < jobs.length; i++){
	newColor = randomColor({luminosity: 'light'})
	newItem = new Process(jobs[i], color = newColor);
	job_list.push(newItem);
	ff_job_list.push(new Process(jobs[i], color = newColor));
	wf_job_list.push(new Process(jobs[i], color = newColor));
	bf_job_list.push(new Process(jobs[i], color = newColor));
}

for(var i = 0; i < memories.length; i++){
	newItem = new Memory(memories[i]);
	memory_list.push(newItem);
	ff_memory_list.push(new Memory(memories[i]));
	wf_memory_list.push(new Memory(memories[i]));
	bf_memory_list.push(new Memory(memories[i]));

}

// console.log(memory_list);
// console.log(job_list);

bf_memory_list.sort(function(a, b){
	return a.size - b.size;
});

function MemoryBlocksUsed(memory_list){
	for(var i = 0; i < memory_list.length; i++){
		if(memory_list[i].occupied()){
			return false;
		}
	}
	return true;
}

var ff_flag = true;
var wf_flag = true;
var bf_flag = true;

setInterval(function(){
	Memory_Manager(15, time);
	processJobs(ff_memory_list, 1);
	processJobs(wf_memory_list, 2);
	processJobs(bf_memory_list, 3);
	// console.log(answer);
	if(MemoryBlocksUsed(ff_memory_list) && ff_flag){
		storage_ff = storage_ff/time;
		ff_flag = false;
	}

	if(MemoryBlocksUsed(wf_memory_list) && wf_flag){
		storage_wf = storage_wf/time;
		wf_flag = false;
	}

	if(MemoryBlocksUsed(bf_memory_list) && bf_flag){
		storage_bf = storage_bf/time;
		bf_flag = false;
	}

	time++;
}, 1000);


// drawResources(algorithms, sample_process);
