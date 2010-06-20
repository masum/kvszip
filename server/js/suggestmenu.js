function suggestMenu(param) {
  this.$this=this;
  this.current=-1;
  this.KEYDOWN=40;
  this.KEYUP=38;
  this.KEYENTER=13;
  this.KEYESCAPE=27;
  this.KEYTAB=9;
  this.menu=null;
  this.list=[];
  this.onclick=param.onclick;
  this.onremake=param.onremake;
  this.field=param.field;
  this.caret=null;
  this.id="pmenu_"+param.id;
  this.createMenu();
}
suggestMenu.prototype.createMenu=function() {
  var $this=this;
  this.menu=$("<div class='smenu' style='position:absolute'>").appendTo($("body"));
  this.menu.hide();
  this.menu.attr("id",this.id);

  this.caret=new caretcoord(this.field.get(0));
/*
  $(".smenu_item").live("click",function() {
    var idx=this.id.match(/[0-9]+/);
    $this.onselect(idx);
    $this.clearMenu();
  }).live("mouseover",function() {
    $(this).addClass("smenu_item_selection");
  }).live("mouseout",function() {
    $(this).removeClass("smenu_item_selection");
  });
*/
  this.field.bind("focus",function() {
  
  }).bind("blur",function() {
    $this.clearMenu();
  }).bind("change",function() {
  
  }).bind("keyup",function(e) {

  }).bind("keydown",function(e) {
    switch(e.keyCode) {
    case $this.KEYESCAPE:
      $this.clearMenu();
      break;
    case $this.KEYDOWN:
      return $this.toggleMenu("down");
    case $this.KEYUP:
      return $this.toggleMenu("up");
    case $this.KEYTAB:
      return $this.toggleMenu("down");
    case $this.KEYENTER:
      if ($this.existMenu()) {
        $this.onselect(null);
        $this.clearMenu();
        return false;
      }
    }
  });
}
suggestMenu.prototype.toggleMenu=function(func) {
  var $this=this;
  function toggle(f) {
    if (f=="down"){
      $this.toggleDown();
    }else if(f=="up"){
      $this.toggleUp();
    }else if(f=="tag"){
      $this.toggleDown();
    }
  }
  if ($this.field.attr("tagName")=="INPUT") {
    if ($this.existMenu()) {
      toggle(func);
    }else{
      $this.onremake();
    }
    return false;
  } else {
    if ($this.existMenu()) {
      toggle(func);
      return false;
    }
  }
  return true;
}
suggestMenu.prototype.show=function(list) {
  if (list!=null) {
    this.list = list;
  }
  this.current=-1;
  $("#"+this.id+" .smenu_item").remove();
  this.remakeMenuItem(this.list);
  var pos=this.caret.getCaretCoord();
  this.menu.css({left:pos.x+10,top:pos.y+15}).show();
}
suggestMenu.prototype.remakeMenuItem=function(list) {
  var $this=this;
  $.each(list,function(i,v) {
    var item=$("<div class='smenu_item'>").text(v.value).appendTo($this.menu);
    item.attr("id","smenu_"+i);
  });
}
suggestMenu.prototype.clearMenu=function() {
  $(document).unbind("click",this.clearMenu);
  $("#"+this.id).hide();
}
suggestMenu.prototype.existMenu=function() {
  if ($("#"+this.id).css("display")=="none") {
    return false;
  }else{
    return true;
  }
}
suggestMenu.prototype.itemFocus=function() {
  $(".smenu_item_selection").removeClass("smenu_item_selection");
  $($(".smenu_item")[this.current]).addClass("smenu_item_selection");
}
suggestMenu.prototype.toggleDown=function() {
  if (this.current< (this.list.length-1)) {
    this.current+=1;
  }else{
    this.current=0;
  }
  this.itemFocus();
}
suggestMenu.prototype.toggleUp=function() {
  if (this.current<=0) {
    this.current=this.list.length-1;
  }else{
    this.current-=1;
  }
  this.itemFocus();
}
suggestMenu.prototype.onselect=function(idx) {
  var index=(idx==null)?this.current:idx;
  this.onclick(this.list[index]);
}
