# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'mongo'
require 'active_support'
$KCODE = 'UTF8'

$limit = 20
$sort = {"value"=>1}
get '/' do
  erb :index
end

get '/suggest.js?:db' do
  content_type 'text/javascript', :charset => 'utf-8'
  @db = params[:db]
  erb :suggest_initialize
end

get '/js/:db/:key' do
  content_type 'text/javascript', :charset => 'utf-8'
  col = Mongo::Connection.new().db("mydb").collection(params[:db])
  key = "^"+params[:key]
  @db = params[:db]
  if (params[:key]=='*') then
    @json =  ActiveSupport::JSON.encode(col.find("key"=>"*").limit($limit))
  else 
    @json =  ActiveSupport::JSON.encode(col.find("key"=>/#{key}/).limit($limit))
  end
  erb :js
end

__END__

@@index
<h1>hello</h1>

@@suggest_initialize
$(document).bind("ready",function(){ 
  //$("#<%= @db %>").suggest1("<%= @db %>");
  alert("a");
})

@@js
suggest.show("<%= @db %>",<%= @json %>);
