

var budgetController = (function(){
	var Expence=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};

	Expence.prototype.calcPercentage =function(){
		if(data.total.inc>0)
			this.percentage=Math.round((this.value/data.total.inc)*100);
	};

	var Income =function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
	};
	var data={
		allItems :{
			exp:[],
			inc:[]
		},
		total :{
			exp:0,
			inc:0
		},
		netBudget:0,
		percent:-1
	};
	calculateTotal =function(type){
		var sum=0;
		data.allItems[type].forEach(function(current){
			sum+=current.value;
		});
		data.total[type]=sum;
	};
	return {
		addItem :function(type,description,value){
			var ID, newItem;
			if(data.allItems[type].length==0){
				ID=0;
			}
			else{
				ID=data.allItems[type][data.allItems[type].length-1].id+1;
			}
			
			if(type=="inc")
			{
				newItem=new Income(ID,description,value);
			}
			else{
				newItem=new Expence(ID,description,value);
			}
			data.allItems[type].push(newItem);

			return newItem;
		}, 

		deleteItem : function(typr,id){
			var ids,index;

			ids=data.allItems[type].map(function(current){
				return current.id;
			});
			index=ids.indexOf(id);
			if(index !=-1)
			{
				data.allItems[type].splice(index,1);
			}
			
		},

		calculateBudget : function(){
			
			calculateTotal('inc');
			calculateTotal('exp');
			data.netBudget = data.total.inc - data.total.exp;
			if(data.total.inc>0){
				data.percent= Math.round((data.total.exp/data.total.inc)*100);
			}
			
			else{
				data.percent=-1; 
			}
		},

		calculatePercentages:function(){
			data.allItems.exp.forEach(function(current){
				current.calcPercentage();
			});
		},

		getBudget : function(){
			return{
				total :{
					exp:data.total.exp,
					inc:data.total.inc
				},
				netBudget:data.netBudget,
				percent:data.percent
			}
		},

		getPercentages: function(){
			var allPercent=data.allItems.exp.map(function(current){
				return current.percentage;
			});
			return allPercent;
		},

		test: function(){
			console.log(data);
		}
	};
})();

var uiController = (function(){

	    return{
			getInput : function(){
				return {
					type:document.querySelector('.add__type').value,
					description:document.querySelector('.add__description').value, 
					value:parseFloat(document.querySelector('.add__value').value)
				}
		    },

		    addListItem : function(newItem,type){
		    	var html,newHtml,element;
		    	if(type=='inc'){
		    		element='.income__list';
		    		html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		    	}
		    	else{
		    		element='.expenses__list'
		    		html='<div class="item clearfix"id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
		    	}

		    	//VERY IMPORTANT PART OF PROJECT 
		    	//INSERT THE ITEM AT THE CORRECT POSITION 
		    	newHtml=html.replace('%id%',newItem.id);
		    	newHtml=newHtml.replace('%description%',newItem.description);
		    	newHtml=newHtml.replace('%value%',newItem.value);
		    	document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		    },

		    deleteListItem: function(itemID){
		    	var e=document.getElementById(itemID);
		    	e.parentNode.removeChild(e);
		    },

		    clearField : function(){
		    	var fields,fieldsArr;
		    	fields=document.querySelectorAll('.add__description,.add__value');
		    	fieldsArr=Array.prototype.slice.call(fields);
		    	fieldsArr.forEach(function(current,index,array){
		    		current.value="";
		    	});
		    },
		    displayBudget : function(budget){
		    	document.querySelector('.budget__income--value').textContent=budget.total.inc;
		    	document.querySelector('.budget__expenses--value').textContent=budget.total.exp;
		    	document.querySelector('.budget__value').textContent=budget.netBudget;
		    	document.querySelector('.budget__expenses--percentage').textContent=budget.percent;

		    	if(budget.percent>0){
		    		document.querySelector('.budget__expenses--percentage').textContent=budget.percent+'%';
		    	}
		    	else{
		    		document.querySelector('.budget__expenses--percentage').textContent='---';
		    	}
		    } ,
		    displayPercentages : function(percentages){
		    	var fields=document.querySelectorAll("item__percentage");
		    	var nodeListForEach=function(fields,hh){
		    		for(var i=0;i<fields.length;i++){
		    			hh(fields[i],i);
		    		}
		    	}
		    	hh=function(current,index)
		    	{
		    		current.textContent=percentages[index];
		    	}
		    }
	};
	
})();

var controller =(function(uictrl,budgetctrl){
	init=function(){
		uictrl.displayBudget({
			total:{
				inc:0,
				exp:0
			},
			netBudget:0,
			percent:-1
		});
		setupEventListeners();
	};
	setupEventListeners= function(){
		document.querySelector('.add__btn').addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event){
			if(event.keyCode==13){
				ctrlAddItem();
		    }
		});	
		document.querySelector('.container').addEventListener('click',ctrlDeleteItem);
	};
	var ctrlAddItem = function(){
		//get input 
		var input =uictrl.getInput();
		//add item to budget
		var newItem=budgetctrl.addItem(input.type,input.description,input.value);
		//add new item to UI
		uictrl.addListItem(newItem,input.type);
		//clear the fields in ui
		uictrl.clearField();
		//update the budget
		updateBudget();
		updatePercentages();
	};
	var ctrlDeleteItem=function(event){
		var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitID=itemID.split('-');
			type=splitID[0];
			ID=parseInt(splitID[1]);

			budgetctrl.deleteItem(type,ID);
			uictrl.deleteListItem(itemID);
			updateBudget();
			updatePercentages();

		}
		
	};
	var updateBudget= function(){
		budgetctrl.calculateBudget();
		var budget=budgetctrl.getBudget();
		uictrl.displayBudget(budget);
		
	};
	updatePercentages= function(){
		budgetctrl.calculatePercentages();

		var percentages=budgetctrl.getPercentages();
		console.log(percentages);
		//uictrl.displayPercentages();
	} 
	
})(uiController,budgetController);

init();