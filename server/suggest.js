var server="http://localhost:4567";
var menu={};
var h=$("head");
$("<script src='http://github.com/masum/caretcoord/raw/master/caretcoord.js'>").appendTo(h);
$("<script src='http://github.com/masum/suggestmenu/raw/master/suggestmenu.js'>").appendTo(h);
$("<link rel='stylesheet' type='text/css' href='http://github.com/masum/suggestmenu/raw/master/suggestmenu.css'>").appendTo(h);

$.fn.extend({
  suggest1: function(db) {
    var id=null;
    var value="";
    var js=null;
    var $this=this;
    menu[db]=new suggestMenu({
      field:this,
      id:db,
      onclick:function(item) {
        console.log("onclick");
        f=$this.get(0);
        var v=f.value;
        f.value=item.value;
      }
    });
    h=$("head");
    this.bind("focus",function(e) {
      id=setInterval(function() {
        var v=e.target.value;
        if (value!=v) {
          value=v;
          if(js!=null) {
            js.remove();
          }
          js=$("<script src='"+server+"/js/"+db+"/"+v+"'>").appendTo(h);
        }
      },100);
    }).bind("blur",function(e) {
      clearInterval(id);
    });
  },
  suggest2: function(db) {
    var id=null;
    var value="";
    var js=null;
    var $this=this;
    menu[db]=new suggestMenu({
      field:this,
      id:db,
      onclick:function(item) {
        f=$this.get(0);
        var v=f.value;
        var caret=f.selectionEnd;
        value=v.substring(0,caret)+item.value+v.substring(caret);
        f.value=value;
      },
      onremake:function() {
        var v=($this.attr("value")=="")?"*":$this.attr("value");
        if (js!=null) js.remove();
        js=$("<script src='"+server+"/js/"+db+"/"+v+"'>").appendTo(h);
      }
    });
    h=$("head");
    this.bind("focus",function(e) {
      if (e.target.value=="") {
        js=$("<script src='"+server+"/js/"+db+"/*'>").appendTo(h);
      }
      id=setInterval(function() {
        var v=e.target.value;
        if (value!=v) {
          value=v;
          if(js!=null) {
            js.remove();
          }
          if (v=="") {v="*"}
          js=$("<script src='"+server+"/js/"+db+"/"+v+"'>").appendTo(h);
        }
      },100);
    }).bind("blur",function(e) {
      clearInterval(id);
    });
  }
});
var suggest={
  show: function(db,j) {
    console.log(j);
    menu[db].show(j);
  }
}