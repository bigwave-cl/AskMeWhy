var items = {
	'name':'bobo',
	"age": 12,
	"sex": "male"
}
console.log(items)
_.each(items,function(index,key){
	console.log(key + ':' + index);
})
var list = [10,20,30,10,30];
console.log(list)
_.each(list,function(index){
	console.log(index);
})

var mapList = _.map(list,function(index,key,obj){
	return index*3;
})
console.log(mapList);