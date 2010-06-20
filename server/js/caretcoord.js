function caretcoord(elm) {
  this.field=elm;
  this.id=this.field.id + "_caretcoord";
  this.pre=document.createElement("pre");
  document.getElementsByTagName("body")[0].appendChild(this.pre);
  var styleOrg=getComputedStyle(this.field,"");
  var styleCpy=getComputedStyle(this.pre,"");
  function capitalize(prop){
    return prop.replace(/-(.)/g, function(m, m1){
      return m1.toUpperCase()
    })
  };
  var properties=[
    'width', 'height',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 
    'border-left-style', 'border-right-style','border-top-style','border-bottom-style', 
    'border-left-width', 'border-right-width','border-top-width','border-bottom-width', 
    'font-family', 'font-size', 'line-height', 'letter-spacing', 'word-spacing'];
  for(var i in properties){
    this.pre.style[capitalize(properties[i])] = 
	           styleOrg.getPropertyValue(properties[i]);
  };
  this.pre.style.left=this.field.offsetLeft+"px"; 
  this.pre.style.top=this.field.offsetTop+"px";
  this.pre.style.width=this.field.offsetWidth;
  this.pre.style.height=this.field.offsetHeight;
  this.pre.style.visibility = "hidden";
  this.pre.style.position = "absolute";
  this.pre.scrollLeft=this.field.scrollLeft;
  this.pre.scrollTop=this.field.scrollTop;
}
caretcoord.prototype.getCaretCoord = function() {
  var end = this.field.selectionEnd;
  var value = this.field.value;
  var cursor = document.createElement('span');
  cursor.innerHTML = "|";
  this.pre.innerHTML = '';
  this.pre.appendChild(document.createTextNode(value.substr(0,end)));
  this.pre.appendChild(cursor);
  var w = this.field.offsetLeft + this.field.offsetWidth;
  var x = this.field.offsetLeft + cursor.offsetLeft +2;
  if (w<x) {
    x=w;
  }
  var y = this.field.offsetTop + cursor.offsetTop -2;
  return {x:x,y:y}
}
